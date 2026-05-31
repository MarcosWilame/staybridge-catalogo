import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { GA_MEASUREMENT_ID } from '../utils/analytics';

declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof document === 'undefined') return;
    if (document.querySelector(`script[src*="${GA_MEASUREMENT_ID}"]`)) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
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
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);

  return null;
}
