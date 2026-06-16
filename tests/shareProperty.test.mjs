import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createPropertySharePayload,
  createWhatsAppLeadMessage,
  shareProperty,
} from '../src/app/utils/shareProperty.ts';

const property = {
  id: 42,
  title: 'Studio 42',
  type: 'Studio',
  region: 'North London',
  localArea: 'Dollis Hill',
  price: 'Â£350/week',
  billsIncluded: true,
  postcode: 'NW10 2EL',
};

test('createPropertySharePayload builds a stable property URL', () => {
  assert.deepEqual(createPropertySharePayload(property, 'https://example.com'), {
    title: 'Studio 42',
    text: 'Studio 42 - North London',
    url: 'https://example.com/property/42',
  });
});

test('createWhatsAppLeadMessage builds a detailed lead message', () => {
  assert.equal(
    createWhatsAppLeadMessage(property, 'https://example.com'),
    [
      'Ola! Tenho interesse neste imovel.',
      '',
      'Imovel: Studio 42',
      'Tipo: Studio',
      'Regiao: North London',
      'Area: Dollis Hill',
      'Postcode: NW10 2EL',
      'Valor: £350/week',
      'Bills: inclusas',
      'ID: 42',
      'Link: https://example.com/property/42',
      '',
      'Pode me enviar mais detalhes e confirmar a disponibilidade?',
    ].join('\n')
  );
});

test('shareProperty copies the URL when native share is unavailable', async () => {
  const writes = [];
  const previousWindow = globalThis.window;
  const previousNavigator = globalThis.navigator;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'https://example.com' } },
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      clipboard: {
        writeText: async (value) => {
          writes.push(value);
        },
      },
    },
  });

  try {
    assert.equal(await shareProperty(property), 'copied');
    assert.deepEqual(writes, ['https://example.com/property/42']);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: previousNavigator,
    });
  }
});
