import type { Property } from '../data/properties';
import { getPriceValue } from './price.ts';

export const MAX_COMPARE_ITEMS = 3;

export type CompareToggleResult =
  | { status: 'added'; ids: number[] }
  | { status: 'removed'; ids: number[] }
  | { status: 'limit'; ids: number[] };

export function toggleCompareId(
  currentIds: number[],
  propertyId: number,
  maxItems = MAX_COMPARE_ITEMS
): CompareToggleResult {
  if (currentIds.includes(propertyId)) {
    return {
      status: 'removed',
      ids: currentIds.filter((id) => id !== propertyId),
    };
  }

  if (currentIds.length >= maxItems) {
    return {
      status: 'limit',
      ids: currentIds,
    };
  }

  return {
    status: 'added',
    ids: [...currentIds, propertyId],
  };
}

export function getCompareProperties(properties: Property[], compareIds: number[]) {
  return compareIds
    .map((id) => properties.find((property) => property.id === id))
    .filter((property): property is Property => Boolean(property));
}

export function getLowestComparePrice(properties: Property[]) {
  const prices = properties
    .map((property) => getPriceValue(property.price))
    .filter((price) => price > 0);

  return prices.length ? Math.min(...prices) : 0;
}
