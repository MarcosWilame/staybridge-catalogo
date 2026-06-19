import test from 'node:test';
import assert from 'node:assert/strict';

import { getAvailabilityInfo } from '../src/app/utils/availability.ts';

test('availability labels immediate properties as available now', () => {
  assert.deepEqual(getAvailabilityInfo('now', true), {
    label: 'Disponível agora',
    isNow: true,
  });
});

test('availability keeps dates visible for unavailable properties', () => {
  assert.deepEqual(getAvailabilityInfo('2026-09-14', false), {
    label: 'Disponível em 14/09/2026',
    isNow: false,
  });
});

test('availability shows unavailable only when there is no usable date', () => {
  assert.deepEqual(getAvailabilityInfo('', false), {
    label: 'Indisponível',
    isNow: false,
  });
});
