import type { Property } from './properties';
import { formatEuroPrice } from '../utils/price.ts';

const env = import.meta.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_TABLE =
  env.VITE_SUPABASE_PROPERTIES_TABLE || 'properties';
const SUPABASE_STORAGE_BUCKET =
  env.VITE_SUPABASE_STORAGE_BUCKET || 'property-images';
const AUTH_STORAGE_KEY = 'staybridge_admin_session';

type SupabasePropertyRow = {
  id: number;
  data: unknown;
};

type SupabaseStorageObject = {
  name: string;
  id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  metadata?: {
    mimetype?: string;
    mimeType?: string;
    size?: number;
  } | null;
};

export type StorageImageItem = {
  name: string;
  path: string;
  url: string;
};

export type StorageVideoItem = StorageImageItem;

export type StorageFolderItem = {
  name: string;
  path: string;
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

function getSupabaseHostname() {
  try {
    return SUPABASE_URL ? new URL(SUPABASE_URL).hostname : '';
  } catch {
    return '';
  }
}

function sanitizeStoragePath(value: string) {
  return value
    .replace(/\\/g, '/')
    .split('/')
    .map((part) =>
      part
        .trim()
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .filter(Boolean)
    .join('/');
}

function encodeStoragePath(value: string) {
  return value.split('/').map(encodeURIComponent).join('/');
}

function getStoragePublicUrl(objectPath: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/${encodeStoragePath(objectPath)}`;
}

async function listStorageObjects(prefix: string, accessToken: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase nao configurado');
  }

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/list/${SUPABASE_STORAGE_BUCKET}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        limit: 100,
        offset: 0,
        prefix,
        sortBy: { column: 'name', order: 'asc' },
      }),
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Falha ao buscar imagens (${response.status})`);
  }

  return (await response.json()) as SupabaseStorageObject[];
}

function isStorageFolder(item: SupabaseStorageObject) {
  return !item.id && !item.metadata;
}

function isStorageImage(item: SupabaseStorageObject, objectPath: string) {
  const mimeType = item.metadata?.mimetype || item.metadata?.mimeType || '';

  return (
    mimeType.startsWith('image/') ||
    /\.(avif|gif|jpe?g|png|webp)$/i.test(objectPath)
  );
}

function isStorageVideo(item: SupabaseStorageObject, objectPath: string) {
  const mimeType = item.metadata?.mimetype || item.metadata?.mimeType || '';

  return (
    mimeType.startsWith('video/') ||
    /\.(avi|m4v|mov|mp4|mpeg|mpg|webm)$/i.test(objectPath)
  );
}

export async function listPropertyStorageFolder({
  accessToken,
  prefix = '',
}: {
  accessToken: string;
  prefix?: string;
}) {
  const items = await listStorageObjects(prefix, accessToken);
  const folders: StorageFolderItem[] = [];
  const images: StorageImageItem[] = [];
  const videos: StorageVideoItem[] = [];

  for (const item of items) {
    const objectPath = [prefix, item.name].filter(Boolean).join('/');

    if (isStorageFolder(item)) {
      folders.push({
        name: item.name,
        path: objectPath,
      });
      continue;
    }

    if (isStorageVideo(item, objectPath)) {
      videos.push({
        name: item.name,
        path: objectPath,
        url: getStoragePublicUrl(objectPath),
      });
      continue;
    }

    if (!isStorageImage(item, objectPath)) continue;

    images.push({
      name: item.name,
      path: objectPath,
      url: getStoragePublicUrl(objectPath),
    });
  }

  return { folders, images, videos };
}

export async function listPropertyImagesInStorageFolder({
  accessToken,
  prefix = '',
  limit = 300,
}: {
  accessToken: string;
  prefix?: string;
  limit?: number;
}) {
  const results: StorageImageItem[] = [];

  const walk = async (folderPrefix: string, depth: number) => {
    if (results.length >= limit || depth > 8) return;

    const { folders, images } = await listPropertyStorageFolder({
      accessToken,
      prefix: folderPrefix,
    });

    for (const image of images) {
      if (results.length >= limit) break;
      results.push(image);
    }

    for (const folder of folders) {
      if (results.length >= limit) break;
      await walk(folder.path, depth + 1);
    }
  };

  await walk(prefix, 0);
  return results;
}

export async function searchPropertyImagesInStorage({
  accessToken,
  query,
  limit = 60,
}: {
  accessToken: string;
  query: string;
  limit?: number;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const results: StorageImageItem[] = [];

  const walk = async (prefix: string, depth: number) => {
    if (results.length >= limit || depth > 8) return;

    const items = await listStorageObjects(prefix, accessToken);

    for (const item of items) {
      if (results.length >= limit) break;

      const objectPath = [prefix, item.name].filter(Boolean).join('/');

      if (isStorageFolder(item)) {
        await walk(objectPath, depth + 1);
        continue;
      }

      if (!isStorageImage(item, objectPath)) continue;
      if (normalizedQuery && !objectPath.toLowerCase().includes(normalizedQuery)) {
        continue;
      }

      results.push({
        name: item.name,
        path: objectPath,
        url: getStoragePublicUrl(objectPath),
      });
    }
  };

  await walk('', 0);
  return results;
}

export async function searchPropertyVideosInStorage({
  accessToken,
  query,
  limit = 60,
}: {
  accessToken: string;
  query: string;
  limit?: number;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const results: StorageVideoItem[] = [];

  const walk = async (prefix: string, depth: number) => {
    if (results.length >= limit || depth > 8) return;

    const items = await listStorageObjects(prefix, accessToken);

    for (const item of items) {
      if (results.length >= limit) break;

      const objectPath = [prefix, item.name].filter(Boolean).join('/');

      if (isStorageFolder(item)) {
        await walk(objectPath, depth + 1);
        continue;
      }

      if (!isStorageVideo(item, objectPath)) continue;
      if (normalizedQuery && !objectPath.toLowerCase().includes(normalizedQuery)) {
        continue;
      }

      results.push({
        name: item.name,
        path: objectPath,
        url: getStoragePublicUrl(objectPath),
      });
    }
  };

  await walk('', 0);
  return results;
}

export async function uploadPropertyImageToStorage({
  file,
  propertyId,
  accessToken,
  batchId,
  relativePath,
}: {
  file: File;
  propertyId: number;
  accessToken: string;
  batchId: string;
  relativePath?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase nao configurado');
  }

  const cleanRelativePath =
    sanitizeStoragePath(relativePath || file.name) || `image-${Date.now()}`;
  const objectPath = `property-${propertyId}/${batchId}/${cleanRelativePath}`;
  const encodedPath = encodeStoragePath(objectPath);

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodedPath}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'application/octet-stream',
        'Cache-Control': '31536000',
        'x-upsert': 'true',
      },
      body: file,
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Falha ao enviar imagem (${response.status})`);
  }

  return getStoragePublicUrl(objectPath);
}

export async function uploadLibraryImageToStorage({
  file,
  accessToken,
  relativePath,
}: {
  file: File;
  accessToken: string;
  relativePath?: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase nao configurado');
  }

  const cleanRelativePath =
    sanitizeStoragePath(relativePath || file.name) || `image-${Date.now()}`;
  const objectPath = `library/${cleanRelativePath}`;
  const encodedPath = encodeStoragePath(objectPath);

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodedPath}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'application/octet-stream',
        'Cache-Control': '31536000',
        'x-upsert': 'true',
      },
      body: file,
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Falha ao enviar imagem (${response.status})`);
  }

  return getStoragePublicUrl(objectPath);
}

export async function uploadPropertyVideoToStorage({
  file,
  propertyId,
  accessToken,
}: {
  file: File;
  propertyId: number;
  accessToken: string;
}) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase nao configurado');
  }

  const cleanFileName = sanitizeStoragePath(file.name) || `video-${Date.now()}`;
  const objectPath = `videos/property-${propertyId}/${cleanFileName}`;
  const encodedPath = encodeStoragePath(objectPath);

  const response = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${SUPABASE_STORAGE_BUCKET}/${encodedPath}`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': file.type || 'application/octet-stream',
        'Cache-Control': '31536000',
        'x-upsert': 'true',
      },
      body: file,
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Falha ao enviar video (${response.status})`);
  }

  return getStoragePublicUrl(objectPath);
}

function persistSession(session: SupabaseAuthSession) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function getStoredAdminSession() {
  const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const session = JSON.parse(stored) as SupabaseAuthSession;
    const hasValidToken =
      typeof session.access_token === 'string' &&
      session.access_token.length > 0 &&
      typeof session.expires_at === 'number' &&
      session.expires_at > Math.floor(Date.now() / 1000);

    if (!hasValidToken) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
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
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
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

export async function validateAdminSession(session: SupabaseAuthSession) {
  if (!session.access_token || session.expires_at <= Math.floor(Date.now() / 1000)) {
    signOutAdmin();
    return null;
  }

  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    signOutAdmin();
    return null;
  }

  const user = (await response.json()) as { email?: string };
  const validatedSession = {
    ...session,
    user: { email: user.email },
  };
  persistSession(validatedSession);
  return validatedSession;
}

export function normalizeImageUrl(value: string) {
  const trimmed = value.trim();
  const supabaseHostname = getSupabaseHostname();

  if (!trimmed) return '';
  if (
    !isAllowedMediaUrl(trimmed, [
      'drive.google.com',
      'googleusercontent.com',
      'images.unsplash.com',
      'res.cloudinary.com',
      'supabase.co',
      ...(supabaseHostname ? [supabaseHostname] : []),
    ])
  ) {
    return '';
  }

  const driveFileId = getGoogleDriveFileId(trimmed);

  if (driveFileId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${driveFileId}&sz=w2000`;
  }

  return trimmed;
}

export function normalizeVideoUrl(value: string) {
  const trimmed = value.trim();
  const supabaseHostname = getSupabaseHostname();

  if (!trimmed) return '';
  if (
    !isAllowedMediaUrl(trimmed, [
      'drive.google.com',
      'youtube.com',
      'www.youtube.com',
      'youtu.be',
      'supabase.co',
      ...(supabaseHostname ? [supabaseHostname] : []),
    ])
  ) {
    return '';
  }

  const driveFileId = getGoogleDriveFileId(trimmed);

  if (driveFileId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/file/d/${driveFileId}/preview`;
  }

  return trimmed;
}

function getGoogleDriveFileId(url: string) {
  return (
    url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)?.[1] ||
    url.match(/[?&]id=([^&#]+)/)?.[1] ||
    ''
  );
}

function isAllowedMediaUrl(value: string, allowedHosts: string[]) {
  if (value.startsWith('data:image/')) return true;

  try {
    const url = new URL(value);
    return allowedHosts.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

function toImageArray(value: unknown) {
  return toStringArray(value).map(normalizeImageUrl).filter(Boolean);
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

function normalizeStatus(
  status: unknown,
  available: boolean,
  listed: boolean
): Property['status'] {
  const normalized = toStringValue(status).trim().toLowerCase();
  if (
    normalized === 'available' ||
    normalized === 'reserved' ||
    normalized === 'rented' ||
    normalized === 'hidden' ||
    normalized === 'maintenance'
  ) {
    return normalized;
  }

  if (!listed && !available) return 'rented';
  if (!listed) return 'hidden';
  if (!available) return 'reserved';
  return 'available';
}

export function normalizeProperty(input: PropertyInput): Property | null {
  const id = toNumberValue(input.id, Number.NaN);

  if (!Number.isFinite(id)) {
    return null;
  }

  const image = normalizeImageUrl(toStringValue(input.image));
  const images = toImageArray(input.images);
  const available = toBooleanValue(input.available, true);
  const listed = toBooleanValue(input.listed, true);

  return {
    id,
    image: image || images[0] || '',
    images: images.length ? images : image ? [image] : [],
    video: normalizeVideoUrl(toStringValue(input.video)),
    type: toStringValue(input.type),
    title: toStringValue(input.title),
    region: toStringValue(input.region),
    localArea:
      typeof input.localArea === 'string' ? input.localArea : undefined,
    price: formatEuroPrice(toStringValue(input.price)),
    description: toStringValue(input.description),
    longDescription: toStringValue(input.longDescription),
    available,
    listed,
    status: normalizeStatus(input.status, available, listed),
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
    moveInDate: toStringValue(input.moveInDate, 'Disponível agora'),
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

  const existingProperties = await loadPropertiesFromSupabase(accessToken);

  const rows = await requestJson<SupabasePropertyRow[]>(
    `${SUPABASE_TABLE}?on_conflict=id`,
    {
      method: 'POST',
      headers: {
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify(normalizedProperties.map(toRecord)),
    },
    accessToken
  );

  const importedIds = new Set(normalizedProperties.map((property) => property.id));
  const staleProperties = existingProperties.filter(
    (property) => !importedIds.has(property.id)
  );

  for (const property of staleProperties) {
    await deletePropertyFromSupabase(property.id, accessToken);
  }

  return rows.map(fromRow).filter((property): property is Property => Boolean(property));
}

export function hasSupabaseConfig() {
  return isSupabaseConfigured();
}
