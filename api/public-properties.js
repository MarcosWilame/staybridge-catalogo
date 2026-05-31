const RAW_SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

const SUPABASE_TABLE =
  process.env.SUPABASE_PROPERTIES_TABLE ||
  process.env.VITE_SUPABASE_PROPERTIES_TABLE ||
  'properties';

function resolveSupabaseUrl() {
  const dashboardProjectMatch = RAW_SUPABASE_URL.match(
    /supabase\.com\/dashboard\/project\/([a-z0-9]+)/i
  );

  if (dashboardProjectMatch?.[1]) {
    return `https://${dashboardProjectMatch[1]}.supabase.co`;
  }

  return RAW_SUPABASE_URL;
}

function resolveSupabaseSecretKey() {
  const key = SUPABASE_SERVICE_KEY.trim();
  const jwtStart = key.indexOf('eyJ');

  return jwtStart > 0 ? key.slice(jwtStart) : key;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const serviceKey = resolveSupabaseSecretKey();
  const supabaseUrl = resolveSupabaseUrl();

  if (!supabaseUrl || !serviceKey || !SUPABASE_TABLE) {
    return res.status(500).json({
      error: 'Supabase server config missing',
    });
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${SUPABASE_TABLE}?select=id,data&order=id.asc`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      const detail = await response.text();

      return res.status(response.status).json({
        error: detail || 'Failed to load properties',
      });
    }

    const rows = await response.json();

    const properties = Array.isArray(rows)
      ? rows.map((row) => {
          const data =
            row?.data && typeof row.data === 'object'
              ? row.data
              : {};

          return {
            ...data,
            id: Number(data.id || row.id),
          };
        }).filter((property) => property.listed !== false)
      : [];

    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, max-age=0'
    );

    res.setHeader('X-Content-Type-Options', 'nosniff');

    return res.status(200).json(properties);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error';

    return res.status(500).json({
      error: message,
    });
  }
}
