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
    title: 'Entrada Imediata',
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
    <section className="relative overflow-hidden bg-[#faf7f0] py-12 md:py-20">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:mb-16">
          <div className="mb-4 inline-block rounded-full bg-[#dbe7ff] px-4 py-2 text-xs font-bold text-[#2563eb] md:text-sm">
            POR QUE ESCOLHER A BEDMINSTER
          </div>
          <h2 className="mb-4 font-['Syne'] text-3xl font-extrabold leading-tight text-[#111] md:text-5xl">
            Facilitamos sua Vida
            <br />
            <span className="text-[#2563eb]">em Londres</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-[#6f6a62] md:text-xl">
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
                className="group relative overflow-hidden rounded-lg border border-black/5 bg-white p-5 shadow-[0_18px_36px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-[#2563eb]/30 hover:shadow-[0_26px_52px_rgba(17,17,17,0.10)] md:p-8"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#dbe7ff] text-[#2563eb] transition-transform duration-300 group-hover:scale-110 md:mb-6 md:h-16 md:w-16">
                  <Icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="mb-3 font-['Syne'] text-xl font-extrabold text-[#111]">
                  {benefit.title}
                </h3>
                <p className="leading-relaxed text-[#6f6a62]">
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
