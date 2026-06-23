import { parseCookies, ADMIN_SESSION_COOKIE, verifyAdminToken } from './_admin.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.VITE_SUPABASE_STORAGE_BUCKET || 'property-images';
let publishedPathsCache = { expiresAt: 0, paths: new Set() };

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

function encodePath(value) {
  return value.split('/').map(encodeURIComponent).join('/');
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
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    return index >= 0 ? sanitizePath(decodeURIComponent(url.pathname.slice(index + marker.length))) : '';
  } catch {
    return '';
  }
}

async function getPublishedPaths() {
  const now = Date.now();
  if (publishedPathsCache.expiresAt > now) return publishedPathsCache.paths;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=data&order=id.asc`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error('Unable to verify media');
  const rows = await response.json();
  const paths = new Set();
  for (const row of Array.isArray(rows) ? rows : []) {
    if (row?.data?.listed !== true) continue;
    const values = [row.data.image, row.data.video, ...(Array.isArray(row.data.images) ? row.data.images : [])];
    for (const value of values) {
      const path = extractStoragePath(value);
      if (path) paths.add(path);
    }
  }
  publishedPathsCache = { expiresAt: now + 30_000, paths };
  return paths;
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  if (!enforceRateLimit(req, res, { limit: 300, namespace: 'property-media' })) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const path = sanitizePath(req.query?.path);
  if (!path || !SUPABASE_URL || !SERVICE_KEY) return res.status(404).end();

  const cookies = parseCookies(req);
  const isAdmin = Boolean(await verifyAdminToken(cookies[ADMIN_SESSION_COOKIE] || ''));
  if (!isAdmin) {
    const publishedPaths = await getPublishedPaths().catch(() => new Set());
    if (!publishedPaths.has(path)) return res.status(404).end();
  }

  const signedResponse = await fetch(
    `${SUPABASE_URL}/storage/v1/object/sign/${encodeURIComponent(BUCKET)}/${encodePath(path)}`,
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
  const location = signedPath.startsWith('http') ? signedPath : `${SUPABASE_URL}/storage/v1${signedPath}`;
  res.setHeader(
    'Cache-Control',
    isAdmin ? 'private, no-store' : 'public, s-maxage=300, stale-while-revalidate=600'
  );
  res.setHeader('Location', location);
  return res.status(302).end();
}
