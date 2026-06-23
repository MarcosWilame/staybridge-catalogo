const SITE_URL = (process.env.SITE_URL || 'https://staybridgelondon.com').replace(/\/$/, '');
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const LEGACY_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeLastModified(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

async function loadPropertyEntries() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

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

  if (!response.ok) return [];

  const rows = await response.json();
  return Array.isArray(rows)
    ? rows
        .map((row) => ({
          id: Number(row?.data?.id || row?.id),
          listed: row?.data?.listed,
          lastmod: normalizeLastModified(
            row?.data?.updatedAt || row?.data?.updated_at || row?.data?.lastModified
          ),
        }))
        .filter((property) => Number.isFinite(property.id) && property.listed === true)
        .filter(
          (property, index, entries) =>
            entries.findIndex((candidate) => candidate.id === property.id) === index
        )
    : [];
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  if (!enforceRateLimit(req, res, { limit: 30, namespace: 'sitemap' })) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const propertyEntries = await loadPropertyEntries();
  const staticEntries = ['/', '/properties'].map((path) => ({ path, lastmod: '' }));
  const propertyPaths = propertyEntries.map(({ id, lastmod }) => ({
    path: `/property/${id}`,
    lastmod,
  }));
  const urls = [...staticEntries, ...propertyPaths]
    .map(
      ({ path, lastmod }) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${
      lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
    }
  </url>`
    )
    .join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.setHeader('X-Robots-Tag', 'noindex');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
}
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';
