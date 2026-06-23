import test from 'node:test';
import assert from 'node:assert/strict';

import { parsePropertyDescription } from '../src/app/utils/propertyDescription.ts';

test('property description separates heading, paragraphs and inline bullets', () => {
  assert.deepEqual(
    parsePropertyDescription(
      '🏡 1 Bedroom Flat em Tottenham\n\nApartamento privativo e confortável. • Sala separada • Cozinha privativa'
    ),
    {
      title: '1 Bedroom Flat em Tottenham',
      paragraphs: ['Apartamento privativo e confortável.'],
      highlights: ['Sala separada', 'Cozinha privativa'],
    }
  );
});

test('plain descriptions remain paragraphs instead of becoming headings', () => {
  assert.deepEqual(parsePropertyDescription('Apartamento mobiliado em Londres.'), {
    title: '',
    paragraphs: ['Apartamento mobiliado em Londres.'],
    highlights: [],
  });
});
