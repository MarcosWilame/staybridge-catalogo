import { useEffect, useState } from 'react';
import type { Property } from './properties';
import {
  hasSupabaseConfig,
  loadPropertiesFromSupabase,
} from './supabaseProperties';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;

async function loadPropertiesFromSource() {
  if (cachedProperties) return cachedProperties;
  if (cachedError) throw new Error(cachedError);

  try {
    if (!hasSupabaseConfig()) {
      throw new Error('Supabase nao configurado.');
    }

    cachedProperties = await loadPropertiesFromSupabase();
    return cachedProperties;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    cachedError = message;
    throw new Error(message);
  }
}

export function useProperties() {
  const [items, setItems] = useState<Property[]>(cachedProperties || []);
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
        setItems([]);
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
    source: 'supabase',
  };
}
