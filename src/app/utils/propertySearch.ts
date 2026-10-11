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

export type ParsedPropertySearch = {
  filters: PropertySearchFilters;
  sortBy: PropertySearchSort;
};

export function buildPropertySearchAnswer(total: number, visibleCount: number) {
  if (!total) {
    return 'Não encontrei um imóvel com esses critérios. Tente buscar por região, tipo, preço máximo ou bills inclusas.';
  }

  const shown = Math.min(visibleCount, total);
  return `Encontrei ${total} ${total === 1 ? 'opção' : 'opções'} no catálogo. Mostrando ${shown} ${shown === 1 ? 'resultado' : 'resultados'} mais próximos:`;
}

type IndexedProperty = {
  property: Property;
  searchableText: string;
  region: string;
  price: number;
  availableNow: boolean;
  moveInTimestamp: number;
};

const indexCache = new WeakMap<readonly Property[], IndexedProperty[]>();

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function getPriceValue(price: string | number) {
  const match = String(price ?? '').match(/\d+(?:[.,]\d+)?/);
  if (!match) return 0;
  return Number(match[0].replace(',', '.'));
}

export function getPropertyPriceValue(property: Pick<Property, 'price' | 'priceOptions'>) {
  const weeklyPrice = property.priceOptions?.find((option) => option.period === 'week')?.amount;
  return typeof weeklyPrice === 'number' ? weeklyPrice : getPriceValue(property.price);
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
    searchableText: normalizeSearchText([
      property.title,
      property.region,
      property.localArea,
      property.postcode,
      property.address,
      property.type,
      property.description,
      ...property.nearbyStations,
    ].filter(Boolean).join(' ')),
    region: normalizeSearchText(property.region),
    price: getPropertyPriceValue(property),
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

function getCategoryFromQuery(query: string) {
  if (/\bstudios?\b/.test(query)) return 'studio';
  if (/\b(?:ensuite|en suite)\b/.test(query)) return 'ensuite';
  if (/\b(?:flat|apartamento|imovel completo)\b/.test(query)) return 'flat';
  if (/\b(?:double|duplo)\b/.test(query)) return 'double';
  if (/\b(?:single|individual|quarto)\b/.test(query)) return 'single';
  return '';
}

function getLocationFromQuery(properties: readonly Property[], query: string) {
  const locationTerms = Array.from(new Set(
    properties.flatMap((property) => [property.region, property.localArea, ...property.nearbyStations])
      .filter((value): value is string => Boolean(value && value.trim().length >= 3))
  )).sort((a, b) => b.length - a.length);

  return locationTerms.find((term) => query.includes(normalizeSearchText(term))) || '';
}

export function parsePropertySearchQuery(
  properties: readonly Property[],
  query: string
): ParsedPropertySearch {
  const normalizedQuery = normalizeSearchText(query);
  const requestedCategory = getCategoryFromQuery(normalizedQuery);
  const priceMatch = normalizedQuery.match(/(?:ate|menos de|no maximo|maximo)\s*£?\s*(\d+(?:[.,]\d+)?)/);
  const requestedLocation = getLocationFromQuery(properties, normalizedQuery);
  const peopleMatch = normalizedQuery.match(/(?:para|p\/|pessoas?|people)\s*(\d+\+?)/);
  const wantsBills = /\b(?:bills?|contas?|faturas?)\b/.test(normalizedQuery);
  const wantsAvailableNow = /\b(?:disponivel agora|entrada imediata|agora|imediata)\b/.test(normalizedQuery);
  const search = normalizedQuery
    .replace(/\b(?:studios?|ensuite|en suite|flat|apartamento|imovel completo|double|duplo|single|individual|quarto)\b/g, ' ')
    .replace(/(?:ate|menos de|no maximo|maximo)\s*£?\s*\d+(?:[.,]\d+)?/g, ' ')
    .replace(/\b(?:com|incluindo|inclusas?|incluidas?|bills?|contas?|faturas?)\b/g, ' ')
    .replace(/\b(?:disponivel agora|entrada imediata|agora|imediata)\b/g, ' ')
    .replace(/\b(?:para|p\/|pessoas?|people)\s*\d+\+?\b/g, ' ')
    .replace(/\b(?:em|no|na|perto de|regiao|zona)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    filters: {
      search: requestedLocation ? normalizeSearchText(requestedLocation) : search,
      region: '',
      type: '',
      priceRange: priceMatch ? `0-${Math.round(Number(priceMatch[1].replace(',', '.')))}` : '',
      availableNow: wantsAvailableNow,
      billsIncluded: wantsBills,
      people: peopleMatch ? peopleMatch[1] : '',
      moveInBy: '',
      ...(requestedCategory ? { type: requestedCategory } : {}),
    },
    sortBy: 'price-asc',
  };
}
