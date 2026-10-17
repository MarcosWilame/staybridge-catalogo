import test from 'node:test';
import assert from 'node:assert/strict';

import { PUBLIC_PAYLOAD_LIMITS, toPublicProperty } from '../api/public-property-fields.js';

const PUBLIC_PROPERTY_KEYS = [
  'id', 'image', 'images', 'video', 'coverMedia', 'type', 'title', 'region',
  'localArea', 'price', 'monthlyPrice', 'entryRent', 'description',
  'longDescription', 'available', 'listed', 'billsIncluded', 'bedrooms',
  'bathrooms', 'category', 'amenities', 'deposit', 'nearbyStations',
  'furnishing', 'moveInDate', 'postcode', 'people', 'availabilityStatus',
  'priceOptions', 'entryConditions',
];

test('public property API only returns explicitly allowed fields', () => {
  const property = toPublicProperty({
    id: 9,
    data: {
      title: 'Studio 9',
      listed: true,
      postcode: 'SW1 1AA',
      address: '1 Private Street',
      coordinates: { lat: 51.5, lng: -0.1 },
      BankAccount: 'must-not-leak',
      BankTransferReference: 'must-not-leak',
      internalNotes: 'must-not-leak',
    },
  });

  assert.equal(property.id, 9);
  assert.equal(property.title, 'Studio 9');
  assert.equal(property.postcode, 'SW1 1AA');
  assert.equal('BankAccount' in property, false);
  assert.equal('BankTransferReference' in property, false);
  assert.equal('internalNotes' in property, false);
  assert.equal('address' in property, false);
  assert.equal('coordinates' in property, false);
  assert.deepEqual(Object.keys(property), PUBLIC_PROPERTY_KEYS);
  assert.equal('sourceText' in property, false);
  assert.deepEqual(property.entryConditions, {});
});

test('public property payload applies documented collection and text limits', () => {
  const property = toPublicProperty({
    id: 14,
    data: {
      id: 14,
      listed: true,
      title: 'Studio with bounded public data',
      description: 'd'.repeat(900),
      longDescription: 'l'.repeat(5000),
      images: [
        'javascript:alert(1)',
        ...Array.from({ length: 12 }, (_, index) => `https://images.unsplash.com/property-${index}.jpg`),
      ],
      nearbyStations: Array.from({ length: 14 }, (_, index) => `Station ${index}`),
      priceOptions: Array.from({ length: 9 }, (_, index) => ({ amount: 100 + index, period: 'week' })),
      price: '£100/week',
      category: 'studio',
      available: true,
      moveInDate: 'Available now',
      sourceText: 'internal source',
      entryConditions: { note: 'internal conditions' },
    },
  });

  assert.equal(property.description.length, PUBLIC_PAYLOAD_LIMITS.description);
  assert.equal(property.longDescription.length, PUBLIC_PAYLOAD_LIMITS.longDescription);
  assert.equal(property.images.length, PUBLIC_PAYLOAD_LIMITS.images);
  assert.equal(property.nearbyStations.length, PUBLIC_PAYLOAD_LIMITS.nearbyStations);
  assert.equal(property.priceOptions.length, PUBLIC_PAYLOAD_LIMITS.priceOptions);
  assert.deepEqual(property.entryConditions, {});
  assert.equal(property.images.some((url) => url.includes('javascript:')), false);
});

test('public property API preserves commercial prices and structured entry conditions', () => {
  const compositePrice = '£220/week (2 pessoas) | £200/week (1 pessoa)';
  const property = toPublicProperty({
    id: 16,
    data: {
      id: 16,
      listed: true,
      price: compositePrice,
      entryConditions: { depositWeeks: 2, rentWeeks: 1, note: 'private internal note' },
    },
  });

  assert.equal(property.price, compositePrice);
  assert.deepEqual(property.priceOptions, [
    { amount: 220, period: 'week', occupancy: 2 },
    { amount: 200, period: 'week', occupancy: 1 },
  ]);
  assert.deepEqual(property.entryConditions, { depositWeeks: 2, rentWeeks: 1 });
});

test('public property media keeps the cover once and removes duplicate image URLs', () => {
  const property = toPublicProperty({
    id: 15,
    data: {
      id: 15,
      listed: true,
      image: 'https://images.unsplash.com/cover.jpg',
      images: [
        'https://images.unsplash.com/cover.jpg',
        'https://images.unsplash.com/room.jpg',
        'https://images.unsplash.com/room.jpg',
      ],
    },
  });

  assert.deepEqual(property.images, [
    'https://images.unsplash.com/cover.jpg',
    'https://images.unsplash.com/room.jpg',
  ]);
});

test('public property media replaces expiring signed storage URLs with the stable proxy', () => {
  const property = toPublicProperty({
    id: 17,
    data: {
      id: 17,
      listed: true,
      image: 'https://example.supabase.co/storage/v1/object/sign/property-images/library/Room%203/photo.jpeg?token=expired',
    },
  });

  assert.equal(property.image, '/api/property-media?id=17&slot=cover');
  assert.deepEqual(property.images, ['/api/property-media?id=17&slot=cover']);
});

test('public property API excludes hidden properties', () => {
  assert.equal(toPublicProperty({ id: 10, data: { listed: false } }), null);
  assert.equal(toPublicProperty({ id: 11, data: {} }), null);
});

test('public property API respects listed even when status is stale', () => {
  const available = toPublicProperty({
    id: 12,
    data: { id: 12, title: 'Studio', status: 'available', available: false, listed: false },
  });
  const hidden = toPublicProperty({
    id: 13,
    data: { id: 13, title: 'Studio', status: 'reserved', available: true, listed: false },
  });

  assert.equal(available, null);
  assert.equal(hidden, null);
});

test('public payload excludes administrative quality metadata', () => {
  const property = toPublicProperty({
    id: 14,
    data: {
      id: 14,
      listed: true,
      title: 'Studio with quality metadata',
      image: 'https://images.unsplash.com/studio.jpg',
      price: '£200/week',
      quality: {
        score: 10,
        blockerCount: 2,
        warningCount: 1,
        categories: ['pricing'],
        issues: [{ id: 'pricing.missing', message: 'private', fix: 'private' }],
      },
    },
  });

  assert.equal('quality' in property, false);
  assert.equal('score' in property, false);
  assert.equal('issues' in property, false);
});
