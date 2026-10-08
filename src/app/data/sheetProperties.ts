import { useEffect, useState } from 'react';
import type { Property } from './properties';
import {
  getPublicPropertiesRevision,
  getPublicPropertiesRequestPath,
  PUBLIC_PROPERTIES_CACHE_KEY,
  PUBLIC_PROPERTIES_UPDATED_EVENT,
} from './propertyCache.ts';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;
let cachedRevision = '';
let pendingLoad: Promise<Property[]> | null = null;
const CACHE_TTL = 5 * 60 * 1000;
const REVALIDATION_INTERVAL = 60 * 1000;
const REQUEST_TIMEOUT_MS = 6_500;
const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '');
let lastSuccessfulFetchAt = 0;

function readSessionCache(allowStale = false) {
  try {
    const value = sessionStorage.getItem(PUBLIC_PROPERTIES_CACHE_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as {
      timestamp: number;
      revision: string;
      properties: Property[];
    };
    const matchesRevision = parsed.revision === getPublicPropertiesRevision();
    return matchesRevision && (allowStale || Date.now() - parsed.timestamp < CACHE_TTL)
      ? parsed.properties
      : null;
  } catch {
    return null;
  }
}

function isListedProperty(property: Property) {
  return property.listed === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function normalizeDirectProperty(row: unknown): Property | null {
  if (!isRecord(row)) return null;

  const raw = isRecord(row.data) ? row.data : row;
  const id = Number(raw.id ?? row.id);
  if (!Number.isSafeInteger(id) || id <= 0 || raw.listed !== true) return null;

  const images = Array.isArray(raw.images)
    ? raw.images.filter((value): value is string => typeof value === 'string').slice(0, 15)
    : [];

  return {
    ...raw,
    id,
    image: typeof raw.image === 'string' ? raw.image : images[0] || '',
    images,
    listed: true,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    nearbyStations: Array.isArray(raw.nearbyStations) ? raw.nearbyStations : [],
  } as unknown as Property;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function fetchPropertiesWithRetry() {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetchWithTimeout(getPublicPropertiesRequestPath(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (response.ok || response.status < 500 || attempt === 1) return response;
    } catch (error) {
      lastError = error;
      if (attempt === 1) throw error;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 450));
  }

  if (lastError instanceof Error && lastError.name === 'AbortError') {
    throw new Error('O catálogo demorou para responder.');
  }

  throw lastError instanceof Error ? lastError : new Error('Falha ao carregar propriedades');
}

async function fetchPropertiesDirectly() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Fonte direta de propriedades indisponível');
  }

  const response = await fetchWithTimeout(`${SUPABASE_URL}/rest/v1/rpc/get_public_properties`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (!response.ok) {
    throw new Error(`Falha na fonte direta: ${response.status}`);
  }

  const rows = await response.json();
  return Array.isArray(rows)
    ? rows.map(normalizeDirectProperty).filter((property): property is Property => Boolean(property))
    : [];
}

async function parsePropertiesResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('A rota /api/public-properties nao retornou JSON. Verifique o deploy da funcao.');
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(
      detail?.error || `Falha ao carregar propriedades: ${response.status}`
    );
  }

  const data = await response.json();
  return Array.isArray(data)
    ? (data as Property[]).filter(isListedProperty)
    : [];
}

function firstSuccessful<T>(requests: Array<Promise<T>>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let pending = requests.length;
    let lastError: unknown;

    requests.forEach((request) => {
      request.then(resolve).catch((error: unknown) => {
        lastError = error;
        pending -= 1;
        if (pending === 0) {
          reject(lastError instanceof Error ? lastError : new Error('Falha ao carregar propriedades'));
        }
      });
    });
  });
}

async function loadPropertiesFromSource(forceRefresh = false) {
  const revision = getPublicPropertiesRevision();
  if (!forceRefresh && cachedProperties && cachedRevision === revision) return cachedProperties;
  if (
    forceRefresh &&
    cachedProperties &&
    cachedRevision === revision &&
    Date.now() - lastSuccessfulFetchAt < REVALIDATION_INTERVAL
  ) {
    return cachedProperties;
  }
  if (pendingLoad) return pendingLoad;

  pendingLoad = (async () => {
    const loadedProperties = await firstSuccessful([
      fetchPropertiesWithRetry().then(parsePropertiesResponse),
      fetchPropertiesDirectly(),
    ]);

    cachedProperties = loadedProperties;
    cachedRevision = getPublicPropertiesRevision();
    lastSuccessfulFetchAt = Date.now();
    cachedError = null;
    try {
      sessionStorage.setItem(
        PUBLIC_PROPERTIES_CACHE_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          revision: cachedRevision,
          properties: cachedProperties,
        })
      );
    } catch {
      // Storage can be unavailable in privacy modes; memory cache still works.
    }
    return cachedProperties;
  })().catch((err) => {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    cachedError = message;
    const staleProperties = readSessionCache(true);
    if (staleProperties) {
      cachedProperties = staleProperties;
      return staleProperties;
    }
    throw new Error(message);
  }).finally(() => {
    pendingLoad = null;
  });

  return pendingLoad;
}

export function useProperties() {
  const sessionCachedProperties = cachedProperties || readSessionCache(true);
  const [items, setItems] = useState<Property[]>(sessionCachedProperties || []);
  const [isLoading, setIsLoading] = useState(!sessionCachedProperties);
  const [error, setError] = useState<string | null>(cachedError);

  useEffect(() => {
    let isMounted = true;

    const refresh = (forceRefresh = true) => {
      loadPropertiesFromSource(forceRefresh).then((loadedProperties) => {
        if (!isMounted) return;
        setItems(loadedProperties);
        setError(null);
      })
      .catch((err: Error) => {
        cachedError = err.message;
        if (!isMounted) return;
        setItems([]);
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'staybridge-public-properties-revision') refresh(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refresh(true);
    };
    const handleRefreshEvent = () => refresh(true);

    refresh(true);
    window.addEventListener('focus', handleRefreshEvent);
    window.addEventListener('storage', handleStorage);
    window.addEventListener(PUBLIC_PROPERTIES_UPDATED_EVENT, handleRefreshEvent);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleRefreshEvent);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PUBLIC_PROPERTIES_UPDATED_EVENT, handleRefreshEvent);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return {
    properties: items,
    isLoading,
    error,
  };
}
