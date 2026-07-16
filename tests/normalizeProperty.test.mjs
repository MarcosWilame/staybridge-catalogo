import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeProperties,
  normalizeProperty,
} from '../src/app/data/supabaseProperties.ts';

test('normalizeProperty coerces common spreadsheet/admin values', () => {
  const property = normalizeProperty({
    id: '7',
    title: 'Ensuite Test',
    type: 'Ensuite',
    price: '320',
    available: 'sim',
    billsIncluded: 'true',
    category: '',
    images: ['https://images.unsplash.com/photo.jpg'],
    coordinates: { lat: '51.5', lng: '-0.12' },
    people: 2,
  });

  assert.equal(property.id, 7);
  assert.equal(property.category, 'ensuite');
  assert.equal(property.price, '£320/week');
  assert.equal(property.available, true);
  assert.equal(property.status, 'available');
  assert.equal(property.billsIncluded, true);
  assert.deepEqual(property.coordinates, { lat: 51.5, lng: -0.12 });
});

test('normalizeProperties drops invalid rows', () => {
  const normalized = normalizeProperties([{ id: 1 }, { id: 'bad' }, null]);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].id, 1);
});

test('normalizeProperty uses status as the source of truth for visibility', () => {
  const available = normalizeProperty({ id: 8, status: 'available', available: false, listed: false });
  const reserved = normalizeProperty({ id: 9, status: 'reserved', available: true, listed: false });

  assert.deepEqual(
    { status: available.status, available: available.available, listed: available.listed },
    { status: 'available', available: true, listed: true }
  );
  assert.deepEqual(
    { status: reserved.status, available: reserved.available, listed: reserved.listed },
    { status: 'reserved', available: false, listed: true }
  );
});
