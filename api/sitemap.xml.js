const SITE_URL = (process.env.SITE_URL || 'https://staybridgelondon.com').replace(/\/$/, '');
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';
const SUPABASE_TABLE =
  process.env.SUPABASE_PROPERTIES_TABLE ||
  process.env.VITE_SUPABASE_PROPERTIES_TABLE ||
  'properties';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadPropertyIds() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_TABLE) return [];

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

  if (!response.ok) return [];

  const rows = await response.json();
  return Array.isArray(rows)
    ? rows
        .map((row) => ({
          id: Number(row?.data?.id || row?.id),
          listed: row?.data?.listed,
        }))
        .filter((property) => Number.isFinite(property.id) && property.listed !== false)
        .map((property) => property.id)
    : [];
}

export default async function handler(req, res) {
  const now = new Date().toISOString();
  const propertyIds = await loadPropertyIds();
  const staticPaths = ['/', '/properties', '/profile'];
  const propertyPaths = propertyIds.map((id) => `/property/${id}`);
  const urls = [...staticPaths, ...propertyPaths]
    .map(
      (path) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${path.startsWith('/property/') ? 'weekly' : 'daily'}</changefreq>
    <priority>${path === '/' ? '1.0' : path === '/properties' ? '0.9' : '0.7'}</priority>
  </url>`
    )
    .join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
}
