const STRING_LIMITS = {
  company: 100,
  type: 80,
  title: 140,
  region: 80,
  localArea: 100,
  price: 40,
  description: 500,
  longDescription: 5000,
  category: 60,
  furnishing: 80,
  moveInDate: 80,
  postcode: 16,
  address: 240,
  video: 2048,
  image: 2048,
  deletedAt: 40,
  status: 30,
};

function cleanString(value, max) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max)
    : '';
}

function cleanNumber(value, min, max, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function cleanStringList(value, limit, max) {
  return Array.isArray(value)
    ? value.map((item) => cleanString(item, max)).filter(Boolean).slice(0, limit)
    : [];
}

function cleanUrl(value) {
  const candidate = cleanString(value, 2048);
  if (!candidate) return '';
  if (candidate.startsWith('/api/property-media?path=')) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function normalizeStatus(value, available, listed) {
  const status = cleanString(value, STRING_LIMITS.status).toLowerCase();
  if (['available', 'reserved', 'rented', 'hidden', 'maintenance'].includes(status)) return status;
  if (!listed && !available) return 'rented';
  if (!listed) return 'hidden';
  if (!available) return 'reserved';
  return 'available';
}

function visibilityFromStatus(status) {
  if (status === 'available') return { available: true, listed: true };
  if (status === 'reserved') return { available: false, listed: true };
  return { available: false, listed: false };
}

export function validateAdminProperty(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid property');
  const id = Number(input.id);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid property ID');

  const data = { id };
  for (const [field, max] of Object.entries(STRING_LIMITS)) {
    data[field] = cleanString(input[field], max);
  }
  data.company = data.company || 'EasyShare';
  data.image = cleanUrl(input.image);
  data.video = cleanUrl(input.video);
  data.images = Array.isArray(input.images)
    ? input.images.map(cleanUrl).filter(Boolean).slice(0, 15)
    : [];
  if (!data.image) data.image = data.images[0] || '';
  if (!data.title || (!data.image && !data.video)) {
    throw new Error('Title and image or video are required');
  }

  const status = normalizeStatus(input.status, input.available === true, input.listed === true);
  Object.assign(data, visibilityFromStatus(status), { status });
  data.billsIncluded = input.billsIncluded === true;
  data.bedrooms = cleanNumber(input.bedrooms, 0, 20);
  data.bathrooms = cleanNumber(input.bathrooms, 0, 20);
  data.deposit = cleanNumber(input.deposit, 0, 100000);
  data.people = cleanNumber(input.people, 1, 20, 1);
  data.amenities = cleanStringList(input.amenities, 30, 120);
  data.nearbyStations = cleanStringList(input.nearbyStations, 30, 180);
  data.coordinates = {
    lat: cleanNumber(input.coordinates?.lat, -90, 90),
    lng: cleanNumber(input.coordinates?.lng, -180, 180),
  };
  return data;
}

export function validateAdminProperties(input) {
  if (!Array.isArray(input) || input.length < 1 || input.length > 500) {
    throw new Error('Invalid property collection');
  }
  const properties = input.map(validateAdminProperty);
  if (new Set(properties.map((property) => property.id)).size !== properties.length) {
    throw new Error('Duplicate property IDs');
  }
  return properties;
}
