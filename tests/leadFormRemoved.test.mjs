import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildLeadMessage } from '../src/app/utils/leadCapture.ts';

test('lead capture form is available without silently sending personal data', () => {
  assert.equal(fs.existsSync('src/app/components/LeadCaptureModal.tsx'), true);
  assert.equal(fs.existsSync('api/leads.js'), false);
});

test('lead capture creates a contextual visit request', () => {
  const message = buildLeadMessage(
    'visit',
    { name: 'Ana', moveInDate: '2026-07-01', people: '2' },
    { id: 42, title: 'Studio 42', region: 'North London', price: '£350/week' },
    'https://staybridgelondon.com'
  );

  assert.match(message, /agendar uma visita/);
  assert.match(message, /Studio 42/);
  assert.match(message, /2026-07-01/);
  assert.match(message, /\/property\/42/);
});
