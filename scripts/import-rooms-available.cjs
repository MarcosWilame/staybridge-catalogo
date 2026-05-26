const fs = require('fs');
const path = require('path');

const POUND = String.fromCharCode(163);
const BAD_CHAR = String.fromCharCode(65533);
const defaultSourceDir = path.join(process.env.USERPROFILE || '', 'Downloads');
const sourceArg = process.argv[2];
const source = sourceArg
  ? path.resolve(sourceArg)
  : fs
      .readdirSync(defaultSourceDir)
      .filter(
        (name) =>
          name.includes('ROOMS AVAILABLE') &&
          name.toLowerCase().endsWith('.csv')
      )
      .map((name) => path.join(defaultSourceDir, name))
      .sort(
        (a, b) =>
          fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime()
      )[0];

const target = path.resolve(__dirname, '../public/properties.csv');

if (!source || !fs.existsSync(source)) {
  throw new Error(
    'CSV nao encontrado. Use: npm run import:properties -- \"C:\\\\caminho\\\\arquivo.csv\"'
  );
}

function parseCsvLine(line) {
  const values = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(value.trim());
      value = '';
      continue;
    }

    value += char;
  }

  values.push(value.trim());
  return values;
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function normalizePrice(raw) {
  const price = String(raw || '')
    .trim()
    .split(BAD_CHAR)
    .join(POUND)
    .split('?')
    .join(POUND);

  if (!price) return 'Sob consulta';

  const withCurrency = price.includes(POUND) ? price : `${POUND}${price}`;
  return withCurrency.toLowerCase().includes('week')
    ? withCurrency
    : `${withCurrency}/week`;
}

function categoryFromType(type) {
  const normalized = String(type).toLowerCase();

  if (normalized.includes('studio')) return 'studio';
  if (normalized.includes('ensuite')) return 'ensuite';
  if (normalized.includes('single')) return 'single';
  if (normalized.includes('double')) return 'double';
  if (normalized.includes('flat')) return 'flat';

  return 'room';
}

function bedroomsFromType(type) {
  const match = String(type).match(/(\d+)\s*bed/i);
  return match ? Number(match[1]) : 1;
}

function regionFromDirection(direction) {
  const normalized = String(direction || '').trim().toLowerCase();
  if (!normalized) return 'London';

  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)} London`;
}

function pick(row, keys) {
  const normalizedEntries = Object.entries(row).map(([key, value]) => [
    key.trim().toLowerCase(),
    value,
  ]);

  for (const key of keys) {
    const normalizedKey = key.trim().toLowerCase();
    const match = normalizedEntries.find(([entryKey]) => entryKey === normalizedKey);
    if (match?.[1]) return match[1];
  }

  return '';
}

function normalizeImages(rawImages, fallbackImage) {
  const images = String(rawImages || '')
    .split('|')
    .map((image) => image.trim())
    .filter(Boolean);

  return images.length ? images.join('|') : fallbackImage;
}

const imagesByCategory = {
  studio: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
  ensuite: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200',
  single: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
  double: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
  flat: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
  room: 'https://images.unsplash.com/photo-1560448075-bb485b067938?w=1200',
};

const headers = [
  'id',
  'title',
  'type',
  'category',
  'region',
  'local_area',
  'price',
  'description',
  'long_description',
  'available',
  'bills_included',
  'bedrooms',
  'deposit',
  'nearby_stations',
  'lat',
  'lng',
  'furnishing',
  'move_in_date',
  'postcode',
  'address',
  'people',
  'image',
  'images',
  'amenities',
  'video',
];

const csvText = fs.readFileSync(source, 'utf8');
const lines = csvText.split(/\r?\n/);
let section = '';
let sourceHeaders = [];
const outputRows = [];
let id = 1000;

for (const rawLine of lines) {
  const cells = parseCsvLine(rawLine);
  const first = (cells[0] || '').trim();

  if (!cells.some(Boolean)) continue;

  if (first === 'FLATS' || first === 'ROOMS') {
    section = first;
    sourceHeaders = [];
    continue;
  }

  if (!section) continue;

  if (first === 'People') {
    sourceHeaders = cells;
    continue;
  }

  if (!sourceHeaders.length) continue;

  const row = Object.fromEntries(
    sourceHeaders.map((header, index) => [header, cells[index] || ''])
  );

  if (!row.Price || !row.Postcode || !row.Address) continue;

  const type = section === 'FLATS' ? row.Flat : row['Room Type'];
  const unit = section === 'FLATS' ? row['Flat no'] : row.Room;
  const category = categoryFromType(type);
  const fallbackImage = imagesByCategory[category] || imagesByCategory.room;
  const sheetImage = pick(row, ['Image', 'Imagem', 'Foto', 'Photo']);
  const sheetImages = pick(row, ['Images', 'Imagens', 'Fotos', 'Photos']);
  const image = sheetImage || normalizeImages(sheetImages, fallbackImage).split('|')[0];
  const images = normalizeImages(sheetImages, image);
  const availability = row.Availability || 'now';
  const isNow = availability.toLowerCase() === 'now';
  const area = row.Area || regionFromDirection(row['North / South']);

  outputRows.push({
    id: id += 1,
    title: `${type} ${unit} - ${area}`,
    type,
    category,
    region: regionFromDirection(row['North / South']),
    local_area: area,
    price: normalizePrice(row.Price),
    description: `${type} em ${area}.`,
    long_description:
      section === 'FLATS'
        ? `${type} em ${area}. Disponibilidade: ${availability}.`
        : `${type} mobiliado em ${area}. Disponibilidade: ${availability}.`,
    available: 'sim',
    bills_included: section === 'ROOMS' ? 'sim' : 'nao',
    bedrooms: bedroomsFromType(type),
    deposit: '',
    nearby_stations: '',
    lat: '',
    lng: '',
    furnishing: 'Mobiliado',
    move_in_date: isNow ? 'Imediata' : availability,
    postcode: row.Postcode,
    address: row.Address,
    people: row.People || '',
    image,
    images,
    amenities: section === 'ROOMS' ? 'Bills inclusas|Mobiliado' : 'Mobiliado',
    video: '',
  });
}

const output =
  [
    headers.join(','),
    ...outputRows.map((row) =>
      headers.map((header) => csvEscape(row[header])).join(',')
    ),
  ].join('\n') + '\n';

fs.writeFileSync(target, output, 'utf8');
console.log(`Imported ${outputRows.length} properties from ${source}`);
