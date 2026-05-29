import { useEffect, useState } from 'react';
import { properties as fallbackProperties, type Property } from './properties';
import {
  hasSupabaseConfig,
  loadPropertiesFromSupabase,
  readPropertiesCache,
  writePropertiesCache,
} from './supabaseProperties';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;

async function loadPropertiesFromSource() {
  if (cachedProperties) return cachedProperties;
  if (cachedError) throw new Error(cachedError);

  try {
    const cached = readPropertiesCache();
    if (cached.length > 0) {
      cachedProperties = cached;
      return cached;
    }

    if (hasSupabaseConfig()) {
      const remoteProperties = await loadPropertiesFromSupabase();
      if (remoteProperties.length > 0) {
        cachedProperties = remoteProperties;
        writePropertiesCache(remoteProperties);
        return remoteProperties;
      }
    }

    const response = await fetch('/properties.json', { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Falha ao carregar properties.json: ${response.status}`);
    }

    const data = await response.json();
    const loadedProperties = Array.isArray(data)
      ? data.filter((item) => item && typeof item === 'object')
      : [];

    if (!loadedProperties.length) {
      throw new Error('properties.json está vazio ou inválido.');
    }

    cachedProperties = loadedProperties as Property[];
    writePropertiesCache(cachedProperties);
    return cachedProperties;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    cachedError = message;
    throw new Error(message);
  }
}

export function useProperties() {
  const [items, setItems] = useState<Property[]>(
    cachedProperties || fallbackProperties
  );
  const [isLoading, setIsLoading] = useState(!cachedProperties);
  const [error, setError] = useState<string | null>(cachedError);

  useEffect(() => {
    let isMounted = true;

    loadPropertiesFromSource()
      .then((loadedProperties) => {
        if (!isMounted) return;
        setItems(loadedProperties);
        setError(null);
      })
      .catch((err: Error) => {
        cachedError = err.message;
        if (!isMounted) return;
        setItems(fallbackProperties);
        setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    properties: items,
    isLoading,
    error,
    source: error ? 'fallback' : hasSupabaseConfig() ? 'supabase' : 'json',
  };
}
