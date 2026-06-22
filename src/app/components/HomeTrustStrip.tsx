import { CheckCircle2, FileText, Headphones, Home, Search, ShieldCheck } from 'lucide-react';

const confidenceItems = [
  { icon: Headphones, title: 'Atendimento em português', text: 'Orientação clara desde a busca até a mudança.' },
  { icon: FileText, title: 'Informações transparentes', text: 'Preço semanal, localização e detalhes importantes antes do contato.' },
  { icon: ShieldCheck, title: 'Decisão com mais segurança', text: 'Tire dúvidas e alinhe os próximos passos diretamente com a equipe.' },
];

const steps = [
  { number: '01', icon: Search, title: 'Encontre', text: 'Filtre por tipo, região e disponibilidade.' },
  { number: '02', icon: Headphones, title: 'Converse', text: 'Confirme os detalhes com atendimento em português.' },
  { number: '03', icon: Home, title: 'Mude', text: 'Organize sua entrada com mais clareza e tranquilidade.' },
];

export function HomeTrustStrip() {
  return (
    <section id="benefits" className="bg-[#113424] py-16 text-white md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 lg:px-8">
        <div>
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-[var(--yellow)]"><CheckCircle2 className="h-4 w-4" /> Confiança em cada etapa</p>
          <h2 className="text-3xl font-extrabold leading-tight tracking-[-.025em] md:text-5xl">Mudar de país já é complexo. Encontrar casa não precisa ser.</h2>
          <p className="mt-5 max-w-xl leading-relaxed text-white/70 md:text-lg">A Staybridge combina um catálogo simples de comparar com atendimento humano para reduzir dúvidas e acelerar sua decisão.</p>
          <div className="mt-8 space-y-6">
            {confidenceItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--yellow)] text-[#113424]"><Icon className="h-5 w-5" /></div><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-white/65">{text}</p></div></div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-[#f4f0dd] p-6 text-[#173627] shadow-[0_30px_80px_rgba(0,0,0,.18)] md:p-10">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#47705a]">Como funciona</p>
          <h3 className="mt-3 text-2xl font-extrabold md:text-3xl">Do primeiro clique à sua nova casa</h3>
          <div className="mt-8 divide-y divide-[#173627]/12">
            {steps.map(({ number, icon: Icon, title, text }) => (
              <div key={number} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 py-6 first:pt-0 last:pb-0"><span className="text-sm font-black text-[#47705a]">{number}</span><div><h4 className="text-lg font-extrabold">{title}</h4><p className="mt-1 text-sm leading-relaxed text-[#456152]">{text}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#173627]/15 bg-white/60"><Icon className="h-5 w-5" /></div></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
