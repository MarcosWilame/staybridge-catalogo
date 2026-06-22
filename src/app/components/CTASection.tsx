import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { LeadCaptureModal } from './LeadCaptureModal';
import type { LeadIntent } from '../utils/leadCapture';

export function CTASection() {
  const navigate = useNavigate();
  const [leadIntent, setLeadIntent] = useState<LeadIntent>('whatsapp');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);

  const handleWhatsApp = () => {
    trackEvent('lead_cta_click', { source: 'home_cta', intent: 'whatsapp' });
    setLeadIntent('whatsapp');
    setIsLeadFormOpen(true);
  };

  const goToProperties = () => {
    trackEvent('properties_cta_click', { source: 'home_cta' });
    navigate('/properties');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] py-12 md:py-20">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--yellow)]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Brush Stroke Title */}
          <div className="mb-6 relative inline-block">
            <h2 className="relative z-10 text-3xl font-bold leading-tight text-white md:text-6xl">
              Pronto para se Mudar?
            </h2>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="16"
              viewBox="0 0 400 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 13C100 3 300 3 397 13"
                stroke="var(--yellow)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-white/90 md:mb-12 md:text-2xl">
            Fale com nossa equipe em português agora e garanta sua acomodação em Londres.
            <br />
            <strong className="text-[var(--yellow)]">Disponível agora!</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button
              onClick={handleWhatsApp}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-5 py-3.5 text-base font-bold text-black shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[var(--yellow-dark)] hover:shadow-3xl sm:w-auto md:px-10 md:py-5 md:text-lg"
            >
              <MessageCircle className="w-6 h-6" />
              Falar no WhatsApp Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={goToProperties}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-5 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 sm:w-auto md:px-10 md:py-5 md:text-lg"
            >
              Ver Todas as Unidades
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-white/80 md:mt-12 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full animate-pulse" />
              <span className="text-sm">Resposta em minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full animate-pulse" />
              <span className="text-sm">Sem taxas escondidas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full animate-pulse" />
              <span className="text-sm">Equipe brasileira</span>
            </div>
          </div>
        </div>
      </div>
      <LeadCaptureModal
        isOpen={isLeadFormOpen}
        intent={leadIntent}
        source="home_cta"
        onIntentChange={setLeadIntent}
        onClose={() => setIsLeadFormOpen(false)}
      />
    </section>
  );
}
