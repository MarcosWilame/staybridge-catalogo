import test from 'node:test';
import assert from 'node:assert/strict';

import { toPublicProperty } from '../api/public-property-fields.js';

const rawProperty = {
  id: 21,
  listed: true,
  title: 'Representative studio',
  type: 'Room',
  region: 'North London',
  localArea: 'Harrow',
  price: '£250/week',
  description: 'd'.repeat(800),
  longDescription: 'l'.repeat(5000),
  images: Array.from({ length: 15 }, (_, index) => `https://images.unsplash.com/property-${index}.jpg`),
  nearbyStations: Array.from({ length: 20 }, (_, index) => `Station ${index}`),
  priceOptions: Array.from({ length: 10 }, (_, index) => ({ amount: 200 + index, period: 'week' })),
  available: true,
  moveInDate: 'Available now',
  category: 'studio',
  billsIncluded: true,
  deposit: 2,
  sourceText: 's'.repeat(2000),
  entryConditions: { depositWeeks: 2, rentWeeks: 1, note: 'n'.repeat(240) },
  unknownInternalField: 'do not serialize',
};

test('reduced public property payload is smaller than the previous representative baseline', () => {
  const reduced = toPublicProperty({ id: rawProperty.id, data: rawProperty });
  const legacyBaseline = {
    ...reduced,
    images: rawProperty.images,
    nearbyStations: rawProperty.nearbyStations,
    priceOptions: rawProperty.priceOptions,
    longDescription: rawProperty.longDescription,
    sourceText: rawProperty.sourceText,
    entryConditions: rawProperty.entryConditions,
  };

  assert.ok(JSON.stringify(reduced).length < JSON.stringify(legacyBaseline).length);
  assert.equal(reduced.id, rawProperty.id);
  assert.equal(reduced.title, rawProperty.title);
  assert.equal(reduced.category, rawProperty.category);
  assert.equal(reduced.available, true);
  assert.equal(reduced.billsIncluded, true);
  assert.equal('unknownInternalField' in reduced, false);
  assert.equal('sourceText' in reduced, false);
  assert.deepEqual(reduced.entryConditions, { depositWeeks: 2, rentWeeks: 1 });
  assert.equal('note' in reduced.entryConditions, false);
});
