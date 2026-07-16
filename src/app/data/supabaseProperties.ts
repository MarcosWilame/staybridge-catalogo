import type { Property } from './properties';
import { formatEuroPrice } from '../utils/price.ts';
import { StorageClient } from '@supabase/storage-js';
import { invalidatePublicPropertiesCache } from './propertyCache.ts';

const env = import.meta.env || {};
const SUPABASE_URL = env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_STORAGE_BUCKET =
  env.VITE_SUPABASE_STORAGE_BUCKET || 'property-images';
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);
const storageClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? new StorageClient(`${SUPABASE_URL}/storage/v1`, { apikey: SUPABASE_ANON_KEY })
  : null;

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
    factors?: Array<{
      id: string;
      factor_type?: string;
      status?: string;
    }>;
  };
};

export type AdminMfaFlow = {
  factorId: string;
  challengeId: string;
  qrCode?: string;
  secret?: string;
  isEnrollment: boolean;
};

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function adminRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(detail?.error || `Falha administrativa (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
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
  return `/api/property-media?path=${encodeURIComponent(objectPath)}`;
}

function getPropertyMediaProxyUrl(value: string) {
  try {
    const url = new URL(value);
    const marker = `/storage/v1/object/public/${SUPABASE_STORAGE_BUCKET}/`;
    const index = url.pathname.indexOf(marker);
    if (index < 0) return '';
    const path = decodeURIComponent(url.pathname.slice(index + marker.length));
    return getStoragePublicUrl(path);
  } catch {
    return '';
  }
}

async function listStorageObjects(prefix: string, accessToken: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase nao configurado');
  }

  void accessToken;
  return adminRequest<SupabaseStorageObject[]>(
    `/api/admin-storage?prefix=${encodeURIComponent(prefix)}`
  );
}

async function uploadWithSignedUrl(file: File, objectPath: string) {
  if (!storageClient) throw new Error('Supabase nao configurado');
  const signed = await adminRequest<{ token: string; path: string }>('/api/admin-storage', {
    method: 'POST',
    body: JSON.stringify({
      action: 'sign-upload',
      path: objectPath,
      mimeType: file.type,
      size: file.size,
    }),
  });
  const { error } = await storageClient
    .from(SUPABASE_STORAGE_BUCKET)
    .uploadToSignedUrl(signed.path, signed.token, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: '31536000',
    });
  if (error) throw new Error(error.message || 'Falha ao enviar arquivo');
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
  validateUploadFile(file, 'image');

  const cleanRelativePath =
    sanitizeStoragePath(relativePath || file.name) || `image-${Date.now()}`;
  const objectPath = `property-${propertyId}/${batchId}/${cleanRelativePath}`;
  void accessToken;
  await uploadWithSignedUrl(file, objectPath);

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
  validateUploadFile(file, 'image');

  const cleanRelativePath =
    sanitizeStoragePath(relativePath || file.name) || `image-${Date.now()}`;
  const objectPath = `library/${cleanRelativePath}`;
  void accessToken;
  await uploadWithSignedUrl(file, objectPath);

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
  validateUploadFile(file, 'video');

  const cleanFileName = sanitizeStoragePath(file.name) || `video-${Date.now()}`;
  const objectPath = `videos/property-${propertyId}/${cleanFileName}`;
  void accessToken;
  await uploadWithSignedUrl(file, objectPath);

  return getStoragePublicUrl(objectPath);
}

export function getStoredAdminSession() {
  return {
    access_token: 'http-only',
    expires_at: Math.floor(Date.now() / 1000) + 60,
  } satisfies SupabaseAuthSession;
}

export async function signInAdmin(email: string, password: string) {
  const response = await adminRequest<
    | { user?: SupabaseAuthSession['user'] }
    | (AdminMfaFlow & { mfaRequired: true })
  >('/api/admin-session', {
    method: 'POST',
    body: JSON.stringify({ action: 'login', email, password }),
  });
  if (!('mfaRequired' in response)) {
    return {
      session: {
        access_token: 'http-only',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        user: response.user,
      } satisfies SupabaseAuthSession,
    };
  }
  return {
    pendingSession: {
      access_token: 'http-only-pending',
      expires_at: Math.floor(Date.now() / 1000) + 600,
    } satisfies SupabaseAuthSession,
    mfaFlow: response,
  };
}

export async function verifyAdminMfa(
  session: SupabaseAuthSession,
  flow: AdminMfaFlow,
  code: string
) {
  void session;
  const response = await adminRequest<{ user?: SupabaseAuthSession['user'] }>('/api/admin-session', {
    method: 'POST',
    body: JSON.stringify({
      action: 'verify',
      factorId: flow.factorId,
      challengeId: flow.challengeId,
      code: code.replace(/\s/g, ''),
    }),
  });
  return {
    access_token: 'http-only',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: response.user,
  } satisfies SupabaseAuthSession;
}

export function signOutAdmin() {
  void fetch('/api/admin-session', {
    method: 'DELETE',
    credentials: 'same-origin',
  });
}

function toStringValue(value: unknown, fallback = '', maxLength = 5_000) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, maxLength)
    : fallback;
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

function toStringArray(value: unknown, limit = 30, itemLength = 180) {
  return Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => toStringValue(item, '', itemLength))
        .filter(Boolean)
        .slice(0, limit)
    : [];
}

function validateUploadFile(file: File, kind: 'image' | 'video') {
  const allowedTypes = kind === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES;
  const maxBytes = kind === 'image' ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;

  if (!allowedTypes.has(file.type.toLowerCase())) {
    throw new Error(`Formato de ${kind === 'image' ? 'imagem' : 'video'} nao permitido`);
  }
  if (file.size <= 0 || file.size > maxBytes) {
    throw new Error(
      `${kind === 'image' ? 'Imagem' : 'Video'} excede o limite de ${Math.round(maxBytes / 1024 / 1024)} MB`
    );
  }
}

export async function validateAdminSession(session: SupabaseAuthSession) {
  void session;
  try {
    const response = await adminRequest<{ user?: SupabaseAuthSession['user'] }>('/api/admin-session');
    return {
      access_token: 'http-only',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: response.user,
    } satisfies SupabaseAuthSession;
  } catch {
    return null;
  }
}

export function normalizeImageUrl(value: string) {
  const trimmed = value.trim();
  const supabaseHostname = getSupabaseHostname();

  if (!trimmed) return '';
  if (trimmed.startsWith('/api/property-media?path=')) return trimmed.slice(0, 2_048);
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

  return getPropertyMediaProxyUrl(trimmed) || trimmed;
}

export function normalizeVideoUrl(value: string) {
  const trimmed = value.trim();
  const supabaseHostname = getSupabaseHostname();

  if (!trimmed) return '';
  if (trimmed.startsWith('/api/property-media?path=')) return trimmed.slice(0, 2_048);
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

  return getPropertyMediaProxyUrl(trimmed) || trimmed;
}

function getGoogleDriveFileId(url: string) {
  return (
    url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/)?.[1] ||
    url.match(/[?&]id=([^&#]+)/)?.[1] ||
    ''
  );
}

function isAllowedMediaUrl(value: string, allowedHosts: string[]) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
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

function getVisibilityFromStatus(status: Property['status']) {
  if (status === 'available') return { available: true, listed: true };
  if (status === 'reserved') return { available: false, listed: true };
  return { available: false, listed: false };
}

export function normalizeProperty(input: PropertyInput): Property | null {
  const id = toNumberValue(input.id, Number.NaN);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  const image = normalizeImageUrl(toStringValue(input.image));
  const images = toImageArray(input.images).slice(0, 15);
  const rawAvailable = toBooleanValue(input.available, true);
  const rawListed = toBooleanValue(input.listed, true);
  const status = normalizeStatus(input.status, rawAvailable, rawListed);
  const { available, listed } = getVisibilityFromStatus(status);

  return {
    id,
    company: toStringValue(input.company, 'EasyShare', 100),
    image: image || images[0] || '',
    images: images.length ? images : image ? [image] : [],
    video: normalizeVideoUrl(toStringValue(input.video)),
    coverMedia:
      input.coverMedia === 'video' && toStringValue(input.video)
        ? 'video'
        : 'image',
    type: toStringValue(input.type, '', 80),
    title: toStringValue(input.title, '', 140),
    region: toStringValue(input.region, '', 80),
    localArea:
      typeof input.localArea === 'string' ? toStringValue(input.localArea, '', 100) : undefined,
    price: formatEuroPrice(toStringValue(input.price, '', 40)),
    description: toStringValue(input.description, '', 500),
    longDescription: toStringValue(input.longDescription, '', 5_000),
    available,
    listed,
    status,
    deletedAt: typeof input.deletedAt === 'string' ? input.deletedAt : undefined,
    billsIncluded: toBooleanValue(input.billsIncluded, false),
    bedrooms:
      typeof input.bedrooms === 'number' && Number.isFinite(input.bedrooms)
        ? Math.min(20, Math.max(0, input.bedrooms))
        : 1,
    bathrooms:
      typeof input.bathrooms === 'number' && Number.isFinite(input.bathrooms)
        ? Math.min(20, Math.max(0, input.bathrooms))
        : 0,
    category: normalizeCategory(input.category, input.type),
    amenities: toStringArray(input.amenities, 30, 120),
    deposit:
      typeof input.deposit === 'number' && Number.isFinite(input.deposit)
        ? Math.min(100_000, Math.max(0, input.deposit))
        : 0,
    nearbyStations: toStringArray(input.nearbyStations, 30, 180),
    coordinates: toCoordinates(input.coordinates),
    furnishing: toStringValue(input.furnishing, 'Mobiliado', 80),
    moveInDate: toStringValue(input.moveInDate, 'Disponível agora', 80),
    postcode: toStringValue(input.postcode, '', 16),
    address: toStringValue(input.address, '', 240),
    people:
      typeof input.people === 'number' && Number.isFinite(input.people)
        ? Math.min(20, Math.max(1, input.people))
        : 1,
  };
}

export function normalizeProperties(input: unknown) {
  if (!Array.isArray(input)) return [];

  return input.slice(0, 500)
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
  void accessToken;
  const rows = await adminRequest<SupabasePropertyRow[]>('/api/admin-properties');

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

  void accessToken;
  const rows = await adminRequest<SupabasePropertyRow[]>('/api/admin-properties', {
    method: 'POST',
    body: JSON.stringify({ property: normalizedProperty }),
  });
  invalidatePublicPropertiesCache();

  return rows.map(fromRow).find((item): item is Property => Boolean(item)) || normalizedProperty;
}

export async function deletePropertyFromSupabase(
  id: number,
  accessToken?: string
) {
  void accessToken;
  await adminRequest<void>(`/api/admin-properties?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  invalidatePublicPropertiesCache();
}

export async function replacePropertiesInSupabase(
  properties: unknown,
  accessToken?: string
) {
  const normalizedProperties = normalizeProperties(properties);

  if (!normalizedProperties.length) {
    throw new Error('Nenhum imovel valido para importar');
  }

  void accessToken;
  const rows = await adminRequest<SupabasePropertyRow[]>('/api/admin-properties', {
    method: 'PUT',
    body: JSON.stringify({ properties: normalizedProperties }),
  });
  invalidatePublicPropertiesCache();

  return rows.map(fromRow).filter((property): property is Property => Boolean(property));
}

export function hasSupabaseConfig() {
  return isSupabaseConfigured();
}
