import fs from 'node:fs/promises';

const apply = process.argv.includes('--apply');
const env = await fs.readFile('.env.local', 'utf8');
const values = Object.fromEntries(env.split(/\r?\n/).filter(Boolean).map((line) => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
}));
const url = (values.SUPABASE_URL || values.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = values.SUPABASE_SERVICE_ROLE_KEY || values.SUPABASE_SERVICE_KEY || '';
const table = values.SUPABASE_PROPERTIES_TABLE || values.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
if (!url || !key) throw new Error('Supabase server configuration is missing');
const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json', 'Content-Type': 'application/json' };

const response = await fetch(`${url}/rest/v1/${table}?select=id,data&order=id.asc`, { headers });
if (!response.ok) throw new Error(`Supabase returned ${response.status}`);
const rows = await response.json();

function categoryOf(data) {
  const raw = `${data.category || ''} ${data.type || ''}`.toLowerCase();
  if (raw.includes('ensuite')) return 'ensuite';
  if (raw.includes('studio')) return 'studio';
  if (raw.includes('double')) return 'double';
  if (raw.includes('single')) return 'single';
  if (raw.includes('flat') || raw.includes('bedroom')) return 'flat';
  return 'studio';
}

function availabilityOf(data) {
  const raw = `${data.availabilityStatus || ''} ${data.moveInDate || ''}`.toLowerCase();
  if (raw.includes('confirm') || raw.includes('combinar') || raw.includes('consulte')) return 'to_confirm';
  if (/\d{2}\/\d{2}\/\d{4}/.test(raw) || raw.includes('breve')) return 'future';
  return 'available_now';
}

function amountOf(value) {
  const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function normalize(data) {
  const category = categoryOf(data);
  const priceOptions = Array.isArray(data.priceOptions) && data.priceOptions.length
    ? data.priceOptions
    : (amountOf(data.price) ? [{ amount: amountOf(data.price), period: 'week' }] : []);
  const entryConditions = data.entryConditions && typeof data.entryConditions === 'object'
    ? data.entryConditions
    : (data.entryRent ? { note: String(data.entryRent).slice(0, 240) } : {});
  return {
    ...data,
    category,
    people: ['ensuite', 'studio', 'double'].includes(category) ? 2 : Number(data.people) || 1,
    availabilityStatus: availabilityOf(data),
    priceOptions,
    entryConditions,
  };
}

const updates = rows.map((row) => ({ id: row.id, before: row.data || {}, after: normalize(row.data || {}) }))
  .filter((item) => JSON.stringify(item.before) !== JSON.stringify(item.after));
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = `tmp-property-normalization-backup-${timestamp}.json`;
await fs.writeFile(backupPath, JSON.stringify(updates, null, 2), 'utf8');
console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', total: rows.length, updates: updates.length, backupPath }, null, 2));

if (!apply) process.exit(0);
for (const update of updates) {
  const patch = await fetch(`${url}/rest/v1/${table}?id=eq.${encodeURIComponent(update.id)}`, {
    method: 'PATCH',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ data: update.after }),
  });
  if (!patch.ok) throw new Error(`Failed to update property ${update.id}: ${patch.status} ${await patch.text()}`);
}
console.log(`Updated ${updates.length} properties.`);
