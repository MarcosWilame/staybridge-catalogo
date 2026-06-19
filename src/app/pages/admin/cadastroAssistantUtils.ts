import type { Property } from '../../data/properties';
import type { StorageImageItem, StorageVideoItem } from '../../data/supabaseProperties';
import { getCategoryLabel } from './adminConfig';

export type CadastroAssistantForm = {
  category: string;
  unit: string;
  bedrooms: string;
  address: string;
  postcode: string;
  localArea: string;
  region: 'south' | 'north';
  price: string;
  people: string;
  moveInDate: string;
};

export type CadastroAssistantResult = {
  path: string;
  images: StorageImageItem[];
  videos: StorageVideoItem[];
  totalImages: number;
  totalVideos: number;
};

export const INITIAL_ASSISTANT_FORM: CadastroAssistantForm = {
  category: 'studio',
  unit: '',
  bedrooms: '1',
  address: '',
  postcode: '',
  localArea: '',
  region: 'south',
  price: '',
  people: '2',
  moveInDate: 'Disponível agora',
};

export function simplifyAssistantText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function removeHouseNumber(address: string) {
  return address
    .replace(/^\s*\d+[a-z]?\s+/i, '')
    .replace(/\s+[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\s*$/i, '')
    .trim();
}

export function getAssistantUnitFolder(category: string, unit: string) {
  const trimmedUnit = unit.trim();
  if (!trimmedUnit) return '';
  return category === 'flat' ? `Flat ${trimmedUnit}` : `Room ${trimmedUnit}`;
}

export function getAssistantType(category: string, bedrooms: string) {
  if (category === 'flat') {
    const count = Number(bedrooms) || 1;
    return `${count} bedroom flat`;
  }

  return getCategoryLabel(category);
}

function getAssistantTitle(form: CadastroAssistantForm) {
  const type = getAssistantType(form.category, form.bedrooms);
  const unit = form.unit.trim();
  const postcode = form.postcode.trim().toUpperCase();
  return [type, unit, postcode ? `- ${postcode}` : ''].filter(Boolean).join(' ');
}

function getAssistantLongDescription(form: CadastroAssistantForm) {
  const type = getAssistantType(form.category, form.bedrooms);
  const publicStreet = removeHouseNumber(form.address) || form.address;
  const area = form.localArea.trim();
  const postcode = form.postcode.trim().toUpperCase();
  const price = form.price.trim()
    ? `£${form.price.trim().replace(/^£/, '')}/week`
    : 'Preço sob consulta';
  const availability = form.moveInDate.trim() || 'Disponível agora';
  const isFlat = form.category === 'flat';

  return [
    '✨ Destaques do imóvel:',
    '',
    isFlat ? `${type} totalmente privativo` : `${type} confortável e bem localizado`,
    '',
    isFlat
      ? `🛏️ Ideal para até ${form.people || '2'} pessoas`
      : '🛏️ Quarto funcional e confortável',
    '',
    isFlat ? '🍳 Cozinha privativa e funcional' : '🍳 Cozinha compartilhada e equipada',
    '',
    isFlat ? '🛁 Banheiro privativo' : '🛁 Banheiro conforme configuração do imóvel',
    '',
    'Ambiente confortável, prático e bem localizado',
    '',
    'Contrato seguro e sem burocracia',
    '',
    availability,
    '',
    `📍 Localização: ${[publicStreet, area].filter(Boolean).join(', ')}${postcode ? ` - ${postcode}` : ''}`,
    '',
    `💷 ${price}`,
  ].join('\n');
}

export function createAssistantFormFromProperty(property: Omit<Property, 'id'>) {
  return {
    category: property.category || 'studio',
    unit: '',
    bedrooms: String(property.bedrooms || 1),
    address: property.address || '',
    postcode: property.postcode || '',
    localArea: property.localArea || '',
    region: property.region.toLowerCase().includes('north') ? 'north' : 'south',
    price: String(Number(property.price.replace(/[^\d.]/g, '')) || ''),
    people: String(property.people || 2),
    moveInDate: property.moveInDate || 'Disponível agora',
  } satisfies CadastroAssistantForm;
}

export function applyAssistantToProperty(
  current: Omit<Property, 'id'>,
  form: CadastroAssistantForm,
  result: CadastroAssistantResult | null
) {
  const type = getAssistantType(form.category, form.bedrooms);
  const title = getAssistantTitle(form);
  const price = form.price.trim()
    ? `£${form.price.trim().replace(/^£/, '')}/week`
    : current.price;
  const images = result?.images.map((item) => item.url) || [];
  const video = result?.videos[0]?.url || current.video || '';
  const publicStreet = removeHouseNumber(form.address);
  const area = form.localArea.trim();
  const postcode = form.postcode.trim().toUpperCase();

  return {
    ...current,
    title: title || current.title,
    type,
    category: form.category,
    address: form.address.trim() || current.address,
    postcode: postcode || current.postcode,
    localArea: area || current.localArea,
    region: form.region === 'north' ? 'North London' : 'South London',
    price,
    people: Number(form.people) || current.people,
    bedrooms:
      form.category === 'flat' ? Number(form.bedrooms) || current.bedrooms : current.bedrooms,
    bathrooms: current.bathrooms || 1,
    furnishing: 'Mobiliado',
    moveInDate: form.moveInDate || current.moveInDate,
    description:
      form.category === 'flat'
        ? `${type} em ${area || publicStreet}, ideal para até ${form.people || '2'} pessoas.`
        : `${type} em ${area || publicStreet}, com boa localização e processo simples.`,
    longDescription: getAssistantLongDescription(form),
    images: images.length ? images : current.images,
    image: images[0] || current.image,
    video,
    listed: true,
    available: true,
    status: 'available',
  } satisfies Omit<Property, 'id'>;
}
