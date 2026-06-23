import test from 'node:test';
import assert from 'node:assert/strict';

import { validateAdminProperties, validateAdminProperty } from '../api/_property-validation.js';
import { toPublicProperty } from '../api/public-property-fields.js';

const validProperty = {
  id: 7,
  title: 'Studio 7',
  image: 'https://images.unsplash.com/photo.jpg',
  images: ['https://images.unsplash.com/photo.jpg'],
  listed: true,
  available: true,
  people: 2,
};

test('admin validation strips unknown data and clamps numeric fields', () => {
  const property = validateAdminProperty({
    ...validProperty,
    people: 999,
    bedrooms: -4,
    internalSecret: 'must-not-persist',
  });

  assert.equal(property.people, 20);
  assert.equal(property.bedrooms, 0);
  assert.equal('internalSecret' in property, false);
});

test('admin collection rejects duplicate IDs', () => {
  assert.throws(
    () => validateAdminProperties([validProperty, validProperty]),
    /Duplicate property IDs/
  );
});

test('public fields reject unsafe media schemes and unknown hosts', () => {
  const property = toPublicProperty({
    id: 7,
    data: {
      ...validProperty,
      image: 'javascript:alert(1)',
      images: ['https://untrusted.example/image.jpg'],
      video: 'data:text/html,unsafe',
    },
  });

  assert.equal(property.image, '');
  assert.deepEqual(property.images, []);
  assert.equal(property.video, '');
});
