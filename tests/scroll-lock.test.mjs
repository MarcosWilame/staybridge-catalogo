import test from 'node:test';
import assert from 'node:assert/strict';
import { lockDocumentScroll } from '../src/app/utils/useScrollLock.ts';

function createDocumentStyleFixture() {
  return {
    documentElement: {
      style: { overflow: 'clip', overscrollBehavior: 'contain' },
    },
    body: {
      style: { overflow: 'auto', overscrollBehavior: 'auto' },
    },
  };
}

test('document scroll lock survives overlapping overlays and restores prior styles', () => {
  const targetDocument = createDocumentStyleFixture();
  const releaseFirst = lockDocumentScroll(targetDocument);
  const releaseSecond = lockDocumentScroll(targetDocument);

  assert.deepEqual(targetDocument.documentElement.style, {
    overflow: 'hidden',
    overscrollBehavior: 'none',
  });
  assert.deepEqual(targetDocument.body.style, {
    overflow: 'hidden',
    overscrollBehavior: 'none',
  });

  releaseFirst();
  assert.equal(targetDocument.body.style.overflow, 'hidden');

  releaseSecond();
  assert.deepEqual(targetDocument.documentElement.style, {
    overflow: 'clip',
    overscrollBehavior: 'contain',
  });
  assert.deepEqual(targetDocument.body.style, {
    overflow: 'auto',
    overscrollBehavior: 'auto',
  });
});
