import { toPublicProperty } from './public-property-fields.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

const SUPABASE_TABLE =
  process.env.SUPABASE_PROPERTIES_TABLE ||
  process.env.VITE_SUPABASE_PROPERTIES_TABLE ||
  'properties';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_TABLE) {
    return res.status(500).json({
      error: 'Supabase server config missing',
    });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id,data&order=id.asc`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Supabase public properties request failed', response.status);
      return res.status(502).json({ error: 'Failed to load properties' });
    }

    const rows = await response.json();

    const properties = Array.isArray(rows)
      ? rows.map(toPublicProperty).filter(Boolean)
      : [];

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    );

    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).json(properties);
  } catch (error) {
    console.error('Unexpected public properties error', error instanceof Error ? error.name : 'Unknown');
    return res.status(500).json({ error: 'Failed to load properties' });
  }
}
