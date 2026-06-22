import type { Property } from '../data/properties';

const categoryLabels: Record<string, string> = {
  studio: 'Studio',
  ensuite: 'Ensuite',
  flat: 'Flat',
  apartment: 'Flat',
  single: 'Single Room',
  double: 'Double Room',
};

export function formatPropertyType(
  property: Pick<Property, 'category' | 'type'>
) {
  return categoryLabels[property.category?.toLowerCase()] || property.type;
}
