import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createPropertySharePayload,
  shareProperty,
} from '../src/app/utils/shareProperty.ts';

const property = {
  id: 42,
  title: 'Studio 42',
  region: 'North London',
};

test('createPropertySharePayload builds a stable property URL', () => {
  assert.deepEqual(createPropertySharePayload(property, 'https://example.com'), {
    title: 'Studio 42',
    text: 'Studio 42 - North London',
    url: 'https://example.com/property/42',
  });
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
