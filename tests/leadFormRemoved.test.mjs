import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('lead form remains removed for now', () => {
  assert.equal(fs.existsSync('src/app/components/LeadForm.tsx'), false);
  assert.equal(fs.existsSync('api/leads.js'), false);
});
