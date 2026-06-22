import test from 'node:test';
import assert from 'node:assert/strict';

import { getAvailabilityInfo, getMoveInTimestamp } from '../src/app/utils/availability.ts';

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

test('move-in timestamps normalize immediate, ISO and UK-style dates', () => {
  const today = new Date(2026, 5, 22);

  assert.equal(getMoveInTimestamp('now', true, today), new Date(2026, 5, 22).getTime());
  assert.equal(getMoveInTimestamp('2026-07-10', true, today), new Date(2026, 6, 10).getTime());
  assert.equal(getMoveInTimestamp('10/07/2026', true, today), new Date(2026, 6, 10).getTime());
});

test('past move-in dates become available now when the property is active', () => {
  const today = new Date(2026, 5, 22);
  assert.deepEqual(getAvailabilityInfo('02/06/2026', true, today), {
    label: 'Disponível agora',
    isNow: true,
  });
});
