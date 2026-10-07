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
  coverMedia: 20,
  sourceText: 2000,
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

function visibilityFromStatus(status, listed) {
  return {
    available: listed && status === 'available',
    listed,
  };
}

function normalizeCategory(value, type) {
  const raw = `${value || ''} ${type || ''}`.toLowerCase();
  if (raw.includes('ensuite')) return 'ensuite';
  if (raw.includes('studio')) return 'studio';
  if (raw.includes('double')) return 'double';
  if (raw.includes('single')) return 'single';
  if (raw.includes('flat') || raw.includes('bedroom')) return 'flat';
  return 'studio';
}

function hasTwoPersonCategory(value, type) {
  const raw = `${value || ''} ${type || ''}`.toLowerCase();
  return raw.includes('ensuite') || raw.includes('studio') || raw.includes('double');
}

function normalizePriceOptions(value, fallback) {
  const source = Array.isArray(value) ? value : [];
  const options = source.map((item) => {
    if (!item || typeof item !== 'object') return null;
    const amount = cleanNumber(item.amount, 0, 100000);
    if (!amount) return null;
    const occupancy = cleanNumber(item.occupancy, 1, 20, 0);
    return {
      amount,
      period: item.period === 'month' ? 'month' : 'week',
      ...(occupancy ? { occupancy } : {}),
      ...(typeof item.label === 'string' && item.label.trim() ? { label: cleanString(item.label, 120) } : {}),
    };
  }).filter(Boolean).slice(0, 10);
  if (options.length) return options;
  const match = String(fallback || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  const amount = match ? cleanNumber(match[0], 0, 100000) : 0;
  return amount ? [{ amount, period: 'week' }] : [];
}

function normalizeEntryConditions(value, fallback) {
  const source = value && typeof value === 'object' ? value : {};
  const result = {};
  const depositWeeks = cleanNumber(source.depositWeeks, 0, 52, -1);
  const rentWeeks = cleanNumber(source.rentWeeks, 0, 52, -1);
  const rentMonths = cleanNumber(source.rentMonths, 0, 12, -1);
  if (depositWeeks >= 0) result.depositWeeks = depositWeeks;
  if (rentWeeks >= 0) result.rentWeeks = rentWeeks;
  if (rentMonths >= 0) result.rentMonths = rentMonths;
  const note = cleanString(source.note || fallback, 240);
  if (note) result.note = note;
  return result;
}

function isAvailableFromMoveInDate(value) {
  const raw = cleanString(value, 80).toLowerCase();
  if (!raw || raw === 'now' || raw === 'imediata' || raw === 'disponível agora') return true;
  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return true;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day)).getTime() <= Date.now();
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
  data.category = normalizeCategory(input.category, input.type);
  data.image = cleanUrl(input.image);
  data.video = cleanUrl(input.video);
  data.images = Array.isArray(input.images)
    ? input.images.map(cleanUrl).filter(Boolean).slice(0, 15)
    : [];
  if (!data.image) data.image = data.images[0] || '';
  data.coverMedia = data.coverMedia === 'video' && data.video ? 'video' : 'image';
  if (!data.image && data.video) data.coverMedia = 'video';
  if (!data.title || (!data.image && !data.video)) {
    throw new Error('Title and image or video are required');
  }

  const status = normalizeStatus(input.status, input.available === true, input.listed === true);
  const listed = input.listed === true;
  Object.assign(data, visibilityFromStatus(status, listed), {
    available: isAvailableFromMoveInDate(input.moveInDate),
    status,
  });
  data.billsIncluded = input.billsIncluded === true;
  data.bedrooms = cleanNumber(input.bedrooms, 0, 20);
  data.bathrooms = cleanNumber(input.bathrooms, 0, 20);
  data.deposit = cleanNumber(input.deposit, 0, 100000);
  data.people = hasTwoPersonCategory(input.category, input.type)
    ? 2
    : cleanNumber(input.people, 1, 20, 1);
  data.availabilityStatus = ['future', 'to_confirm'].includes(input.availabilityStatus)
    ? input.availabilityStatus
    : /confirm|combinar/i.test(data.moveInDate)
      ? 'to_confirm'
      : /^\d{2}\/\d{2}\/\d{4}$/.test(data.moveInDate)
        ? 'future'
        : 'available_now';
  data.priceOptions = normalizePriceOptions(input.priceOptions, data.price);
  data.entryConditions = normalizeEntryConditions(input.entryConditions, data.entryRent);
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
