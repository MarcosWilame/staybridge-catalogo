import { assertSameOrigin, getSupabaseConfig, requireAdmin, supabaseRequest } from './_admin.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.VITE_SUPABASE_STORAGE_BUCKET || 'property-images';
const IMAGE_TYPES = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']);
const VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

function sanitizePath(value) {
  return String(value || '')
    .replace(/\\/g, '/')
    .split('/')
    .map((part) => part.trim().replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/')
    .slice(0, 800);
}

function encodePath(value) {
  return value.split('/').map(encodeURIComponent).join('/');
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  res.setHeader('Cache-Control', 'no-store');
  if (!enforceRateLimit(req, res, { limit: 240, namespace: 'admin-storage' })) return;
  if (req.method !== 'GET' && !assertSameOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  if (req.method === 'GET') {
    const prefix = sanitizePath(req.query?.prefix || '');
    const response = await supabaseRequest(`/storage/v1/object/list/${encodeURIComponent(BUCKET)}`, {
      token: admin.accessToken,
      method: 'POST',
      body: { limit: 100, offset: 0, prefix, sortBy: { column: 'name', order: 'asc' } },
    });
    if (!response.ok) return res.status(502).json({ error: 'Unable to list storage' });
    return res.status(200).json(await response.json());
  }

  if (req.method === 'POST' && req.body?.action === 'sign-upload') {
    const path = sanitizePath(req.body?.path);
    const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType.toLowerCase() : '';
    const size = Number(req.body?.size);
    const isImage = IMAGE_TYPES.has(mimeType) && size > 0 && size <= 12 * 1024 * 1024;
    const isVideo = VIDEO_TYPES.has(mimeType) && size > 0 && size <= 200 * 1024 * 1024;
    if (!path || (!isImage && !isVideo)) return res.status(400).json({ error: 'Invalid upload' });

    const response = await supabaseRequest(
      `/storage/v1/object/upload/sign/${encodeURIComponent(BUCKET)}/${encodePath(path)}`,
      {
        token: admin.accessToken,
        method: 'POST',
        body: { upsert: true },
      }
    );
    if (!response.ok) return res.status(502).json({ error: 'Unable to authorize upload' });
    const signed = await response.json();
    const { url } = getSupabaseConfig();
    const uploadPath = signed.url || signed.signedURL || '';
    const uploadUrl = uploadPath.startsWith('http') ? uploadPath : `${url}/storage/v1${uploadPath}`;
    let token = signed.token || '';
    if (!token && uploadUrl) {
      try {
        token = new URL(uploadUrl).searchParams.get('token') || '';
      } catch {
        token = '';
      }
    }
    if (!token) return res.status(502).json({ error: 'Invalid upload authorization' });
    return res.status(200).json({ token, path });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}
