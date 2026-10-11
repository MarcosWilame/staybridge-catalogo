import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluatePropertyQuality } from '../api/property-quality.js';

const complete = {
  id: 10,
  title: 'Studio próximo à estação',
  region: 'North London',
  postcode: 'NW1 1AA',
  price: '£220 por semana',
  image: 'https://images.unsplash.com/studio.jpg',
  images: ['https://images.unsplash.com/studio.jpg'],
  listed: true,
  status: 'available',
  available: true,
  moveInDate: 'Disponível agora',
  description: 'Studio mobiliado com cozinha equipada, banheiro privativo e acesso rápido ao transporte.',
  amenities: ['Wi-Fi'],
  category: 'studio',
  people: 2,
};

test('quality evaluator accepts a complete property for publication', () => {
  const result = evaluatePropertyQuality(complete);
  assert.equal(result.isPublishable, true);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.score, 100);
});

test('quality evaluator identifies missing essential fields as blockers', () => {
  const result = evaluatePropertyQuality({ id: 11, listed: true });
  assert.deepEqual(result.blockers.map((issue) => issue.id), [
    'identity.missing-title',
    'location.missing',
    'pricing.missing',
    'media.missing',
    'availability.missing',
  ]);
  assert.equal(result.isPublishable, false);
});

test('quality evaluator reports editorial gaps as warnings', () => {
  const result = evaluatePropertyQuality({ ...complete, description: 'Studio', amenities: [] });
  assert.equal(result.isPublishable, true);
  assert.deepEqual(result.warnings.map((issue) => issue.id), [
    'editorial.short-description',
    'editorial.missing-amenities',
  ]);
});

test('quality evaluator catches status and category inconsistencies', () => {
  const result = evaluatePropertyQuality({
    ...complete,
    status: 'hidden',
    people: 3,
  });
  assert.equal(result.isPublishable, false);
  assert.ok(result.blockers.some((issue) => issue.id === 'publication.status-listed-mismatch'));
  assert.ok(result.blockers.some((issue) => issue.id === 'capacity.category-mismatch'));
});

test('hidden drafts may omit availability without creating an availability blocker', () => {
  const result = evaluatePropertyQuality({ ...complete, listed: false, moveInDate: '', availabilityStatus: '' });
  assert.equal(result.blockers.some((issue) => issue.id === 'availability.missing'), false);
});
