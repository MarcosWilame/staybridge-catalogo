import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Banknote, Check, CheckCircle2, KeyRound, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { trackEvent } from '../utils/analytics';
import { useProperties } from '../data/sheetProperties';

export function Hero() {
  const navigate = useNavigate();
  const { properties } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const available = useMemo(() => properties.filter((property) => property.available).length, [properties]);
  const categories = useMemo(
    () => new Set(properties.filter((property) => property.available).map((property) => property.category)).size,
    [properties]
  );

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    params.set('availableNow', '1');
    trackEvent('property_search', { source: 'hero', search_term: searchTerm.trim() || undefined });
    navigate(`/properties?${params.toString()}`);
  };

  const handleQuickSearch = (label: string, query: string) => {
    trackEvent('property_search', { source: 'hero_quick_chip', quick_filter: label });
    navigate(`/properties?${query}`);
  };

  return (
    <section id="hero" className="relative min-h-[780px] overflow-hidden bg-[#102c20] pt-20 text-white md:min-h-[760px] md:pt-24">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1800&q=78"
          alt="Vista de Londres"
          className="h-full w-full object-cover object-[58%_center]"
          width={1800}
          height={1200}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,27,17,.98)_0%,rgba(9,43,28,.91)_48%,rgba(9,43,28,.34)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_35%,rgba(244,208,63,.15),transparent_27%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#071e14]/80 to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_.75fr] lg:px-8">
        <div className="max-w-4xl">
          <div className="hero-reveal mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[.14em] text-white backdrop-blur-md sm:text-xs">
            <MapPin className="h-4 w-4 text-[var(--yellow)]" />
            Acomodação em Londres • Atendimento em português
          </div>
          <h1 className="hero-reveal hero-delay-1 max-w-4xl text-[clamp(2.7rem,7vw,5.25rem)] font-black leading-[.98] tracking-[-.05em] text-white">
            Encontre sua acomodação <span className="text-[var(--yellow)]">em Londres.</span>
          </h1>
          <p className="hero-reveal hero-delay-2 mt-6 max-w-2xl text-base leading-relaxed text-white/82 sm:text-xl">
            Busque por região, estação ou postcode e veja opções disponíveis com preço claro e atendimento em português.
          </p>

          <form onSubmit={handleSearch} className="hero-reveal hero-delay-3 mt-8 grid gap-2 rounded-[1.35rem] border border-white/30 bg-white/95 p-2.5 shadow-[0_28px_80px_rgba(0,0,0,.38)] backdrop-blur-xl sm:grid-cols-[1fr_auto]" aria-label="Buscar acomodação">
            <label className="relative block">
              <span className="sr-only">Região, estação ou postcode</span>
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--green-medium)]" />
              <input
                type="search"
                inputMode="search"
                autoComplete="postal-code"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Região, estação ou postcode"
                className="min-h-14 w-full rounded-xl bg-[#f5f5ef] py-3 pl-12 pr-4 text-sm font-bold text-[#173627] outline-none placeholder:text-[#597062] ring-[var(--yellow)] focus:ring-2"
              />
            </label>
            <button type="submit" className="group inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-6 font-black text-[#102c20] shadow-[0_8px_24px_rgba(244,208,63,.28)] transition hover:-translate-y-0.5 hover:bg-[var(--yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><Search className="h-5 w-5" /> Buscar imóveis <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></button>
          </form>

          <div className="hero-reveal hero-delay-4 mt-3 flex flex-wrap gap-2" aria-label="Buscas rápidas">
            <button type="button" onClick={() => handleQuickSearch('from_160', 'availableNow=1&sort=price-asc')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-black text-white backdrop-blur-md transition hover:border-[var(--yellow)]/60 hover:bg-[var(--yellow)] hover:text-[#102c20]"><Banknote className="h-4 w-4" /> Imóveis a partir de £160 por semana</button>
            <button type="button" onClick={() => handleQuickSearch('bills_included', 'availableNow=1&billsIncluded=1')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-bold text-white backdrop-blur-md transition hover:border-[var(--yellow)]/60 hover:bg-white/20"><Check className="h-4 w-4 text-[var(--yellow)]" /> Contas inclusas</button>
            <button type="button" onClick={() => handleQuickSearch('available_now', 'availableNow=1')} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-bold text-white backdrop-blur-md transition hover:border-[var(--yellow)]/60 hover:bg-white/20"><CheckCircle2 className="h-4 w-4 text-[var(--yellow)]" /> Entrada imediata</button>
          </div>

          <div className="hero-reveal hero-delay-4 mt-4 flex flex-col gap-4 text-sm text-white/80 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {['Valores semanais claros', 'Disponibilidade atualizada', 'Suporte em português'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-[var(--yellow)]" /> {item}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="hero-reveal hero-delay-3 hidden lg:block" aria-label="Resumo de disponibilidade">
          <div className="relative ml-auto max-w-sm rounded-[2rem] border border-white/20 bg-white/12 p-6 shadow-[0_30px_90px_rgba(0,0,0,.28)] backdrop-blur-xl">
            <div className="absolute -right-5 -top-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--yellow)] text-[#102c20] shadow-2xl"><Sparkles className="h-7 w-7" /></div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.14em] text-white/70"><span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#66e69a] opacity-70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#66e69a]" /></span> Catálogo ativo agora</div>
            <div className="mt-6 flex items-end gap-3"><strong className="text-6xl font-black tracking-[-.06em] text-white">{available || '—'}</strong><span className="pb-2 text-sm leading-tight text-white/65">opções<br />disponíveis</span></div>
            <div className="my-6 h-px bg-white/15" />
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/15 p-4"><KeyRound className="h-5 w-5 text-[var(--yellow)]" /><strong className="mt-3 block text-xl">{categories || '—'}</strong><span className="text-xs text-white/60">tipos de acomodação</span></div>
              <div className="rounded-2xl bg-black/15 p-4"><ShieldCheck className="h-5 w-5 text-[var(--yellow)]" /><strong className="mt-3 block text-sm">Decisão clara</strong><span className="text-xs text-white/60">fotos, preço e detalhes</span></div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
