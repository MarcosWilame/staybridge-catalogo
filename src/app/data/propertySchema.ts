export const PROPERTY_CATEGORIES = ['single', 'double', 'ensuite', 'studio', 'flat'] as const;
export type PropertyCategory = (typeof PROPERTY_CATEGORIES)[number];

export const PROPERTY_AVAILABILITY = ['available_now', 'future', 'to_confirm'] as const;
export type PropertyAvailability = (typeof PROPERTY_AVAILABILITY)[number];

export type PropertyPriceOption = {
  amount: number;
  period: 'week' | 'month';
  occupancy?: number;
  label?: string;
};

export type PropertyEntryConditions = {
  depositWeeks?: number;
  rentWeeks?: number;
  rentMonths?: number;
  note?: string;
};

export type PropertyStructuredFields = {
  category: PropertyCategory;
  availabilityStatus: PropertyAvailability;
  priceOptions: PropertyPriceOption[];
  entryConditions: PropertyEntryConditions;
  sourceText?: string;
};

export function normalizePropertyCategory(value: unknown, type?: unknown): PropertyCategory {
  const raw = `${value || ''} ${type || ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (raw.includes('ensuite')) return 'ensuite';
  if (raw.includes('studio')) return 'studio';
  if (raw.includes('double')) return 'double';
  if (raw.includes('single')) return 'single';
  if (raw.includes('flat') || raw.includes('bedroom')) return 'flat';
  return 'studio';
}

export function normalizePostcode(value: unknown) {
  return typeof value === 'string' ? value.trim().toUpperCase().replace(/\s+/g, ' ') : '';
}

export function parseMoney(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);
  const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Math.max(0, Number(match[0])) : 0;
}

export function getDefaultPeople(category: PropertyCategory, people?: unknown) {
  if (['ensuite', 'studio', 'double'].includes(category)) return 2;
  const value = Number(people);
  return Number.isFinite(value) && value > 0 ? Math.min(20, value) : 1;
}

export function normalizeAvailabilityStatus(value: unknown, moveInDate?: unknown): PropertyAvailability {
  const raw = String(value || '').toLowerCase();
  if (raw === 'to_confirm' || raw.includes('confirm') || raw.includes('combinar') || raw.includes('consulte')) return 'to_confirm';
  if (raw === 'future' || raw.includes('future') || raw.includes('breve')) return 'future';
  const date = String(moveInDate || '').toLowerCase().trim();
  if (date && !['agora', 'now', 'disponível agora', 'disponivel agora'].includes(date)) {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return 'future';
    if (date.includes('confirm') || date.includes('combinar') || date.includes('consulte')) return 'to_confirm';
  }
  return 'available_now';
}

export function normalizePriceOptions(input: unknown, fallback?: unknown): PropertyPriceOption[] {
  const values = Array.isArray(input) ? input : [];
  const options = values.map((item) => {
    if (!item || typeof item !== 'object') return null;
    const record = item as Record<string, unknown>;
    const period = record.period === 'month' ? 'month' : 'week';
    const amount = parseMoney(record.amount);
    if (!amount) return null;
    const occupancy = Number(record.occupancy);
    return {
      amount,
      period,
      ...(Number.isFinite(occupancy) && occupancy > 0 ? { occupancy: Math.min(20, occupancy) } : {}),
      ...(typeof record.label === 'string' && record.label.trim() ? { label: record.label.trim().slice(0, 120) } : {}),
    } satisfies PropertyPriceOption;
  }).filter((item): item is PropertyPriceOption => Boolean(item));
  if (options.length) return options;
  const amount = parseMoney(fallback);
  return amount ? [{ amount, period: 'week' }] : [];
}

export function normalizeEntryConditions(input: unknown, fallback?: unknown): PropertyEntryConditions {
  const record = input && typeof input === 'object' ? input as Record<string, unknown> : {};
  const result: PropertyEntryConditions = {};
  const depositWeeks = Number(record.depositWeeks);
  const rentWeeks = Number(record.rentWeeks);
  const rentMonths = Number(record.rentMonths);
  if (Number.isFinite(depositWeeks) && depositWeeks >= 0) result.depositWeeks = Math.min(52, depositWeeks);
  if (Number.isFinite(rentWeeks) && rentWeeks >= 0) result.rentWeeks = Math.min(52, rentWeeks);
  if (Number.isFinite(rentMonths) && rentMonths >= 0) result.rentMonths = Math.min(12, rentMonths);
  const note = typeof record.note === 'string' ? record.note.trim() : typeof fallback === 'string' ? fallback.trim() : '';
  if (note) result.note = note.slice(0, 240);
  return result;
}

export function normalizePropertyStructuredFields(input: Record<string, unknown>): PropertyStructuredFields {
  const category = normalizePropertyCategory(input.category, input.type);
  return {
    category,
    availabilityStatus: normalizeAvailabilityStatus(input.availabilityStatus, input.moveInDate),
    priceOptions: normalizePriceOptions(input.priceOptions, input.price),
    entryConditions: normalizeEntryConditions(input.entryConditions, input.entryRent),
    ...(typeof input.sourceText === 'string' && input.sourceText.trim()
      ? { sourceText: input.sourceText.trim().slice(0, 2_000) }
      : {}),
  };
}
