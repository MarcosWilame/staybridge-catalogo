import { useEffect, useState } from 'react';
import type { Property } from './properties';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;

async function loadPropertiesFromSource() {
  if (cachedProperties) return cachedProperties;
  if (cachedError) throw new Error(cachedError);

  try {
    const response = await fetch('/api/public-properties', {
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Falha ao carregar propriedades: ${response.status}`);
    }

    const data = await response.json();
    cachedProperties = Array.isArray(data) ? (data as Property[]) : [];
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
