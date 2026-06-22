type AnalyticsValue = string | number | boolean | null | undefined;

type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    _fbq?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  }
}

let marketingRequested = false;

function appendAsyncScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function prepareMarketingQueues() {
  if (typeof window === 'undefined') return;

  window.dataLayer ||= [];
  window.gtag ||= (...args: unknown[]) => window.dataLayer?.push(args);

  if (!window.fbq) {
    const queue: unknown[][] = [];
    const fbq = (...args: unknown[]) => queue.push(args);
    Object.assign(fbq, { queue, loaded: false, version: '2.0' });
    window.fbq = fbq;
    window._fbq = fbq;
  }
}

export function loadMarketingScripts() {
  if (typeof window === 'undefined' || marketingRequested) return;
  marketingRequested = true;
  prepareMarketingQueues();

  window.gtag?.('js', new Date());
  window.gtag?.('config', 'G-V9D1KS9Y74', { send_page_view: false });
  window.fbq?.('init', '824860120424535');

  appendAsyncScript('https://www.googletagmanager.com/gtag/js?id=G-V9D1KS9Y74');
  appendAsyncScript('https://connect.facebook.net/en_US/fbevents.js');
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  prepareMarketingQueues();
  loadMarketingScripts();
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
  const isLeadConversion =
    eventName === 'whatsapp_click' || eventName === 'lead_form_submit';

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);

    if (isLeadConversion) {
      window.gtag('event', 'generate_lead', {
        ...cleanParams,
        lead_source: params.source || 'site',
        method: 'whatsapp',
      });
    }
  }

  if (typeof window.fbq === 'function') {
    window.fbq('trackCustom', eventName, cleanParams);

    if (isLeadConversion) {
      window.fbq('track', 'Lead', cleanParams);
    }
  }
}
