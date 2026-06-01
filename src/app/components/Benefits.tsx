import { MessageCircle, FileCheck, Zap, Shield, Users, CheckCircle } from 'lucide-react';

const benefits = [
  {
    icon: MessageCircle,
    title: 'Atendimento em Português',
    description: 'Equipe brasileira para ajudar você em cada etapa',
    accent: 'benefit-accent-teal',
  },
  {
    icon: FileCheck,
    title: 'Bills Inclusas',
    description: 'Água, luz, gás e internet já inclusos no preço',
    accent: 'benefit-accent-gold',
  },
  {
    icon: Zap,
    title: 'Entrada Imediata',
    description: 'Move-in rápido sem complicações burocráticas',
    accent: 'benefit-accent-whatsapp',
  },
  {
    icon: Shield,
    title: 'Contrato Seguro',
    description: 'Documentação completa e proteção garantida',
    accent: 'benefit-accent-blue',
  },
  {
    icon: Users,
    title: 'Suporte Contínuo',
    description: 'Assistência durante toda sua estadia',
    accent: 'benefit-accent-sage',
  },
  {
    icon: CheckCircle,
    title: 'Propriedades Verificadas',
    description: 'Todas as acomodações são inspecionadas',
    accent: 'benefit-accent-stone',
  },
];

export function Benefits() {
  return (
    <section className="relative overflow-hidden bg-[image:linear-gradient(180deg,var(--color3)_0%,color-mix(in_srgb,var(--color3)_30%,#ffffff_70%)_46%,#ffffff_74%,var(--green-light)_100%)] pb-24 pt-12 md:pb-32 md:pt-20">
      {/* Diagonal Background Element */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-[var(--green-dark)]/5 to-transparent transform -skew-y-3 origin-top-left" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--color3)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[image:linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.78)_38%,var(--green-light)_100%)] md:h-56" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:mb-16">
          <div className="mb-4 inline-block rounded-full bg-[var(--yellow)] px-4 py-2 text-xs font-bold text-black md:text-sm">
            POR QUE ESCOLHER A BEDMINSTER
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            Facilitamos sua Vida
            <br />
            <span className="text-[var(--green-medium)]">em Londres</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-xl">
            Mais de 500 brasileiros já encontraram seu lar conosco
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className={`home-benefit-card ${benefit.accent} group relative overflow-hidden rounded-lg p-5 transition-all duration-300 hover:-translate-y-2 md:p-8`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-[image:linear-gradient(90deg,var(--card-accent),color-mix(in_srgb,var(--card-accent)_38%,#ffffff_62%))]" />
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--card-accent)] text-white shadow-lg shadow-[var(--card-shadow)] transition-transform duration-300 group-hover:scale-110 md:mb-6 md:h-16 md:w-16 md:rounded-2xl">
                  <Icon className="h-6 w-6 text-white md:h-8 md:w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        
      </div>
    </section>
  );
}
