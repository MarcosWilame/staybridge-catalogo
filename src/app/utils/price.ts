const DEFAULT_PERIOD = '/week';
const PERIODS = ['/week', '/month', '/day'];

export function getPriceValue(price: string) {
  const match = String(price || '').match(/\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(',', '.'));
}

export function formatEuroPrice(price: string | number) {
  const raw = String(price ?? '').trim();
  const value = typeof price === 'number' ? price : getPriceValue(raw);

  if (!Number.isFinite(value) || value <= 0) return '€0/week';

  const periodMatch = raw.match(/\/\s*(week|month|day|semana|mês|mes|dia)\b/i);
  const period = periodMatch ? `/${periodMatch[1].toLowerCase()}` : DEFAULT_PERIOD;
  const normalizedPeriod = period
    .replace('/semana', '/week')
    .replace('/mês', '/month')
    .replace('/mes', '/month')
    .replace('/dia', '/day');

  return `€${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}${normalizedPeriod}`;
}

export function getPricePeriod(price: string) {
  const formatted = formatEuroPrice(price);
  return PERIODS.find((period) => formatted.endsWith(period)) || DEFAULT_PERIOD;
}

export function buildEuroPrice(value: string | number, period = DEFAULT_PERIOD) {
  const amount = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  const safePeriod = PERIODS.includes(period) ? period : DEFAULT_PERIOD;

  if (!Number.isFinite(amount) || amount <= 0) return '';

  return `€${amount % 1 === 0 ? amount.toFixed(0) : amount.toFixed(2)}${safePeriod}`;
}
