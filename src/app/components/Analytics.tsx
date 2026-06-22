import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadMarketingScripts, prepareMarketingQueues } from '../utils/analytics';

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    prepareMarketingQueues();

    const load = () => loadMarketingScripts();
    const idleWindow = window as unknown as {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const idleId = idleWindow.requestIdleCallback
      ? idleWindow.requestIdleCallback(load, { timeout: 3500 })
      : window.setTimeout(load, 2500);
    const events: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, load, { once: true, passive: true }));

    return () => {
      if (idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
      events.forEach((event) => window.removeEventListener(event, load));
    };
  }, []);

  useEffect(() => {
    // Meta Pixel — dispara PageView a cada troca de rota
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    // Google Analytics 4 — dispara page_view a cada troca de rota
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
      });
    }
  }, [location.pathname, location.search]);

  return null;
}
