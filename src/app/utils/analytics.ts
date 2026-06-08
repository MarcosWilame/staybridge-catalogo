type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  const pageParams =
    typeof window === 'undefined'
      ? {}
      : {
          page_path: `${window.location.pathname}${window.location.search}`,
          page_location: window.location.href,
          page_title: document.title,
        };

  const cleanParams = Object.fromEntries(
    Object.entries({ ...pageParams, ...params }).filter(
      ([, value]) => value !== undefined && value !== ''
    )
  );

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);

    if (eventName === 'whatsapp_click') {
      window.gtag('event', 'generate_lead', {
        ...cleanParams,
        lead_source: params.source || 'site',
        method: 'whatsapp',
      });
    }
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, cleanParams);

    if (eventName === 'whatsapp_click') {
      window.fbq('track', 'Lead', cleanParams);
    }
  }
}
