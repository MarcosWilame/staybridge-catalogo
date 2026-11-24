import type { Property } from '../../data/properties';

export type CsvInventoryRow = {
  line: number;
  id: number | null;
  title: string;
  address: string;
  postcode: string;
  unit: string;
  raw: Record<string, string>;
};

export type InventorySyncResult = {
  rows: CsvInventoryRow[];
  matched: Array<{ csv: CsvInventoryRow; property: Property }>;
  toShow: Property[];
  toHide: Property[];
  newRows: CsvInventoryRow[];
  duplicateRows: CsvInventoryRow[];
};

function normalize(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"' && line[index + 1] === '"' && quoted) {
      cell += '"';
      index += 1;
    } else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

function splitLines(text: string) {
  return text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
}

function findValue(row: Record<string, string>, names: string[]) {
  const entry = Object.entries(row).find(([key]) => names.includes(normalize(key)));
  return entry?.[1]?.trim() || '';
}

function normalizeAddress(value: unknown, postcode: unknown) {
  const address = normalize(value);
  const normalizedPostcode = normalize(postcode);
  if (!normalizedPostcode) return address;
  return address
    .replace(new RegExp(`\\s*${normalizedPostcode.replace(/\\s+/g, '\\\\s*')}\\s*$`), '')
    .trim();
}

function extractUnit(value: unknown) {
  const match = String(value || '').match(/\\b(?:flat|room)\\s*([a-z]?\\d+[a-z]?)\\b/i);
  return match ? normalize(match[1]) : '';
}

function extractAddressFromObservations(observations: string, postcode: string) {
  const normalizedPostcode = normalize(postcode);
  if (!observations || !normalizedPostcode) return '';
  return observations
    .split('|')
    .map((part) => part.trim())
    .find((part) => normalize(part).includes(normalizedPostcode)) || '';
}

export function parseInventoryCsv(text: string): CsvInventoryRow[] {
  const lines = splitLines(text);
  if (lines.length < 2) throw new Error('O CSV precisa ter um cabeçalho e pelo menos uma linha.');
  const headers = parseCsvLine(lines[0]);
  if (!headers.some((header) => ['id', 'property id', 'property_id', 'endereco', 'address', 'postcode'].includes(normalize(header)))) {
    throw new Error('Não encontrei colunas de identificação. Use id, endereço/address ou postcode.');
  }
  return lines.slice(1).map((line, index) => {
    const cells = parseCsvLine(line);
    const raw = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex] || '']));
    const idValue = findValue(raw, ['id', 'property id', 'property_id']);
    const parsedId = Number(idValue);
    return {
      line: index + 2,
      id: Number.isSafeInteger(parsedId) && parsedId > 0 ? parsedId : null,
      title: findValue(raw, ['title', 'titulo', 'nome', 'name']),
      address: findValue(raw, ['address', 'endereco', 'endereço', 'street']),
      postcode: findValue(raw, ['postcode', 'post code', 'cep']),
      unit: extractUnit(`${findValue(raw, ['title', 'titulo', 'nome', 'name'])} ${findValue(raw, ['obs', 'observacao', 'notes'])}`),
      raw,
    };
  }).map((row) => ({
    ...row,
    address: row.address || extractAddressFromObservations(findValue(row.raw, ['obs', 'observacao', 'notes']), row.postcode),
  })).filter((row) => row.id || row.address || row.postcode || row.title);
}

function matches(row: CsvInventoryRow, property: Property) {
  if (row.id && row.id === property.id) return true;
  const postcodeMatches = row.postcode && normalize(row.postcode) === normalize(property.postcode);
  const csvAddress = normalizeAddress(row.address, row.postcode);
  const propertyAddress = normalizeAddress(property.address, property.postcode);
  const addressMatches = csvAddress && propertyAddress && (
    csvAddress === propertyAddress ||
    csvAddress.includes(propertyAddress) ||
    propertyAddress.includes(csvAddress)
  );
  const propertyUnit = extractUnit(property.title);
  const unitMatches = !row.unit || !propertyUnit || row.unit === propertyUnit;
  return Boolean(postcodeMatches && addressMatches && unitMatches) || Boolean(row.title && normalize(row.title) === normalize(property.title));
}

export function compareInventoryCsv(text: string, properties: Property[]): InventorySyncResult {
  const rows = parseInventoryCsv(text);
  const matched: InventorySyncResult['matched'] = [];
  const newRows: CsvInventoryRow[] = [];
  const duplicateRows: CsvInventoryRow[] = [];
  const matchedIds = new Set<number>();

  rows.forEach((row) => {
    const property = properties.find((item) => matches(row, item));
    if (!property) return newRows.push(row);
    if (matchedIds.has(property.id)) return duplicateRows.push(row);
    matchedIds.add(property.id);
    matched.push({ csv: row, property });
  });

  return {
    rows,
    matched,
    toShow: matched.filter(({ property }) => property.listed !== true).map(({ property }) => property),
    toHide: properties.filter((property) => property.listed === true && !matchedIds.has(property.id)),
    newRows,
    duplicateRows,
  };
}
