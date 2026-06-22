import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildLeadMessage } from '../src/app/utils/leadCapture.ts';

test('lead capture form is available without silently sending personal data', () => {
  assert.equal(fs.existsSync('src/app/components/LeadCaptureModal.tsx'), true);
  assert.equal(fs.existsSync('api/leads.js'), false);
});

test('lead capture creates a structured property inquiry', () => {
  const message = buildLeadMessage(
    'visit',
    { name: 'Ana', moveInDate: 'Next Month', people: '2 People' },
    { id: 42, title: 'Studio 42', region: 'North London', price: '£350/week' },
    'https://staybridgelondon.com'
  );

  assert.match(message, /Is the property still available\?/);
  assert.match(message, /What are the move-in costs\?/);
  assert.match(message, /more photos or videos\?/);
  assert.match(message, /Studio 42/);
  assert.match(message, /Expected move-in: Next Month/);
  assert.match(message, /Number of occupants: 2 People/);
});
