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

async function fetchPropertiesWithRetry() {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(getPublicPropertiesRequestPath(), {
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

  throw lastError instanceof Error ? lastError : new Error('Falha ao carregar propriedades');
}

async function loadPropertiesFromSource(forceRefresh = false) {
  const revision = getPublicPropertiesRevision();
  if (!forceRefresh && cachedProperties && cachedRevision === revision) return cachedProperties;
  if (pendingLoad) return pendingLoad;

  pendingLoad = (async () => {
    const response = await fetchPropertiesWithRetry();

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
    cachedProperties = Array.isArray(data)
      ? (data as Property[]).filter(isListedProperty)
      : [];
    cachedRevision = getPublicPropertiesRevision();
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
  const [items, setItems] = useState<Property[]>(cachedProperties || []);
  const [isLoading, setIsLoading] = useState(!cachedProperties);
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
