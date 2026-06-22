import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Search } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

export function CTASection() {
  const navigate = useNavigate();

  const exploreProperties = () => {
    trackEvent('properties_cta_click', { source: 'home_cta' });
    navigate('/properties');
  };

  return (
    <section className="reveal-section relative overflow-hidden bg-[#f0c933] px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div aria-hidden="true" className="absolute -left-20 -top-20 h-72 w-72 rounded-full border-[50px] border-white/15" />
      <div className="relative mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2rem] bg-[#173627] px-6 py-10 text-white shadow-[0_28px_80px_rgba(23,54,39,.28)] md:px-12 md:py-14 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(244,208,63,.16),transparent_62%)]" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[var(--yellow)]">Explore no seu ritmo</p>
          <h2 className="mt-3 text-3xl font-black leading-tight tracking-[-.035em] md:text-5xl">Sua próxima acomodação pode estar a poucos cliques.</h2>
          <p className="mt-4 max-w-2xl text-white/70 md:text-lg">Compare valores, fotos, regiões e disponibilidade com autonomia.</p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70">
            {['Filtros completos', 'Informações claras', 'Imóveis atualizados'].map((item) => <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-[var(--yellow)]" />{item}</span>)}
          </div>
        </div>
        <button onClick={exploreProperties} className="group relative inline-flex min-h-14 min-w-[250px] items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-7 font-black text-[#173627] shadow-[0_14px_35px_rgba(244,208,63,.24)] transition hover:-translate-y-0.5 hover:bg-white"><Search className="h-5 w-5" /> Explorar imóveis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
      </div>
    </section>
  );
}
