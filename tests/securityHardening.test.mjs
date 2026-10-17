import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { encodeStoragePath } from '../api/property-media.js';

test('storage signing preserves punctuation that belongs to the object key', () => {
  assert.equal(
    encodeStoragePath('library/4 Winsford Terrace, N18 1BS (Edmonton)/photo 1.jpeg'),
    'library/4%20Winsford%20Terrace,%20N18%201BS%20(Edmonton)/photo%201.jpeg'
  );
  assert.equal(encodeStoragePath('property/photo?#1.jpeg'), 'property/photo%3F%231.jpeg');
});

test('production HTML has no executable inline analytics bootstrap', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(html.includes('GTM-N4W93BG3'), false);
  assert.equal(html.includes('(function(w,d,s,l,i)'), false);
});

test('security migration revokes anonymous table reads and omits private source text', async () => {
  const sql = await readFile(
    new URL('../supabase/migrations/20261017_close_public_property_data_exposure.sql', import.meta.url),
    'utf8'
  );
  assert.match(sql, /revoke all on table public\.properties from public, anon;/i);
  assert.doesNotMatch(sql, /sourceText/i);
  assert.match(sql, /grant execute on function public\.get_public_properties\(\) to anon, authenticated;/i);
});
