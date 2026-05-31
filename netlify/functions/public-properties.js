const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
).replace(/\/$/, '');

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  '';

const SUPABASE_TABLE =
  process.env.SUPABASE_PROPERTIES_TABLE ||
  process.env.VITE_SUPABASE_PROPERTIES_TABLE ||
  'properties';

function resolveSupabaseSecretKey() {
  const key = SUPABASE_SERVICE_KEY.trim();
  const jwtStart = key.indexOf('eyJ');

  return jwtStart > 0 ? key.slice(jwtStart) : key;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return {
      ...json(405, { error: 'Method not allowed' }),
      headers: {
        ...json(405, {}).headers,
        Allow: 'GET',
      },
    };
  }

  const serviceKey = resolveSupabaseSecretKey();

  const missingConfig = [
    !SUPABASE_URL && 'VITE_SUPABASE_URL or SUPABASE_URL',
    !serviceKey && 'SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY',
    !SUPABASE_TABLE && 'VITE_SUPABASE_PROPERTIES_TABLE or SUPABASE_PROPERTIES_TABLE',
  ].filter(Boolean);

  if (missingConfig.length) {
    return json(500, {
      error: 'Supabase server config missing',
      missing: missingConfig,
    });
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id,data&order=id.asc`,
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
      return json(response.status, {
        error: detail || 'Failed to load properties',
      });
    }

    const rows = await response.json();
    const properties = Array.isArray(rows)
      ? rows
          .map((row) => {
            const data =
              row?.data && typeof row.data === 'object' ? row.data : {};

            return {
              ...data,
              id: Number(data.id || row.id),
            };
          })
          .filter((property) => property.listed !== false)
      : [];

    return json(200, properties);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    return json(500, { error: message });
  }
}
