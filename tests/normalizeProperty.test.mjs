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
  assert.equal(property.billsIncluded, true);
  assert.deepEqual(property.coordinates, { lat: 51.5, lng: -0.12 });
});

test('normalizeProperties drops invalid rows', () => {
  const normalized = normalizeProperties([{ id: 1 }, { id: 'bad' }, null]);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].id, 1);
});
