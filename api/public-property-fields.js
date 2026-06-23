const MEDIA_HOSTS = [
  'drive.google.com',
  'googleusercontent.com',
  'images.unsplash.com',
  'res.cloudinary.com',
  'supabase.co',
  'youtube.com',
  'youtu.be',
];

function text(value, maxLength = 300) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function number(value, min = 0, max = 1_000_000) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : 0;
}

function stringList(value, limit, itemLength = 120) {
  return Array.isArray(value)
    ? value.map((item) => text(item, itemLength)).filter(Boolean).slice(0, limit)
    : [];
}

function mediaUrl(value) {
  const candidate = text(value, 2_048);
  if (!candidate) return '';
  if (candidate.startsWith('/api/property-media?path=')) return candidate;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'https:') return '';
    const allowed = MEDIA_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
    if (!allowed) return '';
    const marker = '/storage/v1/object/public/property-images/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex >= 0) {
      const path = decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
      return `/api/property-media?path=${encodeURIComponent(path)}`;
    }
    return url.toString();
  } catch {
    return '';
  }
}

export function toPublicProperty(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : {};
  if (data.listed !== true) return null;

  const id = Number(data.id || row?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const images = Array.isArray(data.images)
    ? data.images.map(mediaUrl).filter(Boolean).slice(0, 15)
    : [];
  const image = mediaUrl(data.image) || images[0] || '';

  return {
    id,
    image,
    images: images.length ? images : image ? [image] : [],
    video: mediaUrl(data.video),
    type: text(data.type, 80),
    title: text(data.title, 140),
    region: text(data.region, 80),
    localArea: text(data.localArea, 100),
    price: text(data.price, 40),
    description: text(data.description, 500),
    longDescription: text(data.longDescription, 5_000),
    available: data.available === true,
    listed: true,
    billsIncluded: data.billsIncluded === true,
    bedrooms: number(data.bedrooms, 0, 20),
    bathrooms: number(data.bathrooms, 0, 20),
    category: text(data.category, 60),
    amenities: stringList(data.amenities, 30),
    deposit: number(data.deposit, 0, 100_000),
    nearbyStations: stringList(data.nearbyStations, 30, 180),
    furnishing: text(data.furnishing, 80),
    moveInDate: text(data.moveInDate, 80),
    postcode: text(data.postcode, 16),
    people: number(data.people, 1, 20),
  };
}
