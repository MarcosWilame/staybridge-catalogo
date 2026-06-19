import { MessageCircle, FileCheck, Zap, Shield, Users, CheckCircle } from 'lucide-react';

const benefits = [
  {
    icon: MessageCircle,
    title: 'Atendimento em Português',
    description: 'Equipe brasileira para ajudar você em cada etapa',
  },
  {
    icon: FileCheck,
    title: 'Bills Inclusas',
    description: 'Água, luz, gás e internet já inclusos no preço',
  },
  {
    icon: Zap,
    title: 'Disponível agora',
    description: 'Move-in rápido sem complicações burocráticas',
  },
  {
    icon: Shield,
    title: 'Contrato Seguro',
    description: 'Documentação completa e proteção garantida',
  },
  {
    icon: Users,
    title: 'Suporte Contínuo',
    description: 'Assistência durante toda sua estadia',
  },
  {
    icon: CheckCircle,
    title: 'Propriedades Verificadas',
    description: 'Todas as acomodações são inspecionadas',
  },
];

export function Benefits() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[var(--gray-light)] py-12 md:py-20">
      {/* Diagonal Background Element */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-[var(--green-dark)]/5 to-transparent transform -skew-y-3 origin-top-left" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:mb-16">
          <div className="mb-4 inline-block rounded-full bg-[var(--yellow)] px-4 py-2 text-xs font-bold text-black md:text-sm">
            POR QUE ESCOLHER A STAYBRIDGE
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            Facilitamos sua Vida
            <br />
            <span className="text-[var(--yellow)]">em Londres</span>
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
                className="group rounded-xl border-2 border-transparent bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-[var(--green-dark)] hover:shadow-2xl md:rounded-2xl md:p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] transition-transform duration-300 group-hover:scale-110 md:mb-6 md:h-16 md:w-16 md:rounded-2xl">
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
