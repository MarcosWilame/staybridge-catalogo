import { Building2, Headphones, KeyRound, ShieldCheck } from 'lucide-react';

const proofPoints = [
  { icon: KeyRound, value: '300+', label: 'imóveis alugados em Londres' },
  { icon: ShieldCheck, value: '10+', label: 'anos de experiência no mercado' },
  { icon: Building2, value: 'Estrutura local', label: 'operação profissional em Londres' },
  { icon: Headphones, value: 'Em português', label: 'suporte humano até a mudança' },
];

export function HomeProofBar() {
  return (
    <section aria-label="Experiência e confiança Staybridge" className="relative z-20 border-y border-white/10 bg-[#0d3021] text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {proofPoints.map(({ icon: Icon, value, label }, index) => (
          <div
            key={label}
            className={`flex min-h-28 items-center gap-3 px-3 py-5 sm:px-5 lg:min-h-32 ${index % 2 ? 'border-l border-white/10' : ''} ${index > 1 ? 'border-t border-white/10 lg:border-t-0' : ''} lg:border-l lg:first:border-l-0`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--yellow)]/30 bg-[var(--yellow)]/10 text-[var(--yellow)]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-base font-black leading-tight text-white sm:text-lg">{value}</strong>
              <span className="mt-1 block max-w-[12rem] text-xs leading-snug text-white/58">{label}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
