export const PUBLIC_PROPERTIES_CACHE_KEY = 'staybridge-public-properties-v3';
export const PUBLIC_PROPERTIES_UPDATED_EVENT = 'staybridge:properties-updated';
const PUBLIC_PROPERTIES_REVISION_KEY = 'staybridge-public-properties-revision';

export function getPublicPropertiesRequestPath(timestamp = Date.now()) {
  return `/api/public-properties?revision=${encodeURIComponent(timestamp)}`;
}

export function getPublicPropertiesRevision() {
  try {
    return localStorage.getItem(PUBLIC_PROPERTIES_REVISION_KEY) || '';
  } catch {
    return '';
  }
}

export function invalidatePublicPropertiesCache() {
  const revision = String(Date.now());

  try {
    sessionStorage.removeItem(PUBLIC_PROPERTIES_CACHE_KEY);
    localStorage.setItem(PUBLIC_PROPERTIES_REVISION_KEY, revision);
  } catch {
    // Storage can be unavailable in privacy modes.
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PUBLIC_PROPERTIES_UPDATED_EVENT));
  }

  return revision;
}
