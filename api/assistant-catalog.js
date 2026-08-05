import { toPublicProperty } from './public-property-fields.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const LEGACY_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';

function formatProperty(property) {
  const availability = property.available
    ? 'Disponível agora / Available now'
    : `Entrada futura / Future move-in: ${property.moveInDate || 'data não informada'}`;

  return [
    `ID: ${property.id}`,
    `Título / Title: ${property.title || 'não informado'}`,
    `Tipo / Type: ${property.type || 'não informado'}`,
    `Categoria / Category: ${property.category || 'não informada'}`,
    `Área / Area: ${property.localArea || 'não informada'}`,
    `Região / Region: ${property.region || 'não informada'}`,
    `Postcode: ${property.postcode || 'não informado'}`,
    `Preço semanal / Weekly price: ${property.price || 'não informado'}`,
    `Capacidade / Capacity: ${property.people || 'não informada'} pessoa(s)`,
    `Data de entrada / Move-in date: ${property.moveInDate || 'não informada'}`,
    `Disponibilidade atual / Current availability: ${availability}`,
    `Quartos / Bedrooms: ${property.bedrooms ?? 0}`,
    `Banheiros / Bathrooms: ${property.bathrooms ?? 0}`,
    `Mobiliado / Furnishing: ${property.furnishing || 'não informado'}`,
    `Bills incluídas / Bills included: ${property.billsIncluded ? 'sim / yes' : 'não / no'}`,
    `Comodidades / Amenities: ${(property.amenities || []).join(', ') || 'não informadas'}`,
    `Descrição / Description: ${property.description || property.longDescription || 'não informada'}`,
    `Pontos próximos / Nearby: ${(property.nearbyStations || []).join('; ') || 'não informados'}`,
  ].join('\n');
}

async function loadPublicProperties() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  let response = LEGACY_SERVICE_KEY
    ? await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id,data&order=id.asc`, {
      headers: {
        apikey: LEGACY_SERVICE_KEY,
        Authorization: `Bearer ${LEGACY_SERVICE_KEY}`,
        Accept: 'application/json',
      },
    })
    : null;

  if (!response?.ok) {
    response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_public_properties`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{}',
    });
  }

  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(toPublicProperty).filter(Boolean) : [];
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  if (!enforceRateLimit(req, res, { limit: 60, namespace: 'assistant-catalog' })) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).send('Method not allowed');
  }

  try {
    const properties = await loadPublicProperties();
    if (!properties) return res.status(500).send('Catalog unavailable');

    const body = [
      'Staybridge London, public property catalog.',
      'This feed contains only properties currently visible in the public website.',
      'Use the move-in date to determine current availability. Do not invent or add properties that are not listed below.',
      '',
      `Total visible properties: ${properties.length}`,
      '',
      ...properties.map((property) => `${formatProperty(property)}\n---`),
    ].join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    return res.status(200).send(body);
  } catch {
    return res.status(500).send('Catalog unavailable');
  }
}
