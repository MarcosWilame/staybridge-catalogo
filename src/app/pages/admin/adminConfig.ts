import type { InputHTMLAttributes } from 'react';
import type { Property } from '../../data/properties';

export const INITIAL_FORM: Omit<Property, 'id'> = {
  company: 'EasyShare',
  image: '',
  images: [],
  video: '',
  type: 'Studio',
  title: '',
  region: '',
  price: '',
  description: '',
  longDescription: '',
  available: true,
  listed: true,
  status: 'available',
  billsIncluded: false,
  bedrooms: 1,
  bathrooms: 0,
  category: 'studio',
  amenities: [],
  deposit: 0,
  nearbyStations: [],
  coordinates: { lat: 0, lng: 0 },
  furnishing: 'Mobiliado',
  moveInDate: 'Disponível agora',
  postcode: '',
  address: '',
  people: 1,
};

export type AdminStatusFilter =
  | 'all'
  | 'available'
  | 'reserved'
  | 'rented'
  | 'hidden'
  | 'maintenance'
  | 'trash';
export type AdminAvailabilityFilter = 'all' | 'available' | 'unavailable';
export type FolderInputProps = InputHTMLAttributes<HTMLInputElement> & {
  directory?: string;
  mozdirectory?: string;
  webkitdirectory?: string;
};

export const adminInputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-[var(--green-dark)] focus:ring-2 focus:ring-[var(--green-dark)]/15';

export const adminTextAreaClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none transition focus:border-[var(--green-dark)] focus:ring-2 focus:ring-[var(--green-dark)]/15';

export const adminLabelClass = 'mb-2 flex items-center gap-2 text-sm font-bold text-gray-800';

export const CATEGORY_OPTIONS = [
  { value: 'studio', label: 'Studio' },
  { value: 'ensuite', label: 'Ensuite' },
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' },
  { value: 'flat', label: 'Flat' },
];

export const AMENITY_OPTIONS = [
  'Wi-Fi',
  'Mobiliado',
  'Bills inclusas',
  'Banheiro privativo',
  'Cozinha equipada',
  'Lavanderia',
  'Cama',
  'Guarda-roupa',
  'Mesa de estudos',
  'TV',
  'Jardim',
  'Estacionamento',
];

export const MOVE_IN_OPTIONS = ['Disponível agora', 'A combinar', 'Em breve'];

export const PRICE_PERIOD_OPTIONS = [
  { value: '/week', label: 'por semana' },
  { value: '/month', label: 'por mes' },
  { value: '/day', label: 'por dia' },
];

export const STATION_SUGGESTIONS = [
  'Dollis Hill Station',
  'Willesden Green Station',
  'Kilburn Station',
  'Neasden Station',
  'Cricklewood Station',
  'Wembley Park Station',
  'Stratford Station',
  'Canada Water Station',
  'London Bridge Station',
  'Elephant & Castle Station',
];

export function getCategoryLabel(category: string) {
  return CATEGORY_OPTIONS.find((option) => option.value === category)?.label || category;
}

export function getStationMapQuery(formData: Omit<Property, 'id'>) {
  return [
    'train station tube station near',
    formData.address,
    formData.postcode,
    formData.region,
    'London',
  ]
    .filter(Boolean)
    .join(' ');
}
