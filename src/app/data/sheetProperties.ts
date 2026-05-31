import { useEffect, useState } from 'react';
import { properties as localProperties, type Property } from './properties';
import { hasSupabaseConfig, loadPropertiesFromSupabase } from './supabaseProperties';

let cachedProperties: Property[] | null = null;
let cachedError: string | null = null;

function isListedProperty(property: Property) {
  return property.listed !== false;
}

function getLocalProperties() {
  return localProperties.filter(isListedProperty);
}

async function loadPropertiesFromApi() {
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
  return Array.isArray(data)
    ? (data as Property[]).filter(isListedProperty)
    : [];
}

async function loadPropertiesFromJson() {
  const response = await fetch('/properties.json', {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Falha ao carregar properties.json: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data)
    ? (data as Property[]).filter(isListedProperty)
    : [];
}

async function loadPropertiesFromSource() {
  if (cachedProperties) return cachedProperties;
  if (cachedError) throw new Error(cachedError);

  try {
    const apiProperties = await loadPropertiesFromApi();
    if (apiProperties.length) {
      cachedProperties = apiProperties;
      return cachedProperties;
    }
  } catch (err) {
    cachedError = err instanceof Error ? err.message : 'Erro desconhecido';
  }

  try {
    if (hasSupabaseConfig()) {
      const supabaseProperties = (await loadPropertiesFromSupabase()).filter(isListedProperty);

      if (supabaseProperties.length) {
        cachedProperties = supabaseProperties;
        cachedError = null;
        return cachedProperties;
      }
    }
  } catch (err) {
    cachedError = err instanceof Error ? err.message : cachedError;
  }

  try {
    const jsonProperties = await loadPropertiesFromJson();
    cachedProperties = jsonProperties.length ? jsonProperties : getLocalProperties();
    return cachedProperties;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    cachedError = cachedError || message;
    cachedProperties = getLocalProperties();
    return cachedProperties;
  }
}

export function useProperties() {
  const [items, setItems] = useState<Property[]>(cachedProperties || getLocalProperties());
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
