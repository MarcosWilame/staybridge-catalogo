import { useState } from 'react';
import { getMarketingConsent, setMarketingConsent } from '../utils/analytics';

export function CookieConsent() {
  const [visible, setVisible] = useState(() => getMarketingConsent() === null);

  if (!visible) return null;

  const choose = (accepted: boolean) => {
    setMarketingConsent(accepted);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Preferências de cookies"
      className="fixed bottom-20 left-3 right-3 z-[70] mx-auto max-w-xl rounded-2xl border border-white/15 bg-[#123d2a]/95 p-4 text-white shadow-2xl backdrop-blur-xl md:bottom-5 md:left-5 md:right-auto"
    >
      <p className="text-sm leading-relaxed text-white/80">
        Usamos cookies de análise para entender o uso do site e melhorar sua experiência.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => choose(false)}
          className="min-h-10 flex-1 rounded-xl border border-white/25 px-4 text-sm font-bold text-white"
        >
          Recusar
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="min-h-10 flex-1 rounded-xl bg-[var(--yellow)] px-4 text-sm font-black text-[#123d2a]"
        >
          Aceitar
        </button>
      </div>
    </aside>
  );
}
