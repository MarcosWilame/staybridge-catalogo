export const PUBLIC_PROPERTIES_CACHE_KEY = 'staybridge-public-properties-v2';
const PUBLIC_PROPERTIES_REVISION_KEY = 'staybridge-public-properties-revision';

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

  return revision;
}
