import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyPropertyStatus,
  findDuplicateProperty,
  getAdminDashboardMetrics,
  getAvailabilityAgenda,
  getPropertyManagementStatus,
} from '../src/app/pages/admin/propertyManagement.ts';

function property(overrides = {}) {
  return {
    id: 1,
    image: 'https://example.com/image.jpg',
    images: ['https://example.com/image.jpg'],
    type: 'Studio',
    title: 'Studio 6 - SW17 9PZ',
    region: 'South London',
    price: '£300/week',
    description: '',
    longDescription: '',
    available: true,
    listed: true,
    billsIncluded: true,
    bedrooms: 1,
    bathrooms: 1,
    category: 'studio',
    amenities: [],
    deposit: 0,
    nearbyStations: [],
    coordinates: { lat: 0, lng: 0 },
    furnishing: 'Mobiliado',
    moveInDate: 'Disponível agora',
    postcode: 'SW17 9PZ',
    address: '10 Example Road SW17 9PZ',
    people: 2,
    ...overrides,
  };
}

test('findDuplicateProperty matches address, postcode and unit', () => {
  const existing = property();
  const duplicate = findDuplicateProperty([existing], {
    address: '10 Example Road, SW17 9PZ',
    postcode: 'sw17 9pz',
    title: 'Studio 6 - SW17 9PZ',
    unit: '6',
  });

  assert.equal(duplicate?.id, 1);
});

test('findDuplicateProperty allows another unit and ignores the edited property', () => {
  const existing = property();

  assert.equal(
    findDuplicateProperty([existing], {
      address: existing.address,
      postcode: existing.postcode,
      title: 'Studio 7 - SW17 9PZ',
      unit: '7',
    }),
    undefined
  );
  assert.equal(
    findDuplicateProperty([existing], existing, existing.id),
    undefined
  );
});

test('getAdminDashboardMetrics calculates visibility and regions', () => {
  const metrics = getAdminDashboardMetrics([
    property(),
    property({ id: 2, title: 'Studio 7', price: '£434.50/month', moveInDate: '20/08/2026' }),
    property({ id: 3, title: 'Studio 8', listed: false, available: false, region: 'North London' }),
    property({ id: 4, title: 'Studio 9', price: '£50/day', region: 'North London' }),
  ]);

  assert.equal(metrics.visible, 3);
  assert.equal(metrics.rented, 1);
  assert.equal(metrics.availableNow, 2);
  assert.deepEqual(metrics.regions, [
    { name: 'South London', count: 2 },
    { name: 'North London', count: 1 },
  ]);
});

test('property status keeps visibility and availability consistent', () => {
  const reserved = applyPropertyStatus(property(), 'reserved');
  const rented = applyPropertyStatus(property(), 'rented');
  const available = applyPropertyStatus(rented, 'available');

  assert.deepEqual(
    { status: reserved.status, listed: reserved.listed, available: reserved.available },
    { status: 'reserved', listed: true, available: false }
  );
  assert.deepEqual(
    { status: rented.status, listed: rented.listed, available: rented.available },
    { status: 'rented', listed: false, available: false }
  );
  assert.equal(getPropertyManagementStatus(available), 'available');
  assert.equal(available.listed, true);
  assert.equal(available.available, true);
});

test('availability agenda filters and orders the selected time window', () => {
  const today = new Date(2026, 5, 19);
  const properties = [
    property({ id: 1, moveInDate: '2026-06-24' }),
    property({ id: 2, moveInDate: '28/06/2026' }),
    property({ id: 3, moveInDate: '10/07/2026' }),
    property({ id: 4, moveInDate: '2026-06-22', status: 'rented' }),
  ];

  assert.deepEqual(
    getAvailabilityAgenda(properties, 7, today).map((item) => item.property.id),
    [1]
  );
  assert.deepEqual(
    getAvailabilityAgenda(properties, 15, today).map((item) => item.property.id),
    [1, 2]
  );
  assert.deepEqual(
    getAvailabilityAgenda(properties, 30, today).map((item) => item.property.id),
    [1, 2, 3]
  );
});
