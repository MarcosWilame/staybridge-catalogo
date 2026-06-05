import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function Analytics() {
  const location = useLocation();

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
