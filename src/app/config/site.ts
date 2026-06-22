export const SITE_URL = 'https://staybridgelondon.com';
export const SITE_NAME = 'Staybridge London';
export const DEFAULT_SOCIAL_IMAGE = '/img/06.png';

export function getAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
}
