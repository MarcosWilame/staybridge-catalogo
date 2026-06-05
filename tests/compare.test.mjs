import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCompareProperties,
  getLowestComparePrice,
  toggleCompareId,
} from '../src/app/utils/compare.ts';

test('toggleCompareId adds, removes, and respects the limit', () => {
  assert.deepEqual(toggleCompareId([], 10), { status: 'added', ids: [10] });
  assert.deepEqual(toggleCompareId([10], 10), { status: 'removed', ids: [] });
  assert.deepEqual(toggleCompareId([1, 2, 3], 4), { status: 'limit', ids: [1, 2, 3] });
});

test('compare helpers preserve selected order and find the lowest price', () => {
  const properties = [
    { id: 1, title: 'A', price: '£350/week' },
    { id: 2, title: 'B', price: '£280/week' },
    { id: 3, title: 'C', price: '£410/week' },
  ];

  const selected = getCompareProperties(properties, [3, 2]);

  assert.deepEqual(
    selected.map((property) => property.id),
    [3, 2]
  );
  assert.equal(getLowestComparePrice(selected), 280);
});
