import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStructuredData,
  injectPropertyMetadata,
} from '../api/property-page.js';

const property = {
  id: 42,
  image: 'https://example.com/property.jpg',
  images: ['https://example.com/property.jpg'],
  type: 'Studio',
  title: 'Studio 42 - NW10',
  region: 'North London',
  localArea: 'Dollis Hill',
  price: '£350/week',
  description: 'Studio mobiliado em Londres.',
  longDescription: 'Studio mobiliado com bills inclusas.',
  available: true,
  billsIncluded: true,
  bedrooms: 1,
  bathrooms: 1,
  category: 'studio',
  amenities: ['Wi-Fi'],
  postcode: 'NW10 2EL',
  address: '1 Example Road',
  people: 2,
};

test('property structured data includes listing, residence, apartment and breadcrumbs', () => {
  const data = buildStructuredData(property, 'https://staybridgelondon.com/property/42');
  const types = data['@graph'].flatMap((item) =>
    Array.isArray(item['@type']) ? item['@type'] : [item['@type']]
  );

  assert.ok(types.includes('RealEstateListing'));
  assert.ok(types.includes('Residence'));
  assert.ok(types.includes('Apartment'));
  assert.ok(types.includes('BreadcrumbList'));
  const residence = data['@graph'].find((item) =>
    Array.isArray(item['@type']) ? item['@type'].includes('Residence') : item['@type'] === 'Residence'
  );
  assert.equal('streetAddress' in residence.address, false);
});
test('property HTML receives canonical and complete social metadata', () => {
  const template = '<html><head><title>Old</title><meta name="description" content="Old"><link rel="canonical" href="https://example.com/"></head><body><div id="root"></div></body></html>';
  const html = injectPropertyMetadata(
    template,
    property,
    'https://staybridgelondon.com/property/42'
  );

  assert.match(html, /rel="canonical" href="https:\/\/staybridgelondon\.com\/property\/42"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="twitter:description"/);
  assert.match(html, /type="application\/ld\+json"/);
});
