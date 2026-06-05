import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_SOCIAL_IMAGE, getAbsoluteUrl, SITE_NAME } from '../config/site';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
}

function setMeta(selector: string, attr: 'content' | 'href', value: string) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;

  if (!element) {
    element = selector.startsWith('meta')
      ? document.createElement('meta')
      : document.createElement('link');

    const nameMatch = selector.match(/\[name="([^"]+)"\]/);
    const propertyMatch = selector.match(/\[property="([^"]+)"\]/);
    const relMatch = selector.match(/\[rel="([^"]+)"\]/);

    if (nameMatch) element.setAttribute('name', nameMatch[1]);
    if (propertyMatch) element.setAttribute('property', propertyMatch[1]);
    if (relMatch) element.setAttribute('rel', relMatch[1]);

    document.head.appendChild(element);
  }

  element.setAttribute(attr, value);
}

function getImageUrl(image?: string) {
  if (!image) return getAbsoluteUrl(DEFAULT_SOCIAL_IMAGE);
  if (/^https?:\/\//i.test(image)) return image;
  return getAbsoluteUrl(image);
}

export function SEO({
  title,
  description,
  image,
  type = 'website',
  jsonLd,
}: SEOProps) {
  const location = useLocation();

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = getAbsoluteUrl(location.pathname);
    const socialImage = getImageUrl(image);

    document.title = fullTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', canonicalUrl);

    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:image"]', 'content', socialImage);

    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', socialImage);

    const scriptId = 'page-json-ld';
    document.getElementById(scriptId)?.remove();

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [description, image, jsonLd, location.pathname, title, type]);

  return null;
}
