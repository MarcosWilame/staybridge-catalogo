import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { toPublicProperty } from './public-property-fields.js';

const SITE_URL = (process.env.SITE_URL || 'https://staybridgelondon.com').replace(/\/$/, '');
const SITE_NAME = 'Staybridge London';
const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
const SUPABASE_TABLE = process.env.SUPABASE_PROPERTIES_TABLE || process.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function setMeta(html, attribute, key, content) {
  const tag = `<meta ${attribute}="${escapeHtml(key)}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${escapeRegExp(key)}["'][^>]*>`, 'i');
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function setCanonical(html, url) {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  const pattern = /<link\s+rel=["']canonical["'][^>]*>/i;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function setTitle(html, title) {
  return html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

async function loadTemplate() {
  return readFile(path.join(process.cwd(), 'dist', 'index.html'), 'utf8');
}

async function loadProperty(id) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?select=id,data&id=eq.${encodeURIComponent(id)}&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: 'application/json',
      },
    }
  );
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) && rows[0] ? toPublicProperty(rows[0]) : null;
}

function getPriceValue(price) {
  const match = String(price || '').match(/\d+(?:[.,]\d+)?/);
  return match ? Number(match[0].replace(',', '.')) : 0;
}

export function buildStructuredData(property, url) {
  const residenceId = `${url}#residence`;
  const listingId = `${url}#listing`;
  const images = [...new Set([property.image, ...(property.images || [])].filter(Boolean))];
  const isApartment = ['flat', 'studio', 'apartment'].includes(String(property.category).toLowerCase());
  const residence = {
    '@type': isApartment ? ['Residence', 'Apartment'] : 'Residence',
    '@id': residenceId,
    name: property.title,
    description: property.longDescription || property.description,
    image: images,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.localArea || property.region,
      addressRegion: 'London',
      postalCode: property.postcode,
      addressCountry: 'GB',
    },
    numberOfBedrooms: property.bedrooms,
    numberOfBathroomsTotal: property.bathrooms,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: property.people,
      unitText: 'PERSON',
    },
    amenityFeature: (property.amenities || []).map((name) => ({
      '@type': 'LocationFeatureSpecification',
      name,
      value: true,
    })),
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateListing',
        '@id': listingId,
        name: property.title,
        description: property.description,
        image: images,
        url,
        inLanguage: ['pt-BR', 'en-GB'],
        mainEntity: { '@id': residenceId },
        offers: {
          '@type': 'Offer',
          url,
          price: getPriceValue(property.price),
          priceCurrency: 'GBP',
          availability: property.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          itemOffered: { '@id': residenceId },
          seller: { '@id': `${SITE_URL}/#business` },
        },
      },
      residence,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Imóveis em Londres', item: `${SITE_URL}/properties` },
          { '@type': 'ListItem', position: 3, name: property.title, item: url },
        ],
      },
    ],
  };
}

export function injectPropertyMetadata(template, property, url) {
  const title = `${property.title} em ${property.region} | ${SITE_NAME}`;
  const description = `${property.description} ${property.price}. ${property.available ? 'Disponível' : 'Consulte disponibilidade'}.`.slice(0, 160);
  const image = property.image || `${SITE_URL}/img/logo-white.png`;
  let html = setTitle(template, title);
  html = setCanonical(html, url);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'name', 'robots', 'index, follow, max-image-preview:large');
  html = setMeta(html, 'property', 'og:type', 'article');
  html = setMeta(html, 'property', 'og:site_name', SITE_NAME);
  html = setMeta(html, 'property', 'og:locale', 'pt_BR');
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:secure_url', image);
  html = setMeta(html, 'property', 'og:image:alt', `${property.title} para alugar em ${property.region}`);
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = setMeta(html, 'name', 'twitter:image:alt', `${property.title} para alugar em ${property.region}`);
  const jsonLd = JSON.stringify(buildStructuredData(property, url)).replace(/</g, '\\u003c');
  return html.replace('</head>', `    <script id="page-json-ld" type="application/ld+json">${jsonLd}</script>\n  </head>`);
}

export default async function handler(req, res) {
  const id = Number(req.query?.id);
  let template;
  try {
    template = await loadTemplate();
  } catch {
    return res.status(500).send('Unable to load application shell');
  }

  if (!Number.isFinite(id)) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    return res.status(404).send(template);
  }

  const property = await loadProperty(id);
  if (!property) {
    let html = setTitle(template, `Imóvel não encontrado | ${SITE_NAME}`);
    html = setMeta(html, 'name', 'robots', 'noindex, nofollow');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(404).send(html);
  }

  const url = `${SITE_URL}/property/${property.id}`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).send(injectPropertyMetadata(template, property, url));
}
