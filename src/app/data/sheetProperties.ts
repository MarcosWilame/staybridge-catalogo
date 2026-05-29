import { useEffect, useState } from 'react';
import { Property, properties as fallbackProperties } from './properties';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;

const STORAGE_KEY = 'staybridge_properties';

async function loadPropertiesFromJson() {
  if (cachedProperties) return cachedProperties;
  if (cachedError) throw new Error(cachedError);

  try {
    // Verificar localStorage primeiro
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (Array.isArray(data) && data.length > 0) {
        cachedProperties = data as Property[];
        return data;
      }
    }

    // Carregar do properties.json
    const response = await fetch('/properties.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha ao carregar properties.json: ${response.status}`);
    }

    const data = await response.json();
    const loadedProperties = Array.isArray(data)
      ? data.filter((p) => p && typeof p === 'object')
      : [];

    if (!loadedProperties.length) {
      throw new Error('properties.json está vazio ou inválido.');
    }

    cachedProperties = loadedProperties as Property[];
    return loadedProperties;
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

    loadPropertiesFromJson()
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
    source: error ? 'fallback' : 'json',
  };
}