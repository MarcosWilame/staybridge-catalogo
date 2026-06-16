import type { Property } from '../data/properties';

export function createPropertySharePayload(property: Property, origin = window.location.origin) {
  const url = `${origin}/property/${property.id}`;
  const text = `${property.title} - ${property.region}`;

  return {
    title: property.title,
    text,
    url,
  };
}

function cleanDisplayText(value?: string | number | null) {
  return String(value ?? '')
    .replace(/\u00c2\u00a3/g, '\u00a3')
    .trim();
}

function getPropertyUrl(property: Property, origin?: string) {
  const baseUrl =
    origin ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return baseUrl ? `${baseUrl}/property/${property.id}` : `/property/${property.id}`;
}

export function createWhatsAppLeadMessage(property: Property, origin?: string) {
  const details = [
    `Imovel: ${cleanDisplayText(property.title)}`,
    `Tipo: ${cleanDisplayText(property.type)}`,
    `Regiao: ${cleanDisplayText(property.region)}`,
    property.localArea ? `Area: ${cleanDisplayText(property.localArea)}` : '',
    property.postcode ? `Postcode: ${cleanDisplayText(property.postcode)}` : '',
    property.price ? `Valor: ${cleanDisplayText(property.price)}` : '',
    property.billsIncluded ? 'Bills: inclusas' : '',
    `ID: ${property.id}`,
    `Link: ${getPropertyUrl(property, origin)}`,
  ].filter(Boolean);

  return [
    'Ola! Tenho interesse neste imovel.',
    '',
    ...details,
    '',
    'Pode me enviar mais detalhes e confirmar a disponibilidade?',
  ].join('\n');
}

export async function shareProperty(property: Property) {
  const payload = createPropertySharePayload(property);

  if (navigator.share) {
    await navigator.share(payload);
    return 'shared';
  }

  await navigator.clipboard.writeText(payload.url);
  return 'copied';
}
