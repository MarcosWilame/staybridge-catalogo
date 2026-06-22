import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, MapPin, MessageCircle, Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { openWhatsApp } from '../config/contact';
import { trackEvent } from '../utils/analytics';

export function Hero() {
  const navigate = useNavigate();
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (region) params.set('region', region);
    params.set('availableNow', '1');
    trackEvent('property_search', { source: 'hero', type, region });
    navigate(`/properties?${params.toString()}`);
  };

  const handleWhatsApp = () => {
    trackEvent('whatsapp_click', { source: 'hero' });
    openWhatsApp();
  };

  return (
    <section id="hero" className="relative min-h-[760px] overflow-hidden bg-[#102c20] pt-24 md:min-h-[720px] md:pt-20">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1600&q=76"
          alt="Vista de Londres"
          className="h-full w-full object-cover object-center"
          width={1600}
          height={1067}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,30,20,.96)_0%,rgba(10,39,27,.88)_46%,rgba(10,39,27,.34)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071e14]/70 via-transparent to-[#071e14]/25" />
      </div>

      <div className="relative mx-auto flex min-h-[636px] max-w-7xl items-center px-4 py-14 sm:px-6 md:min-h-[640px] lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-white backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-[var(--yellow)]" />
            Acomodação em Londres • Atendimento em português
          </div>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-[-.035em] text-white sm:text-6xl lg:text-7xl">
            Seu lugar em Londres, <span className="text-[var(--yellow)]">sem complicação.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-xl">
            Compare quartos, suítes, estúdios e apartamentos disponíveis. Informações claras e suporte humano para você escolher com segurança.
          </p>

          <form onSubmit={handleSearch} className="mt-8 grid gap-2 rounded-2xl bg-white p-2.5 shadow-[0_24px_70px_rgba(0,0,0,.28)] sm:grid-cols-[1fr_1fr_auto]" aria-label="Buscar acomodação">
            <label><span className="sr-only">Tipo de acomodação</span><select value={type} onChange={(event) => setType(event.target.value)} className="min-h-14 w-full appearance-none rounded-xl bg-[#f5f5ef] px-4 text-sm font-semibold text-[#173627] outline-none ring-[var(--yellow)] focus:ring-2"><option value="">Todos os tipos</option><option value="single">Quarto individual</option><option value="double">Quarto duplo</option><option value="ensuite">Suíte</option><option value="studio">Estúdio</option><option value="flat">Apartamento</option></select></label>
            <label><span className="sr-only">Região de Londres</span><select value={region} onChange={(event) => setRegion(event.target.value)} className="min-h-14 w-full appearance-none rounded-xl bg-[#f5f5ef] px-4 text-sm font-semibold text-[#173627] outline-none ring-[var(--yellow)] focus:ring-2"><option value="">Todas as regiões</option><option value="North">Norte de Londres</option><option value="South">Sul de Londres</option><option value="East">Leste de Londres</option><option value="West">Oeste de Londres</option></select></label>
            <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-6 font-extrabold text-[#102c20] transition hover:bg-[var(--yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Search className="h-5 w-5" /> Buscar imóveis</button>
          </form>

          <div className="mt-5 flex flex-col gap-4 text-sm text-white/85 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--yellow)]" /> Valores semanais claros</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--yellow)]" /> Disponibilidade atualizada</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--yellow)]" /> Suporte em português</span>
            </div>
            <button type="button" onClick={handleWhatsApp} className="inline-flex shrink-0 items-center gap-2 font-bold text-white underline decoration-white/35 underline-offset-4 transition hover:text-[var(--yellow)]"><MessageCircle className="h-5 w-5" /> Prefere ajuda? Fale conosco <ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
