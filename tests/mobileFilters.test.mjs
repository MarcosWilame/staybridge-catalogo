import test from 'node:test';
import assert from 'node:assert/strict';

import {
  areMobileFiltersEqual,
  cloneMobileFilters,
  EMPTY_MOBILE_FILTERS,
  hasActiveFilterValues,
} from '../src/app/utils/mobileFilters.ts';

test('mobile filter draft starts as a clone and does not mutate applied filters', () => {
  const applied = { ...EMPTY_MOBILE_FILTERS, region: 'north' };
  const draft = cloneMobileFilters(applied);

  draft.region = 'south';

  assert.equal(applied.region, 'north');
  assert.equal(draft.region, 'south');
  assert.equal(areMobileFiltersEqual(applied, draft), false);
});

test('mobile filter draft supports reversible clear and equality checks', () => {
  const applied = { ...EMPTY_MOBILE_FILTERS, type: 'studio', billsIncluded: true };
  const cleared = cloneMobileFilters(EMPTY_MOBILE_FILTERS);
  const restored = cloneMobileFilters(applied);

  assert.equal(hasActiveFilterValues(applied), true);
  assert.equal(hasActiveFilterValues(cleared), false);
  assert.equal(areMobileFiltersEqual(applied, restored), true);
  assert.equal(areMobileFiltersEqual(applied, cleared), false);
});
