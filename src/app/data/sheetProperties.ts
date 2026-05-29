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
  };
}
