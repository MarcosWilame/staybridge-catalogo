import { assertSameOrigin, requireAdmin, supabaseRequest } from './_admin.js';
import { applyApiSecurityHeaders, enforceRateLimit } from './_security.js';
import { validateAdminProperties, validateAdminProperty } from './_property-validation.js';

const TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';

async function readRows(token) {
  const response = await supabaseRequest(`/rest/v1/${TABLE}?select=id,data&order=id.asc`, { token });
  if (!response.ok) throw new Error('Unable to load properties');
  return response.json();
}

export default async function handler(req, res) {
  applyApiSecurityHeaders(res);
  res.setHeader('Cache-Control', 'no-store');
  if (!enforceRateLimit(req, res, { limit: 180, namespace: 'admin-properties' })) return;
  if (req.method !== 'GET' && !assertSameOrigin(req)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readRows(admin.accessToken));
    }

    if (req.method === 'POST') {
      const property = validateAdminProperty(req.body?.property);
      const response = await supabaseRequest(`/rest/v1/${TABLE}?on_conflict=id`, {
        token: admin.accessToken,
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: [{ id: property.id, data: property }],
      });
      if (!response.ok) throw new Error('Unable to save property');
      return res.status(200).json(await response.json());
    }

    if (req.method === 'PUT') {
      const properties = validateAdminProperties(req.body?.properties);
      const existing = await readRows(admin.accessToken);
      const existingById = new Map(existing.map((row) => [Number(row.id), row]));
      for (const property of properties) {
        const existingRow = existingById.get(property.id);
        const existingCompany = String(existingRow?.data?.company || 'EasyShare').trim();
        if (existingRow && existingCompany !== property.company) {
          throw new Error(`ID ${property.id} já pertence à empresa ${existingCompany}`);
        }
      }
      const response = await supabaseRequest(`/rest/v1/${TABLE}?on_conflict=id`, {
        token: admin.accessToken,
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: properties.map((property) => ({ id: property.id, data: property })),
      });
      if (!response.ok) throw new Error('Unable to import properties');
      const importedIds = new Set(properties.map((property) => property.id));
      const importedCompanies = new Set(properties.map((property) => property.company));
      for (const row of existing) {
        if (importedIds.has(Number(row.id))) continue;
        const rowCompany = String(row.data?.company || 'EasyShare').trim();
        if (!importedCompanies.has(rowCompany)) continue;
        const deleteResponse = await supabaseRequest(`/rest/v1/${TABLE}?id=eq.${encodeURIComponent(row.id)}`, {
          token: admin.accessToken,
          method: 'DELETE',
        });
        if (!deleteResponse.ok) throw new Error('Unable to remove stale property');
      }
      return res.status(200).json(await response.json());
    }

    if (req.method === 'DELETE') {
      const id = Number(req.query?.id);
      if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid property ID' });
      const response = await supabaseRequest(`/rest/v1/${TABLE}?id=eq.${id}`, {
        token: admin.accessToken,
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Unable to delete property');
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin properties request failed', error instanceof Error ? error.name : 'Unknown');
    return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid request' });
  }
}
