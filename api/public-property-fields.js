const MEDIA_HOSTS = [
  'drive.google.com',
  'googleusercontent.com',
  'images.unsplash.com',
  'res.cloudinary.com',
  'supabase.co',
  'youtube.com',
  'youtu.be',
];

export const PUBLIC_PAYLOAD_LIMITS = Object.freeze({
  description: 500,
  longDescription: 3_000,
  images: 10,
  nearbyStations: 10,
  priceOptions: 6,
});

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

function normalizeStatus(value, available, listed) {
  // An explicit listed=false must always remove the property from the public catalogue.
  if (!listed) return 'hidden';
  const status = text(value, 30).toLowerCase();
  if (['available', 'reserved', 'rented', 'hidden', 'maintenance'].includes(status)) return status;
  if (!available) return 'reserved';
  return 'available';
}

function visibilityFromStatus(status) {
  if (status === 'available') return { available: true, listed: true };
  if (status === 'reserved') return { available: false, listed: true };
  return { available: false, listed: false };
}

function getPeopleLimit(category, people) {
  if (['ensuite', 'studio', 'double'].includes(String(category || '').toLowerCase())) return 2;
  return number(people, 1, 20);
}

function getAvailabilityStatus(value, moveInDate) {
  const raw = text(value, 30).toLowerCase();
  const dateText = text(moveInDate, 80).toLowerCase();
  if (raw === 'to_confirm' || raw.includes('confirm') || raw.includes('combinar') || raw.includes('consulte') || dateText.includes('confirm') || dateText.includes('combinar') || dateText.includes('consulte')) return 'to_confirm';
  if (raw === 'future' || raw.includes('breve')) return 'future';
  const date = text(moveInDate, 80).toLowerCase();
  return /^\d{2}\/\d{2}\/\d{4}$/.test(date) ? 'future' : 'available_now';
}

function getPriceOptions(value, fallback) {
  const options = Array.isArray(value)
    ? value.map((item) => ({
      amount: number(item?.amount, 0, 100_000),
      period: item?.period === 'month' ? 'month' : 'week',
      ...(Number.isFinite(Number(item?.occupancy)) ? { occupancy: number(item.occupancy, 1, 20) } : {}),
      ...(text(item?.label, 120) ? { label: text(item.label, 120) } : {}),
    })).filter((item) => item.amount > 0).slice(0, PUBLIC_PAYLOAD_LIMITS.priceOptions)
    : [];
  if (options.length) return options;
  const amount = number(String(fallback || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/)?.[0], 0, 100_000);
  return amount ? [{ amount, period: 'week' }] : [];
}

function isAvailableFromMoveInDate(value) {
  const raw = text(value, 80).toLowerCase();
  if (!raw || raw === 'now' || raw === 'imediata' || raw === 'disponível agora') return true;
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return true;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime() <= Date.now();
}

export function toPublicProperty(row) {
  const data = row?.data && typeof row.data === 'object' ? row.data : {};
  const status = normalizeStatus(data.status, data.available === true, data.listed === true);
  const visibility = visibilityFromStatus(status);
  if (!visibility.listed) return null;

  const id = Number(data.id || row?.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const images = Array.isArray(data.images)
    ? [...new Set(data.images.map(mediaUrl).filter(Boolean))].slice(0, PUBLIC_PAYLOAD_LIMITS.images)
    : [];
  const image = mediaUrl(data.image) || images[0] || '';
  const publicImages = image && !images.includes(image)
    ? [image, ...images].slice(0, PUBLIC_PAYLOAD_LIMITS.images)
    : images.length ? images : image ? [image] : [];

  const category = text(data.category, 60);

  return {
    id,
    image,
    images: publicImages,
    video: mediaUrl(data.video),
    coverMedia: data.coverMedia === 'video' && mediaUrl(data.video) ? 'video' : 'image',
    type: text(data.type, 80),
    title: text(data.title, 140),
    region: text(data.region, 80),
    localArea: text(data.localArea, 100),
    price: text(data.price, 40),
    monthlyPrice: text(data.monthlyPrice, 40),
    entryRent: text(data.entryRent, 80),
    description: text(data.description, PUBLIC_PAYLOAD_LIMITS.description),
    longDescription: text(data.longDescription, PUBLIC_PAYLOAD_LIMITS.longDescription),
    available: isAvailableFromMoveInDate(data.moveInDate),
    listed: true,
    billsIncluded: data.billsIncluded === true,
    bedrooms: number(data.bedrooms, 0, 20),
    bathrooms: number(data.bathrooms, 0, 20),
    category,
    amenities: stringList(data.amenities, 30),
    deposit: number(data.deposit, 0, 100_000),
    nearbyStations: stringList(data.nearbyStations, PUBLIC_PAYLOAD_LIMITS.nearbyStations, 180),
    furnishing: text(data.furnishing, 80),
    moveInDate: text(data.moveInDate, 80),
    postcode: text(data.postcode, 16),
    people: getPeopleLimit(category, data.people),
    availabilityStatus: getAvailabilityStatus(data.availabilityStatus, data.moveInDate),
    priceOptions: getPriceOptions(data.priceOptions, data.price),
  };
}
