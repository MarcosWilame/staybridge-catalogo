import { Bed, Calendar, CheckCircle, Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Property } from '../data/properties';
import { getAvailabilityInfo } from './availability';

export interface PropertyAttribute {
  icon: LucideIcon;
  label: string;
}

export function getPropertyAttributes(property: Property): PropertyAttribute[] {
  const category = property.category.toLowerCase();
  const type = property.type.toLowerCase();
  const { label: availabilityLabel } = getAvailabilityInfo(
    property.moveInDate,
    property.available
  );
  const isRoom = ['single', 'double', 'ensuite', 'studio'].some(
    (roomType) => category.includes(roomType) || type.includes(roomType)
  );

  if (!isRoom) {
    return [
      property.bedrooms
        ? { icon: Bed, label: `${property.bedrooms} quartos` }
        : null,
      { icon: Home, label: property.furnishing },
      { icon: Calendar, label: availabilityLabel },
    ].filter(Boolean) as PropertyAttribute[];
  }

  const attributes: PropertyAttribute[] = [{ icon: Home, label: 'Mobiliado' }];

  if (category.includes('studio') || type.includes('studio')) {
    attributes.push({ icon: CheckCircle, label: 'Bancada, Pia e Armário' });
    attributes.push({ icon: CheckCircle, label: 'Banheiro privativo' });
  } else if (category.includes('ensuite') || type.includes('ensuite')) {
    attributes.push({ icon: CheckCircle, label: 'Banheiro privativo' });
  }

  attributes.push({ icon: Calendar, label: availabilityLabel });
  return attributes;
}
