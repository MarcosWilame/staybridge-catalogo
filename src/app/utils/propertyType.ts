import type { Property } from '../data/properties';

const categoryLabels: Record<string, string> = {
  studio: 'Estúdio',
  ensuite: 'Suíte',
  flat: 'Apartamento',
  apartment: 'Apartamento',
  single: 'Quarto individual',
  double: 'Quarto duplo',
};

export function formatPropertyType(
  property: Pick<Property, 'category' | 'type'>
) {
  return categoryLabels[property.category?.toLowerCase()] || property.type;
}
