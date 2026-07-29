/** Publication state shown in Admin. Availability comes from moveInDate. */
export type PropertyStatus = 'available' | 'hidden';

export interface Property {
  id: number;
  company: string;
  image: string;
  images: string[];
  video?: string;
  coverMedia?: 'image' | 'video';
  type: string;
  title: string;
  region: string;
  localArea?: string;
  price: string;
  description: string;
  longDescription: string;
  available: boolean;
  listed?: boolean;
  status?: PropertyStatus;
  deletedAt?: string;
  billsIncluded: boolean;
  bedrooms?: number;
  bathrooms?: number;
  category: string;
  amenities: string[];
  deposit: number;
  nearbyStations: string[];
  coordinates: { lat: number; lng: number };
  furnishing: string;
  moveInDate: string;
  postcode: string;
  address: string;
  people: number;
}
