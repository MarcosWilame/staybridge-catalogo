type AnalyticsEventParams = Record<string, string | number | boolean | undefined>;

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

export function isAnalyticsEnabled() {
  return Boolean(GA_MEASUREMENT_ID);
}

export function trackEvent(eventName: string, params: AnalyticsEventParams = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  window.gtag('event', eventName, params);
}

export function trackWhatsAppClick(source: string, params: AnalyticsEventParams = {}) {
  trackEvent('whatsapp_click', {
    source,
    ...params,
  });
}

export function trackPropertyEvent(
  eventName: string,
  property: {
    id: number;
    title: string;
    type: string;
    region: string;
    price?: string;
    category?: string;
  },
  params: AnalyticsEventParams = {}
) {
  trackEvent(eventName, {
    property_id: property.id,
    property_title: property.title,
    property_type: property.type,
    property_region: property.region,
    property_price: property.price,
    property_category: property.category,
    ...params,
  });
}
