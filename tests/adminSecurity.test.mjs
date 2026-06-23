import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertSameOrigin,
  createSecureCookie,
  parseCookies,
} from '../api/_admin.js';
import { enforceRateLimit } from '../api/_security.js';

test('admin cookies are HttpOnly, Secure and SameSite Strict', () => {
  const cookie = createSecureCookie('admin', 'token', 600);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Strict/);
  assert.doesNotMatch(cookie, /Domain=/);
});

test('admin cookie parser decodes bounded cookie pairs', () => {
  assert.deepEqual(
    parseCookies({ headers: { cookie: 'one=1; encoded=hello%20world' } }),
    { one: '1', encoded: 'hello world' }
  );
});

test('admin mutations reject cross-origin requests', () => {
  assert.equal(
    assertSameOrigin({ headers: { origin: 'https://evil.example', host: 'staybridgelondon.com' } }),
    false
  );
  assert.equal(
    assertSameOrigin({ headers: { origin: 'https://staybridgelondon.com', host: 'staybridgelondon.com' } }),
    true
  );
});

test('API rate limiter blocks requests above the configured limit', () => {
  const headers = {};
  const response = {
    setHeader(name, value) { headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
  const request = { headers: { 'x-forwarded-for': '203.0.113.10' } };
  assert.equal(enforceRateLimit(request, response, { limit: 1, namespace: 'test' }), true);
  assert.equal(enforceRateLimit(request, response, { limit: 1, namespace: 'test' }), false);
  assert.equal(response.statusCode, 429);
});
