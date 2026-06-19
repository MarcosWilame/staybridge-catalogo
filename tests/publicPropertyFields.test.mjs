import test from 'node:test';
import assert from 'node:assert/strict';

import { toPublicProperty } from '../api/public-property-fields.js';

test('public property API only returns explicitly allowed fields', () => {
  const property = toPublicProperty({
    id: 9,
    data: {
      title: 'Studio 9',
      listed: true,
      postcode: 'SW1 1AA',
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
});

test('public property API excludes hidden properties', () => {
  assert.equal(toPublicProperty({ id: 10, data: { listed: false } }), null);
});
