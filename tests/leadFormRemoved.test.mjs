import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildLeadMessage } from '../src/app/utils/leadCapture.ts';

test('lead capture form is available without silently sending personal data', () => {
  assert.equal(fs.existsSync('src/app/components/LeadCaptureModal.tsx'), true);
  assert.equal(fs.existsSync('api/leads.js'), false);
});

test('lead capture creates a structured property inquiry in English', () => {
  const message = buildLeadMessage(
    'visit',
    { name: 'Ana', moveInDate: 'Next Month', people: '2 People' },
    { id: 42, title: 'Studio 42', region: 'North London', price: '£350/week' },
    'en'
  );

  assert.match(message, /Is the property still available\?/);
  assert.match(message, /What are the move-in costs\?/);
  assert.match(message, /more photos or videos\?/);
  assert.match(message, /Studio 42/);
  assert.match(message, /Expected move-in: Next Month/);
  assert.match(message, /Number of occupants: 2 People/);
});

test('lead capture creates a translated property inquiry in Portuguese by default', () => {
  const message = buildLeadMessage(
    'whatsapp',
    { name: 'Ana', moveInDate: 'Next Month', people: '2 People' },
    { id: 42, title: 'Studio 42', region: 'North London', price: '£350/week' }
  );

  assert.match(message, /Tenho interesse no seguinte imóvel/);
  assert.match(message, /Previsão de mudança: Próximo mês/);
  assert.match(message, /Número de moradores: 2 pessoas/);
  assert.match(message, /O imóvel ainda está disponível\?/);
  assert.match(message, /mais fotos ou vídeos\?/);
});
