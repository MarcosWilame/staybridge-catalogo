import { ArrowRight, CheckCircle2, FileText, Headphones, Home, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const confidenceItems = [
  { icon: Headphones, title: 'Atendimento em português' },
  { icon: FileText, title: 'Preço e detalhes transparentes' },
  { icon: ShieldCheck, title: 'Orientação até a mudança' },
];

const steps = [
  { number: '01', icon: Search, title: 'Encontre', text: 'Busque por região, estação ou postcode.' },
  { number: '02', icon: Headphones, title: 'Converse', text: 'Confirme disponibilidade e tire suas dúvidas.' },
  { number: '03', icon: Home, title: 'Mude', text: 'Organize sua entrada com suporte da equipe.' },
];

export function HomeTrustStrip() {
  return (
    <section id="benefits" className="reveal-section relative overflow-hidden bg-[#113424] py-16 text-white md:py-20">
      <div aria-hidden="true" className="absolute -right-32 -top-32 h-96 w-96 rounded-full border-[70px] border-[var(--yellow)]/5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--yellow)]"><CheckCircle2 className="h-4 w-4" /> Simples, claro e humano</p>
            <h2 className="text-3xl font-black leading-tight tracking-[-.035em] md:text-5xl">Da busca à mudança, você não está sozinho.</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65 md:text-lg">Uma jornada objetiva para encontrar, confirmar e reservar sua acomodação em Londres.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {confidenceItems.map(({ icon: Icon, title }) => (
              <div key={title} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2.5 text-sm font-bold text-white/82 backdrop-blur-sm"><Icon className="h-4 w-4 shrink-0 text-[var(--yellow)]" />{title}</div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,.16)] backdrop-blur-sm md:grid-cols-3">
          {steps.map(({ number, icon: Icon, title, text }, index) => (
            <article key={number} className={`relative p-6 md:p-8 ${index ? 'border-t border-white/10 md:border-l md:border-t-0' : ''}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-[.18em] text-[var(--yellow)]">PASSO {number}</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--yellow)] text-[#113424]"><Icon className="h-5 w-5" /></div>
              </div>
              <h3 className="mt-6 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{text}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link to="/properties" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-6 font-black text-[#113424] transition hover:-translate-y-0.5 hover:bg-white">Começar minha busca <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </div>
    </section>
  );
}
