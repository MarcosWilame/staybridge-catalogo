type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, cleanParams);
  }
}
