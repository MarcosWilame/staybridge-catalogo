import type { Property, PropertyStatus } from '../../data/properties.ts';
import { getAvailabilityInfo } from '../../utils/availability.ts';

type PropertyIdentity = Pick<Property, 'address' | 'postcode' | 'title'> & {
  unit?: string;
};

export const PROPERTY_STATUS_OPTIONS: Array<{
  value: PropertyStatus;
  label: string;
}> = [
  { value: 'available', label: 'Disponível' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'rented', label: 'Alugado' },
  { value: 'hidden', label: 'Oculto' },
  { value: 'maintenance', label: 'Em manutenção' },
];

export function getPropertyManagementStatus(
  property: Pick<Property, 'status' | 'listed' | 'available'>
): PropertyStatus {
  if (property.status && PROPERTY_STATUS_OPTIONS.some((option) => option.value === property.status)) {
    return property.status;
  }
  if (property.listed === false && !property.available) return 'rented';
  if (property.listed === false) return 'hidden';
  if (!property.available) return 'reserved';
  return 'available';
}

export function applyPropertyStatus<T extends Pick<Property, 'available' | 'listed' | 'status'>>(
  property: T,
  status: PropertyStatus
): T {
  const visibility = {
    available: { available: true, listed: true },
    reserved: { available: false, listed: true },
    rented: { available: false, listed: false },
    hidden: { available: false, listed: false },
    maintenance: { available: false, listed: false },
  }[status];

  return { ...property, ...visibility, status };
}

export function getPropertyStatusLabel(property: Property) {
  const status = getPropertyManagementStatus(property);
  return PROPERTY_STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}

function normalizeIdentityPart(value: string) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function normalizeAddress(address: string, postcode: string) {
  const normalizedPostcode = normalizeIdentityPart(postcode);
  const normalizedAddress = normalizeIdentityPart(address);
  return normalizedPostcode
    ? normalizedAddress.replace(new RegExp(`\\s*${normalizedPostcode.replace(' ', '\\s*')}$`), '').trim()
    : normalizedAddress;
}

export function extractPropertyUnit(title: string) {
  const titleWithoutPostcode = String(title || '').split(/\s+-\s+/)[0].trim();
  const match = titleWithoutPostcode.match(/([a-z0-9]+)$/i);
  return match ? normalizeIdentityPart(match[1]) : '';
}

export function findDuplicateProperty(
  properties: Property[],
  candidate: PropertyIdentity,
  ignoredId: number | null = null
) {
  const candidateAddress = normalizeAddress(candidate.address, candidate.postcode);
  const candidatePostcode = normalizeIdentityPart(candidate.postcode);
  const candidateUnit = normalizeIdentityPart(candidate.unit || '') || extractPropertyUnit(candidate.title);
  const candidateTitle = normalizeIdentityPart(candidate.title);

  if (!candidateAddress || !candidatePostcode) return undefined;

  return properties.find((property) => {
    if (property.id === ignoredId) return false;

    const sameAddress = normalizeAddress(property.address, property.postcode) === candidateAddress;
    const samePostcode = normalizeIdentityPart(property.postcode) === candidatePostcode;
    if (!sameAddress || !samePostcode) return false;

    const propertyUnit = extractPropertyUnit(property.title);
    if (candidateUnit && propertyUnit) return candidateUnit === propertyUnit;

    return normalizeIdentityPart(property.title) === candidateTitle;
  });
}

export function getAdminDashboardMetrics(properties: Property[]) {
  const listedProperties = properties.filter((property) => property.listed !== false);
  const rentedProperties = properties.filter(
    (property) => getPropertyManagementStatus(property) === 'rented'
  );
  const availableNow = listedProperties.filter(
    (property) => property.available && getAvailabilityInfo(property.moveInDate, true).isNow
  ).length;
  const regions = Array.from(
    listedProperties.reduce((counts, property) => {
      const region = property.region || 'Sem região';
      counts.set(region, (counts.get(region) || 0) + 1);
      return counts;
    }, new Map<string, number>())
  )
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return {
    visible: listedProperties.length,
    rented: rentedProperties.length,
    availableNow,
    regions,
  };
}

function parseAvailabilityDate(value: string, today: Date) {
  const raw = String(value || '').trim();
  let year: number;
  let month: number;
  let day: number;
  let hasYear = true;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    [year, month, day] = raw.split('-').map(Number);
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    [day, month, year] = raw.split('/').map(Number);
  } else if (/^\d{2}\/\d{2}$/.test(raw)) {
    [day, month] = raw.split('/').map(Number);
    year = today.getFullYear();
    hasYear = false;
  } else {
    return null;
  }

  let date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!hasYear && date < startToday) {
    date = new Date(year + 1, month - 1, day);
  }
  return date;
}

export function getAvailabilityAgenda(
  properties: Property[],
  days: 7 | 15 | 30,
  today = new Date()
) {
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = new Date(startToday);
  endDate.setDate(endDate.getDate() + days);

  return properties
    .filter((property) => {
      const status = getPropertyManagementStatus(property);
      return status !== 'rented' && status !== 'maintenance';
    })
    .map((property) => ({ property, date: parseAvailabilityDate(property.moveInDate, startToday) }))
    .filter(
      (item): item is { property: Property; date: Date } =>
        Boolean(item.date && item.date >= startToday && item.date <= endDate)
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.property.id - b.property.id)
    .map(({ property, date }) => ({
      property,
      date,
      daysUntil: Math.round((date.getTime() - startToday.getTime()) / 86_400_000),
    }));
}
