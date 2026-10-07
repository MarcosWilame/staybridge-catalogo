import fs from 'node:fs/promises';

const env = await fs.readFile('.env.local', 'utf8');
const values = Object.fromEntries(env.split(/\r?\n/).filter(Boolean).map((line) => {
  const index = line.indexOf('=');
  return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
}));

const url = (values.SUPABASE_URL || values.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const key = values.SUPABASE_SERVICE_ROLE_KEY || values.SUPABASE_SERVICE_KEY || '';
const table = values.SUPABASE_PROPERTIES_TABLE || values.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
if (!url || !key) throw new Error('Supabase server configuration is missing');

const response = await fetch(`${url}/rest/v1/${table}?select=id,data&order=id.asc`, {
  headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
});
if (!response.ok) throw new Error(`Supabase returned ${response.status}`);

const rows = await response.json();
const report = rows.map(({ id, data = {} }) => {
  const category = String(data.category || data.type || '').toLowerCase();
  const needsCategory = !['single', 'double', 'ensuite', 'studio', 'flat'].includes(category);
  const needsPeople = ['ensuite', 'studio', 'double'].includes(category) && data.people !== 2;
  const needsAvailability = !data.availabilityStatus;
  const needsPrices = !Array.isArray(data.priceOptions);
  return { id, needsCategory, needsPeople, needsAvailability, needsPrices };
});

const summary = {
  total: report.length,
  needsCategory: report.filter((item) => item.needsCategory).length,
  needsPeople: report.filter((item) => item.needsPeople).length,
  needsAvailability: report.filter((item) => item.needsAvailability).length,
  needsPrices: report.filter((item) => item.needsPrices).length,
};
console.log(JSON.stringify({ summary, records: report.filter((item) => Object.values(item).some((value) => value === true)) }, null, 2));
