import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
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

  return (
    <section className="bg-[#f0c933] px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-7 rounded-[2rem] bg-[#173627] px-6 py-10 text-white shadow-[0_24px_60px_rgba(23,54,39,.22)] md:flex-row md:items-center md:justify-between md:px-12 md:py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[var(--yellow)]">Seu próximo passo</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.025em] md:text-5xl">Encontrou uma opção ou ainda precisa de ajuda?</h2>
          <p className="mt-4 text-white/70 md:text-lg">Fale com nossa equipe em português ou continue comparando as acomodações disponíveis.</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
          <button onClick={handleWhatsApp} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-6 py-3.5 font-extrabold text-[#173627] transition hover:bg-white"><MessageCircle className="h-5 w-5" /> Falar com a equipe</button>
          <button onClick={() => { trackEvent('properties_cta_click', { source: 'home_cta' }); navigate('/properties'); }} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">Ver imóveis <ArrowRight className="h-5 w-5" /></button>
        </div>
      </div>
      <LeadCaptureModal isOpen={isLeadFormOpen} intent={leadIntent} source="home_cta" onIntentChange={setLeadIntent} onClose={() => setIsLeadFormOpen(false)} />
    </section>
  );
}
