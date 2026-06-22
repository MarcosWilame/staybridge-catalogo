import type { Property } from '../data/properties';

export function getPropertyImageAlt(
  property: Pick<Property, 'title' | 'type' | 'region' | 'localArea'>,
  imageIndex = 0
) {
  const area = property.localArea || property.region;
  return `Foto ${imageIndex + 1} de ${property.title}, ${property.type} para alugar em ${area}, Londres`;
}
