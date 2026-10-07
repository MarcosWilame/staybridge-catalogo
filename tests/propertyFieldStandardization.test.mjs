import test from 'node:test';
import assert from 'node:assert/strict';

import { validateAdminProperty } from '../api/_property-validation.js';
import { toPublicProperty } from '../api/public-property-fields.js';

const base = {
  id: 901,
  title: 'Ensuite 1',
  image: 'https://images.unsplash.com/property.jpg',
  listed: true,
};

test('normalizes category and occupancy rules', () => {
  const property = validateAdminProperty({ ...base, category: 'Ensuite', people: 8 });
  assert.equal(property.category, 'ensuite');
  assert.equal(property.people, 2);
  assert.equal(property.availabilityStatus, 'available_now');
});

test('preserves structured price and entry conditions', () => {
  const property = validateAdminProperty({
    ...base,
    category: 'double',
    price: '£220 por semana',
    priceOptions: [
      { amount: 220, period: 'week', occupancy: 2 },
      { amount: 200, period: 'week', occupancy: 1 },
    ],
    entryConditions: { depositWeeks: 2, rentWeeks: 1 },
  });

  assert.deepEqual(property.priceOptions, [
    { amount: 220, period: 'week', occupancy: 2 },
    { amount: 200, period: 'week', occupancy: 1 },
  ]);
  assert.deepEqual(property.entryConditions, { depositWeeks: 2, rentWeeks: 1 });
});

test('public normalization exposes future and confirmation states', () => {
  const future = toPublicProperty({ id: 902, data: { ...base, moveInDate: '12/10/2026' } });
  const confirm = toPublicProperty({ id: 903, data: { ...base, moveInDate: 'Consulte com um de nossos agentes' } });
  assert.equal(future.availabilityStatus, 'future');
  assert.equal(confirm.availabilityStatus, 'to_confirm');
});
