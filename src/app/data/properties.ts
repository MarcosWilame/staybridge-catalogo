/** Publication state shown in Admin. Availability comes from moveInDate. */
export type PropertyStatus = 'available' | 'hidden';

export type PropertyQualitySummary = {
  score: number;
  isPublishable: boolean;
  blockerCount: number;
  warningCount: number;
  categories: string[];
  issues?: Array<{
    id: string;
    severity: 'blocker' | 'warning';
    category: string;
    categoryLabel: string;
    fields: string[];
    message: string;
    fix: string;
  }>;
};

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
  monthlyPrice?: string;
  entryRent?: string;
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
  availabilityStatus?: import('./propertySchema').PropertyAvailability;
  priceOptions?: import('./propertySchema').PropertyPriceOption[];
  entryConditions?: import('./propertySchema').PropertyEntryConditions;
  sourceText?: string;
  quality?: PropertyQualitySummary;
}
