import { parseCookies, ADMIN_SESSION_COOKIE, verifyAdminToken } from './_admin.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.VITE_SUPABASE_STORAGE_BUCKET || 'property-images';

function sanitizePath(value) {
  const decoded = String(value || '').slice(0, 1_200);
  if (!decoded || decoded.includes('..') || decoded.startsWith('/')) return '';
  return decoded
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('/');
}

export function encodeStoragePath(value) {
  // Supabase signs the literal object key. encodeURIComponent changes commas
  // into part of the key; encodeURI matches Storage's own URL construction.
  return value
    .split('/')
    .map((part) => encodeURI(part).replace(/\?/g, '%3F').replace(/#/g, '%23'))
    .join('/');
}

function extractStoragePath(value) {
  if (typeof value !== 'string') return '';
  if (value.startsWith('/api/property-media?')) {
    try {
      return sanitizePath(new URL(value, 'https://staybridgelondon.com').searchParams.get('path'));
    } catch {
      return '';
    }
  }
  try {
    const url = new URL(value);
    const markers = [
      `/storage/v1/object/public/${BUCKET}/`,
      `/storage/v1/object/sign/${BUCKET}/`,
      `/storage/v1/object/authenticated/${BUCKET}/`,
    ];
    const marker = markers.find((entry) => url.pathname.includes(entry));
    return marker
      ? sanitizePath(decodeURIComponent(url.pathname.slice(url.pathname.indexOf(marker) + marker.length)))
      : '';
  } catch {
    return '';
  }
}

async function getProperty(id) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id,data&id=eq.${id}&limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

function getReferencedMedia(row, slot, index) {
  if (!row?.data || typeof row.data !== 'object') return '';
  if (slot === 'cover') return row.data.image || row.data.images?.[0] || '';
  if (slot === 'video') return row.data.video || '';
  if (slot === 'image' && Number.isInteger(index) && index >= 0 && index < 15) {
    return Array.isArray(row.data.images) ? row.data.images[index] || '' : '';
  }
  return '';
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  if (!enforceRateLimit(req, res, { limit: 300, namespace: 'property-media' })) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(404).end();

  const cookies = parseCookies(req);
  const isAdmin = Boolean(
    await verifyAdminToken(cookies[ADMIN_SESSION_COOKIE] || '', { requireAal2: false })
  );
  let path = '';
  const id = Number(req.query?.id);
  const slot = String(req.query?.slot || '');
  const index = Number(req.query?.index);

  if (Number.isSafeInteger(id) && id > 0 && ['cover', 'image', 'video'].includes(slot)) {
    const row = await getProperty(id).catch(() => null);
    if (!row || (!isAdmin && row.data?.listed !== true)) return res.status(404).end();
    path = extractStoragePath(getReferencedMedia(row, slot, index));
  } else if (isAdmin) {
    path = sanitizePath(req.query?.path);
  }
  if (!path) return res.status(404).end();

  const signedResponse = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(BUCKET)}/${encodeStoragePath(path)}`,
    {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn: isAdmin ? 600 : 3600 }),
    }
  );
  if (!signedResponse.ok) return res.status(404).end();
  const signed = await signedResponse.json();
  const signedPath = signed.signedURL || signed.signedUrl || '';
  if (!signedPath) return res.status(404).end();
  let location;
  try {
    // Keep the exact path bytes returned by Storage. URL normalization can
    // change signed paths with spaces/parentheses and invalidate the token.
    const rawLocation = signedPath.startsWith('http')
      ? signedPath
      : `${SUPABASE_URL}/storage/v1${signedPath.startsWith('/') ? '' : '/'}${signedPath}`;
    location = encodeURI(rawLocation);
    new URL(location);
  } catch {
    return res.status(404).end();
  }
  // A cached redirect can outlive or invalidate its signed token at the CDN edge.
  // Cache the image response in the browser/CDN instead; always mint a fresh redirect.
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  res.setHeader('Location', location);
  return res.status(302).end();
}
