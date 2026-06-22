import test from 'node:test';
import assert from 'node:assert/strict';
import { getPropertyImageAlt } from '../src/app/utils/imageAlt.ts';

test('property image alt text includes image position, type and location', () => {
  const alt = getPropertyImageAlt(
    {
      title: 'Studio 8',
      type: 'Studio',
      region: 'North London',
      localArea: 'Dollis Hill',
    },
    2
  );

  assert.equal(
    alt,
    'Foto 3 de Studio 8, Studio para alugar em Dollis Hill, Londres'
  );
});
