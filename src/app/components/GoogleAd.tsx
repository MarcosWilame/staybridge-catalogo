import { useEffect, useState } from 'react';
import { getMarketingConsent } from '../utils/analytics';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let adsenseScriptRequested = false;

type GoogleAdProps = {
  className?: string;
};

export function GoogleAd({ className = '' }: GoogleAdProps) {
  const [consent, setConsent] = useState(() => getMarketingConsent() === true);
  const client = String(import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT || '').trim();

  useEffect(() => {
    const refreshConsent = () => setConsent(getMarketingConsent() === true);
    window.addEventListener('staybridge-marketing-consent', refreshConsent);
    return () => window.removeEventListener('staybridge-marketing-consent', refreshConsent);
  }, []);

  useEffect(() => {
    if (!client || !consent) return;

    if (!adsenseScriptRequested) {
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
      document.head.appendChild(script);
      adsenseScriptRequested = true;
    }

  }, [client, consent]);

  return null;
}
