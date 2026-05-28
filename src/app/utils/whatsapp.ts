import type { Property } from '../data/properties';
import { getAvailabilityInfo } from './availability';

export const WHATSAPP_NUMBER = '5588997993046';

export const DEFAULT_WHATSAPP_MESSAGE =
  'Olá! Tenho interesse nas acomodações da Staybridge London e gostaria de receber mais informações.';

export function getWhatsAppUrl(message = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getPropertyWhatsAppMessage(property: Property) {
  const { label: availabilityLabel } = getAvailabilityInfo(property.moveInDate);

  const details = [
    `Tipo: ${property.type}`,
    `Título: ${property.title}`,
    `Região: ${property.region}`,
    property.localArea ? `Área: ${property.localArea}` : null,
    property.price ? `Valor: ${property.price}` : null,
    property.bedrooms ? `Quartos: ${property.bedrooms}` : null,
    property.bathrooms ? `Banheiros: ${property.bathrooms}` : null,
    property.people ? `Capacidade: ${property.people} pessoa${property.people > 1 ? 's' : ''}` : null,
    property.furnishing ? `Mobília: ${property.furnishing}` : null,
    property.billsIncluded ? 'Bills inclusas: Sim' : 'Bills inclusas: Não',
    `Disponibilidade: ${availabilityLabel}`,
    property.postcode ? `Postcode: ${property.postcode}` : null,
    property.address ? `Endereço: ${property.address}` : null,
  ].filter(Boolean);

  return `Olá! Tenho interesse neste imóvel da Staybridge London:\n\n${details.join('\n')}\n\nPode me passar mais informações?`;
}

export function getPropertyWhatsAppUrl(property: Property) {
  return getWhatsAppUrl(getPropertyWhatsAppMessage(property));
}
