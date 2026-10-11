import test from 'node:test';
import assert from 'node:assert/strict';

import { assertPublicationQuality } from '../api/admin-properties.js';
import { logPropertyQualityResult } from '../api/property-quality-log.js';

const property = {
  id: 12,
  title: 'Studio publicado',
  region: 'South London',
  postcode: 'SE1 1AA',
  price: '£200 por semana',
  image: 'https://images.unsplash.com/studio.jpg',
  images: ['https://images.unsplash.com/studio.jpg'],
  listed: true,
  status: 'available',
  available: true,
  moveInDate: 'Disponível agora',
  category: 'studio',
  people: 2,
  description: 'Studio mobiliado com cozinha equipada, banheiro privativo e transporte próximo.',
  amenities: ['Wi-Fi'],
};

test('publication quality rejects blockers before persistence', () => {
  assert.throws(
    () => assertPublicationQuality({ ...property, price: '', priceOptions: [] }, false),
    (error) => error.statusCode === 422 && error.quality.blockerCount === undefined && error.quality.blockers.length > 0
  );
});

test('publication quality requires explicit confirmation for warnings', () => {
  assert.throws(
    () => assertPublicationQuality({ ...property, amenities: [] }, false),
    (error) => error.statusCode === 428 && error.quality.warnings.length > 0
  );
  assert.doesNotThrow(() => assertPublicationQuality({ ...property, amenities: [] }, true));
});

test('drafts can be saved without confirmation', () => {
  assert.doesNotThrow(() => assertPublicationQuality({ ...property, listed: false, price: '' }, false));
});

test('quality log contains only operational metadata', () => {
  const originalInfo = console.info;
  const messages = [];
  console.info = (...args) => messages.push(args.join(' '));
  try {
    const summary = logPropertyQualityResult(property, {
      score: 100,
      isPublishable: true,
      blockers: [],
      warnings: [],
      categories: [],
    }, 'test');
    assert.equal(summary.propertyId, property.id);
    assert.equal(messages.some((message) => message.includes(property.title)), false);
    assert.equal(messages.some((message) => message.includes('South London')), false);
  } finally {
    console.info = originalInfo;
  }
});
