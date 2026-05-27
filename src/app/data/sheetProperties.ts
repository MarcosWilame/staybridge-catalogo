import { useEffect, useState } from 'react';
import { Property, properties as fallbackProperties } from './properties';

const SHEET_URL =
  import.meta.env.VITE_PROPERTIES_SHEET_URL || '/properties.csv';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;

type CsvRow = Record<string, string>;

const KNOWN_HEADER_KEYS = new Set([
  'id',
  'title',
  'titulo',
  'nome',
  'flat',
  'flat_no',
  'room',
  'room_type',
  'type',
  'tipo',
  'category',
  'categoria',
  'region',
  'regiao',
  'bairro',
  'area',
  'local_area',
  'price',
  'preco',
  'valor',
  'description',
  'descricao',
  'descricao_curta',
  'resumo',
  'long_description',
  'descricao_longa',
  'available',
  'disponivel',
  'availability',
  'bills_included',
  'bills_inclusas',
  'bedrooms',
  'quartos',
  'deposit',
  'deposito',
  'nearby_stations',
  'estacoes_proximas',
  'lat',
  'latitude',
  'lng',
  'lon',
  'longitude',
  'furnishing',
  'mobilia',
  'move_in_date',
  'entrada',
  'postcode',
  'cep',
  'codigo_postal',
  'address',
  'endereco',
  'people',
  'pessoas',
  'image',
  'image_link',
  'image_url',
  'photo',
  'photo_url',
  'imagem',
  'images',
  'fotos',
  'imagens',
  'url',
  'url_imagem',
  'amenities',
  'comodidades',
  'video',
]);

function parseCsv(text: string): CsvRow[] {
  const rows = parseRawCsv(text).map((row) => row.map((cell) => cell.trim()));
  const parsedRows: CsvRow[] = [];
  let headers: string[] | null = null;
  let section = '';

  for (const row of rows) {
    const isEmptyRow = row.every((cell) => cell === '');
    if (isEmptyRow) continue;

    const normalizedRow = row.map(normalizeKey);
    if (normalizedRow[0] === 'flats' || normalizedRow[0] === 'rooms') {
      section = normalizedRow[0];
      headers = null;
      continue;
    }

    if (isHeaderRow(normalizedRow)) {
      headers = normalizedRow;
      continue;
    }

    if (!headers) continue;

    parsedRows.push(
      headers.reduce<CsvRow>((item, header, index) => {
        item.__section = section;
        item[header] = row[index] || '';
        return item;
      }, {})
    );
  }

  return parsedRows;
}

function parseRawCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

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
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }

      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      continue;
    }

    value += char;
  }

  row.push(value);
  rows.push(row);

  return rows;
}

function isHeaderRow(normalizedRow: string[]) {
  return normalizedRow.filter((cell) => KNOWN_HEADER_KEYS.has(cell)).length >= 2;
}

function normalizeKey(key: string) {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function get(row: CsvRow, keys: string[], fallback = '') {
  for (const key of keys) {
    const normalizedKey = normalizeKey(key);
    if (row[normalizedKey]) return row[normalizedKey];
  }

  return fallback;
}

function getNumber(row: CsvRow, keys: string[], fallback = 0) {
  const raw = get(row, keys);
  if (!raw) return fallback;

  const parsed = Number(raw.replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getBoolean(row: CsvRow, keys: string[], fallback = false) {
  const raw = get(row, keys).toLowerCase();
  if (!raw) return fallback;

  return [
    'sim',
    'yes',
    'true',
    '1',
    'available',
    'disponivel',
    'now',
  ].includes(raw);
}

function getList(row: CsvRow, keys: string[], fallback: string[] = []) {
  const raw = get(row, keys);
  if (!raw) return fallback;

  return raw
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getPropertyTitle(row: CsvRow) {
  const explicitTitle = get(row, ['title', 'titulo', 'nome']);
  if (explicitTitle) return explicitTitle;

  const flat = get(row, ['flat']);
  const flatNumber = get(row, ['flat_no']);
  const roomType = get(row, ['room_type']);
  const room = get(row, ['room']);
  const area = get(row, ['area', 'local_area', 'bairro']);
  const postcode = get(row, ['postcode', 'cep', 'codigo_postal']);

  if (flat) {
    const compactFlat = compactFlatType(flat);
    return [flatNumber ? `${compactFlat} ${flatNumber}` : compactFlat, postcode, area]
      .filter(Boolean)
      .join(' - ')
      .toUpperCase();
  }

  if (roomType && room) {
    return [`${roomType} ${room}`, postcode, area]
      .filter(Boolean)
      .join(' - ')
      .toUpperCase();
  }

  return get(row, ['flat', 'flat_no', 'room_type', 'room']);
}

function compactFlatType(type: string) {
  const bedroomMatch = type.match(/(\d+)\s*bed/i);
  if (bedroomMatch?.[1]) return `${bedroomMatch[1]}-BedFlat`;

  return type.replace(/\s+/g, '');
}

function getPropertyCategory(type: string, row: CsvRow) {
  const explicitCategory = get(row, ['category', 'categoria']);
  const normalized = normalizeKey(explicitCategory || type);

  if (normalized.includes('studio')) return 'studio';
  if (normalized.includes('ensuite')) return 'ensuite';
  if (normalized.includes('single')) return 'single';
  if (normalized.includes('double')) return 'double';
  if (normalized.includes('flat') || normalized.includes('bedroom')) return 'flat';

  return normalized || 'room';
}

function getPropertyRegion(row: CsvRow) {
  const explicitRegion = get(row, ['region', 'regiao']);
  if (explicitRegion) return explicitRegion;

  const direction = get(row, ['north_south']);
  if (direction) {
    const normalizedDirection = direction.trim().toLowerCase();
    return `${normalizedDirection.charAt(0).toUpperCase()}${normalizedDirection.slice(1)} London`;
  }

  return get(row, ['bairro', 'area'], 'London');
}

function getPropertyType(row: CsvRow) {
  const type = get(row, ['type', 'tipo', 'room_type', 'flat', 'room'], 'Room');
  return get(row, ['flat']) ? compactFlatType(type) : type;
}

function normalizeImageUrl(url: string) {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return trimmedUrl;

  const driveFileId = getGoogleDriveFileId(trimmedUrl);
  if (driveFileId) {
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w2000`;
  }

  if (
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('data:')
  ) {
    return trimmedUrl;
  }

  return `/${trimmedUrl}`;
}

function getGoogleDriveFileId(url: string) {
  const filePathMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (filePathMatch?.[1]) return filePathMatch[1];

  const directPathMatch = url.match(/drive\.google\.com\/uc\?[^#]*id=([^&#]+)/);
  if (directPathMatch?.[1]) return directPathMatch[1];

  const openPathMatch = url.match(/drive\.google\.com\/open\?[^#]*id=([^&#]+)/);
  if (openPathMatch?.[1]) return openPathMatch[1];

  return '';
}

function rowToProperty(row: CsvRow, index: number): Property | null {
  const generatedId = index + 1 + (row.__section === 'rooms' ? 1 : 0);
  const id = getNumber(row, ['id', 'codigo'], generatedId);
  const title = getPropertyTitle(row);
  const type = getPropertyType(row);
  const category = getPropertyCategory(type, row);
  const rawImage =
    get(row, [
      'image',
      'image_link',
      'image_url',
      'photo',
      'photo_url',
      'foto',
      'imagem',
    ]) ||
    getList(row, ['images', 'fotos', 'imagens'], [])[0] ||
    '';
  const placeholderImage = 'https://placekitten.com/1200/800';
  const image = normalizeImageUrl(rawImage || placeholderImage);
  const images = getList(row, ['images', 'fotos', 'imagens'], image ? [image] : []).map(
    normalizeImageUrl
  );
  const address = get(row, ['address', 'endereco']);
  const postcode = get(row, ['postcode', 'cep', 'codigo_postal']);
  const lat = getNumber(row, ['lat', 'latitude']);
  const lng = getNumber(row, ['lng', 'lon', 'longitude']);
  const availabilityRaw = get(row, ['availability', 'available', 'disponivel']);
  const moveInDateRaw = get(row, ['move_in_date', 'entrada']);
  const moveInDate = moveInDateRaw || availabilityRaw || 'Imediata';

  // Exige título e imagem — mas não filtra por data
  if (!title || !image) return null;

  return {
    id,
    image,
    images: images.length ? images : [image],
    video: get(row, ['video']) || undefined,
    type,
    title,
    region: getPropertyRegion(row),
    localArea: get(row, ['local_area', 'area', 'bairro']),
    price: get(row, ['price', 'preco', 'valor'], 'Sob consulta'),
    description: get(row, ['description', 'descricao_curta', 'resumo']),
    longDescription: get(
      row,
      ['long_description', 'descricao', 'descricao_longa'],
      get(row, ['description', 'descricao_curta', 'resumo'])
    ),
    available: getBoolean(row, ['available', 'disponivel'], true),
    billsIncluded: getBoolean(
      row,
      ['bills_included', 'bills_inclusas'],
      row.__section === 'rooms'
    ),
    bedrooms: getNumber(row, ['bedrooms', 'quartos'], 1),
    category,
    amenities: getList(row, ['amenities', 'comodidades']),
    deposit: getNumber(row, ['deposit', 'deposito']),
    nearbyStations: getList(row, ['nearby_stations', 'estacoes_proximas']),
    coordinates: { lat, lng },
    furnishing: get(row, ['furnishing', 'mobilia'], 'Mobiliado'),
    moveInDate,
    postcode,
    address,
    people: getNumber(row, ['people', 'pessoas'], 1),
  };
}

async function loadPropertiesFromSheet() {
  if (cachedProperties) return cachedProperties;
  if (cachedError) throw new Error(cachedError);

  const response = await fetch(SHEET_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Nao foi possivel carregar a planilha: ${response.status}`);
  }

  const csv = await response.text();
  const loadedProperties = parseCsv(csv)
    .map(rowToProperty)
    .filter((property): property is Property => Boolean(property));

  if (!loadedProperties.length) {
    throw new Error('A planilha nao possui imoveis validos.');
  }

  cachedProperties = loadedProperties;
  return loadedProperties;
}

export function useProperties() {
  const [items, setItems] = useState<Property[]>(
    cachedProperties || fallbackProperties
  );
  const [isLoading, setIsLoading] = useState(!cachedProperties);
  const [error, setError] = useState<string | null>(cachedError);

  useEffect(() => {
    let isMounted = true;

    loadPropertiesFromSheet()
      .then((loadedProperties) => {
        if (!isMounted) return;
        setItems(loadedProperties);
        setError(null);
      })
      .catch((err: Error) => {
        cachedError = err.message;
        if (!isMounted) return;
        setItems(fallbackProperties);
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    properties: items,
    isLoading,
    error,
    source: error ? 'fallback' : 'sheet',
  };
}