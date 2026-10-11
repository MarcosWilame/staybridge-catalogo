import test from 'node:test';
import assert from 'node:assert/strict';

import { filterAndSortProperties } from '../src/app/utils/propertySearch.ts';

const base = {
  company: 'Staybridge',
  image: 'https://example.com/image.jpg',
  images: ['https://example.com/image.jpg'],
  type: 'Room',
  region: 'North London',
  localArea: 'Harrow',
  description: 'Bright room near Harrow station',
  longDescription: '',
  available: true,
  listed: true,
  billsIncluded: true,
  category: 'single',
  amenities: [],
  deposit: 2,
  nearbyStations: ['Harrow Station'],
  coordinates: { lat: 51.58, lng: -0.33 },
  furnishing: 'Furnished',
  moveInDate: 'Available now',
  postcode: 'HA2 0AA',
  address: '1 Test Street',
  people: 1,
  availabilityStatus: 'available_now',
};

const properties = [
  { ...base, id: 1, title: 'Single Harrow', price: '£180 per week' },
  { ...base, id: 2, title: 'Double Finchley', price: '£260 per week', region: 'North London', localArea: 'Finchley', description: 'Double room near Finchley station', category: 'double', people: 2, billsIncluded: false, nearbyStations: ['Finchley Station'] },
  { ...base, id: 3, title: 'Studio South', price: '£220 per week', region: 'South London', localArea: 'Streatham', description: 'Studio near Streatham station', category: 'studio', people: 2, nearbyStations: ['Streatham Station'] },
];

const emptyFilters = {
  search: '', region: '', type: '', priceRange: '', availableNow: false,
  billsIncluded: false, people: '', moveInBy: '',
};

test('property search keeps existing matching behavior across filters', () => {
  assert.deepEqual(
    filterAndSortProperties(properties, { ...emptyFilters, search: 'harrow' }, 'recommended').map((p) => p.id),
    [1]
  );
  assert.deepEqual(
    filterAndSortProperties(properties, { ...emptyFilters, priceRange: '200-280', people: '2' }, 'price-asc').map((p) => p.id),
    [3, 2]
  );
  assert.deepEqual(
    filterAndSortProperties(properties, { ...emptyFilters, billsIncluded: true }, 'recommended').map((p) => p.id),
    [1, 3]
  );
});

test('property search returns deterministic ordering for each sort', () => {
  assert.deepEqual(filterAndSortProperties(properties, emptyFilters, 'price-asc').map((p) => p.id), [1, 3, 2]);
  assert.deepEqual(filterAndSortProperties(properties, emptyFilters, 'price-desc').map((p) => p.id), [2, 3, 1]);
  assert.deepEqual(filterAndSortProperties(properties, { ...emptyFilters, search: 'does-not-exist' }, 'recommended'), []);
});
