import type { Property } from '../data/properties';
import { getAvailabilityInfo, getMoveInTimestamp } from './availability.ts';

export type PropertySearchFilters = {
  search: string;
  region: string;
  type: string;
  priceRange: string;
  availableNow: boolean;
  billsIncluded: boolean;
  people: string;
  moveInBy: string;
};

export type PropertySearchSort = 'recommended' | 'price-asc' | 'price-desc' | 'available' | 'type';

type IndexedProperty = {
  property: Property;
  searchableText: string;
  region: string;
  price: number;
  availableNow: boolean;
  moveInTimestamp: number;
};

const indexCache = new WeakMap<readonly Property[], IndexedProperty[]>();

export function getPriceValue(price: string | number) {
  const match = String(price ?? '').match(/\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(',', '.'));
}

function parsePriceRange(range: string) {
  if (!range) return [0, Infinity] as const;
  if (/^\d+$/.test(range)) return [0, Number(range)] as const;
  if (range.includes('+')) return [Number(range.replace('+', '')), Infinity] as const;
  const [min, max] = range.split('-').map(Number);
  return [min, max] as const;
}

function buildIndex(properties: readonly Property[]) {
  const cached = indexCache.get(properties);
  if (cached) return cached;

  const now = new Date();
  const indexed = properties.map((property) => ({
    property,
    searchableText: [
      property.title,
      property.region,
      property.localArea,
      property.postcode,
      property.address,
      property.type,
      property.description,
      ...property.nearbyStations,
    ].filter(Boolean).join(' ').toLowerCase(),
    region: property.region.toLowerCase(),
    price: getPriceValue(property.price),
    availableNow: getAvailabilityInfo(
      property.moveInDate,
      property.available,
      now,
      property.availabilityStatus
    ).isNow,
    moveInTimestamp: getMoveInTimestamp(
      property.moveInDate,
      property.available,
      now,
      property.availabilityStatus
    ),
  }));

  indexCache.set(properties, indexed);
  return indexed;
}

export function filterAndSortProperties(
  properties: readonly Property[],
  filters: PropertySearchFilters,
  sortBy: PropertySearchSort
) {
  const query = filters.search.trim().toLowerCase();
  const [minPrice, maxPrice] = parsePriceRange(filters.priceRange);
  const cutoff = filters.moveInBy
    ? (() => {
        const [year, month, day] = filters.moveInBy.split('-').map(Number);
        return new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
      })()
    : Infinity;

  const filtered = buildIndex(properties).filter(({ property, searchableText, region, price, availableNow, moveInTimestamp }) => {
    if (query && !searchableText.includes(query)) return false;
    if (filters.region && !region.includes(filters.region.toLowerCase())) return false;
    if (filters.type && property.category !== filters.type) return false;
    if (filters.priceRange && (price < minPrice || price > maxPrice)) return false;
    if (filters.availableNow && !availableNow) return false;
    if (filters.billsIncluded && !property.billsIncluded) return false;
    if (filters.people) {
      const capacity = Number(property.people || 0);
      if (filters.people === '4+' ? capacity < 4 : capacity < Number(filters.people)) return false;
    }
    if (filters.moveInBy && (!property.available || moveInTimestamp > cutoff)) return false;
    return true;
  });

  return filtered
    .map(({ property, price, availableNow }) => ({ property, price, availableNow }))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'available') return Number(b.availableNow) - Number(a.availableNow);
      if (sortBy === 'type') return a.property.type.localeCompare(b.property.type);
      return 0;
    })
    .map(({ property }) => property);
}
