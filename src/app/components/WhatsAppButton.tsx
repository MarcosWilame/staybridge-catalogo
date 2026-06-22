import { MessageCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { openWhatsApp } from '../config/contact';
import { trackEvent } from '../utils/analytics';

export function WhatsAppButton() {
  const location = useLocation();
  const isCatalogFlow =
    location.pathname === '/properties' ||
    location.pathname.startsWith('/property/');

  const handleClick = () => {
    trackEvent('whatsapp_click', {
      source: 'floating_button',
      page: location.pathname,
    });
    openWhatsApp();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Falar com a Staybridge London no WhatsApp"
      className={`group whatsapp-enter fixed bottom-24 right-4 z-50 rounded-full border-2 border-white/80 bg-[#25D366] p-3 text-white shadow-[0_16px_40px_rgba(0,0,0,.28)] transition-transform duration-300 hover:scale-110 hover:bg-[#20BA5A] active:scale-95 md:bottom-6 md:right-6 md:p-4 ${
        isCatalogFlow ? 'hidden md:block' : ''
      }`}
    >
      <MessageCircle className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12 md:h-8 md:w-8" />

      {/* Tooltip */}
      <div aria-hidden="true" className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Fale conosco no WhatsApp
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900" />
      </div>

      {/* Pulse Animation */}
      <div className="whatsapp-pulse absolute inset-0 -z-10 rounded-full bg-[#25D366]" />
    </button>
  );
}
