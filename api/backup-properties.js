import { applyApiSecurityHeaders } from './_security.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
const CRON_SECRET = process.env.CRON_SECRET || '';

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!CRON_SECRET || req.headers.authorization !== `Bearer ${CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!SUPABASE_URL || !SERVICE_KEY) return res.status(500).json({ error: 'Server config missing' });

  const headers = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
  };
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id,data&order=id.asc`, {
    headers: { ...headers, Accept: 'application/json' },
  });
  if (!response.ok) return res.status(502).json({ error: 'Backup read failed' });
  const rows = await response.json();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const upload = await fetch(
    `${SUPABASE_URL}/storage/v1/object/backups/properties/${timestamp}.json`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': '0',
        'x-upsert': 'false',
      },
      body: JSON.stringify({ createdAt: new Date().toISOString(), rows }),
    }
  );
  if (!upload.ok) return res.status(502).json({ error: 'Backup upload failed' });
  return res.status(200).json({ ok: true, records: Array.isArray(rows) ? rows.length : 0 });
}
