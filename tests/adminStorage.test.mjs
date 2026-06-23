import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeStoragePath } from '../api/admin-storage.js';

test('storage paths preserve existing folder names with spaces', () => {
  assert.equal(
    sanitizeStoragePath('library/NORTH-PICS/68 Willoughby Lane N17 0SP/Flat 2'),
    'library/NORTH-PICS/68 Willoughby Lane N17 0SP/Flat 2'
  );
});

test('storage paths reject traversal, absolute paths and control characters', () => {
  assert.equal(sanitizeStoragePath('../private/file.jpg'), '');
  assert.equal(sanitizeStoragePath('/library/file.jpg'), '');
  assert.equal(sanitizeStoragePath('library/folder\u0000/file.jpg'), '');
});
