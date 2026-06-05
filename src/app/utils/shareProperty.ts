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

export async function shareProperty(property: Property) {
  const payload = createPropertySharePayload(property);

  if (navigator.share) {
    await navigator.share(payload);
    return 'shared';
  }

  await navigator.clipboard.writeText(payload.url);
  return 'copied';
}
