import { toPublicProperty } from './public-property-fields.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');

const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const LEGACY_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  if (!enforceRateLimit(req, res, { limit: 90, namespace: 'public-properties' })) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({
      error: 'Supabase server config missing',
    });
  }

  try {
    let response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_public_properties`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: '{}',
      }
    );

    if (!response.ok && LEGACY_SERVICE_KEY) {
      response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id,data&order=id.asc`, {
        headers: {
          apikey: LEGACY_SERVICE_KEY,
          Authorization: `Bearer ${LEGACY_SERVICE_KEY}`,
          Accept: 'application/json',
        },
      });
    }

    if (!response.ok) {
      console.error('Supabase public properties request failed', response.status);
      return res.status(502).json({ error: 'Failed to load properties' });
    }

    const rows = await response.json();

    const properties = Array.isArray(rows)
      ? rows.map(toPublicProperty).filter(Boolean)
      : [];

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');

    return res.status(200).json(properties);
  } catch (error) {
    console.error('Unexpected public properties error', error instanceof Error ? error.name : 'Unknown');
    return res.status(500).json({ error: 'Failed to load properties' });
  }
}
