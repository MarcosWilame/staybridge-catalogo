import type { Property } from './properties';
import { formatEuroPrice } from '../utils/price';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_TABLE =
  import.meta.env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
const AUTH_STORAGE_KEY = 'bedminster_admin_session';

type SupabasePropertyRow = {
  id: number;
  data: unknown;
};

type PropertyInput = Partial<Property> & { id?: number | string };

export type SupabaseAuthSession = {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  user?: {
    email?: string;
  };
};

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_TABLE);
}

function getHeaders(accessToken?: string) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Prefer: 'return=representation',
  };
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string
): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase não configurado');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...getHeaders(accessToken),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      detail || `Falha ao acessar Supabase (${response.status})`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function requestAuth<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase nao configurado');
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Falha na autenticacao (${response.status})`);
  }

  return (await response.json()) as T;
}

function persistSession(session: SupabaseAuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredAdminSession() {
  const stored = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as SupabaseAuthSession;
    const hasValidToken =
      typeof session.access_token === 'string' &&
      session.access_token.length > 0 &&
      typeof session.expires_at === 'number' &&
      session.expires_at > Math.floor(Date.now() / 1000);

    if (!hasValidToken) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export async function signInAdmin(email: string, password: string) {
  const response = await requestAuth<{
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    user?: { email?: string };
  }>('token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const session: SupabaseAuthSession = {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_at:
      Math.floor(Date.now() / 1000) + Math.max(0, response.expires_in || 3600),
    user: response.user,
  };

  persistSession(session);
  return session;
}

export function signOutAdmin() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

function toStringValue(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function toBooleanValue(value: unknown, fallback = false) {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'sim', '1'].includes(normalized)) return true;
    if (['false', 'no', 'nao', 'não', '0'].includes(normalized)) return false;
  }

  return typeof value === 'boolean' ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0) {
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function toStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function toCoordinates(value: unknown) {
  if (!value || typeof value !== 'object') {
    return { lat: 0, lng: 0 };
  }

  const coords = value as { lat?: unknown; lng?: unknown };

  return {
    lat: toNumberValue(coords.lat, 0),
    lng: toNumberValue(coords.lng, 0),
  };
}

function normalizeCategory(category: unknown, type: unknown) {
  const raw = toStringValue(category || type, 'studio').trim().toLowerCase();

  if (raw.includes('ensuite')) return 'ensuite';
  if (raw.includes('single')) return 'single';
  if (raw.includes('double')) return 'double';
  if (raw.includes('flat') || raw.includes('bedroom')) return 'flat';
  if (raw.includes('studio')) return 'studio';

  return raw || 'studio';
}

export function normalizeProperty(input: PropertyInput): Property | null {
  const id = toNumberValue(input.id, Number.NaN);

  if (!Number.isFinite(id)) {
    return null;
  }

  const image = toStringValue(input.image);
  const images = toStringArray(input.images);

  return {
    id,
    image: image || images[0] || '',
    images: images.length ? images : image ? [image] : [],
    video: toStringValue(input.video),
    type: toStringValue(input.type),
    title: toStringValue(input.title),
    region: toStringValue(input.region),
    localArea:
      typeof input.localArea === 'string' ? input.localArea : undefined,
    price: formatEuroPrice(toStringValue(input.price)),
    description: toStringValue(input.description),
    longDescription: toStringValue(input.longDescription),
    available: toBooleanValue(input.available, true),
    listed: toBooleanValue(input.listed, true),
    deletedAt: typeof input.deletedAt === 'string' ? input.deletedAt : undefined,
    billsIncluded: toBooleanValue(input.billsIncluded, false),
    bedrooms:
      typeof input.bedrooms === 'number' && Number.isFinite(input.bedrooms)
        ? input.bedrooms
        : 1,
    bathrooms:
      typeof input.bathrooms === 'number' && Number.isFinite(input.bathrooms)
        ? input.bathrooms
        : 0,
    category: normalizeCategory(input.category, input.type),
    amenities: toStringArray(input.amenities),
    deposit:
      typeof input.deposit === 'number' && Number.isFinite(input.deposit)
        ? input.deposit
        : 0,
    nearbyStations: toStringArray(input.nearbyStations),
    coordinates: toCoordinates(input.coordinates),
    furnishing: toStringValue(input.furnishing, 'Mobiliado'),
    moveInDate: toStringValue(input.moveInDate, 'Imediata'),
    postcode: toStringValue(input.postcode),
    address: toStringValue(input.address),
    people:
      typeof input.people === 'number' && Number.isFinite(input.people)
        ? input.people
        : 1,
  };
}

export function normalizeProperties(input: unknown) {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) =>
      item && typeof item === 'object'
        ? normalizeProperty(item as PropertyInput)
        : null
    )
    .filter((property): property is Property => Boolean(property));
}

function toRecord(property: Property) {
  return {
    id: property.id,
    data: property,
  };
}

function fromRow(row: SupabasePropertyRow) {
  if (!row || typeof row !== 'object') {
    return null;
  }

  const rawData =
    row.data && typeof row.data === 'object'
      ? (row.data as PropertyInput)
      : { id: row.id };

  return normalizeProperty({
    ...rawData,
    id:
      typeof rawData.id === 'number' && Number.isFinite(rawData.id)
        ? rawData.id
        : row.id,
  });
}

export async function loadPropertiesFromSupabase(accessToken?: string) {
  const rows = await requestJson<SupabasePropertyRow[]>(
    `${SUPABASE_TABLE}?select=id,data&order=id.asc`,
    {
      method: 'GET',
    },
    accessToken
  );

  return rows.map(fromRow).filter((property): property is Property => Boolean(property));
}

export async function savePropertyToSupabase(
  property: Property,
  accessToken?: string
) {
  const normalizedProperty = normalizeProperty(property);

  if (!normalizedProperty) {
    throw new Error('Imovel invalido');
  }

  const rows = await requestJson<SupabasePropertyRow[]>(
    `${SUPABASE_TABLE}?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify([toRecord(normalizedProperty)]),
    },
    accessToken
  );

  return rows.map(fromRow).find((item): item is Property => Boolean(item)) || normalizedProperty;
}

export async function deletePropertyFromSupabase(
  id: number,
  accessToken?: string
) {
  await requestJson<null>(`${SUPABASE_TABLE}?id=eq.${id}`, {
    method: 'DELETE',
  }, accessToken);
}

export async function replacePropertiesInSupabase(
  properties: unknown,
  accessToken?: string
) {
  const normalizedProperties = normalizeProperties(properties);

  if (!normalizedProperties.length) {
    throw new Error('Nenhum imovel valido para importar');
  }

  await requestJson<null>(`${SUPABASE_TABLE}?id=gt.0`, {
    method: 'DELETE',
  }, accessToken);

  const rows = await requestJson<SupabasePropertyRow[]>(
    `${SUPABASE_TABLE}`,
    {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(normalizedProperties.map(toRecord)),
    },
    accessToken
  );

  return rows.map(fromRow).filter((property): property is Property => Boolean(property));
}

export function hasSupabaseConfig() {
  return isSupabaseConfigured();
}
