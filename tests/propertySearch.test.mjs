import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPropertySearchAnswer,
  filterAndSortProperties,
  parsePropertySearchQuery,
} from '../src/app/utils/propertySearch.ts';

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

test('chat query parsing produces the same results as catalog filters', () => {
  const query = 'studio até £250 em Streatham com bills inclusas';
  const parsed = parsePropertySearchQuery(properties, query);
  const chatResults = filterAndSortProperties(properties, parsed.filters, parsed.sortBy).map((p) => p.id);
  const catalogResults = filterAndSortProperties(properties, {
    ...emptyFilters,
    search: 'streatham',
    type: 'studio',
    priceRange: '0-250',
    billsIncluded: true,
  }, 'price-asc').map((p) => p.id);

  assert.deepEqual(parsed.filters, {
    search: 'streatham',
    region: '',
    type: 'studio',
    priceRange: '0-250',
    availableNow: false,
    billsIncluded: true,
    people: '',
    moveInBy: '',
  });
  assert.deepEqual(chatResults, catalogResults);
});

test('chat parsing keeps normalized direct terms and shared empty results', () => {
  const parsed = parsePropertySearchQuery(properties, 'HARROW');
  assert.deepEqual(
    filterAndSortProperties(properties, parsed.filters, parsed.sortBy).map((p) => p.id),
    filterAndSortProperties(properties, { ...emptyFilters, search: 'harrow' }, 'price-asc').map((p) => p.id)
  );
  assert.deepEqual(
    filterAndSortProperties(properties, parsePropertySearchQuery(properties, 'apartamento em Wembley').filters, 'price-asc'),
    []
  );
});

test('natural-language capacity and availability use canonical filters', () => {
  const parsed = parsePropertySearchQuery(properties, 'double para 2 disponível agora');
  assert.equal(parsed.filters.type, 'double');
  assert.equal(parsed.filters.people, '2');
  assert.equal(parsed.filters.availableNow, true);
  assert.deepEqual(
    filterAndSortProperties(properties, parsed.filters, parsed.sortBy).map((p) => p.id),
    [2]
  );
});

test('chat presentation preserves canonical counts while limiting visible cards', () => {
  assert.equal(buildPropertySearchAnswer(5, 3), 'Encontrei 5 opções no catálogo. Mostrando 3 resultados mais próximos:');
  assert.equal(buildPropertySearchAnswer(1, 1), 'Encontrei 1 opção no catálogo. Mostrando 1 resultado mais próximos:');
  assert.equal(buildPropertySearchAnswer(0, 0), 'Não encontrei um imóvel com esses critérios. Tente buscar por região, tipo, preço máximo ou bills inclusas.');
});
