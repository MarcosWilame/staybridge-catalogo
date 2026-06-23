import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPublicPropertiesRevision,
  invalidatePublicPropertiesCache,
  PUBLIC_PROPERTIES_CACHE_KEY,
} from '../src/app/data/propertyCache.ts';

test('property updates invalidate the browser cache and publish a new revision', () => {
  const sessionValues = new Map([[PUBLIC_PROPERTIES_CACHE_KEY, 'cached']]);
  const localValues = new Map();
  globalThis.sessionStorage = {
    removeItem(key) { sessionValues.delete(key); },
  };
  globalThis.localStorage = {
    getItem(key) { return localValues.get(key) || null; },
    setItem(key, value) { localValues.set(key, value); },
  };

  const revision = invalidatePublicPropertiesCache();

  assert.equal(sessionValues.has(PUBLIC_PROPERTIES_CACHE_KEY), false);
  assert.equal(getPublicPropertiesRevision(), revision);

  delete globalThis.sessionStorage;
  delete globalThis.localStorage;
});
