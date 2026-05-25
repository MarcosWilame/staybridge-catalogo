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
    <section className="py-20 bg-gradient-to-b from-white to-[var(--gray-light)] relative overflow-hidden">
      {/* Diagonal Background Element */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-[var(--green-dark)]/5 to-transparent transform -skew-y-3 origin-top-left" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--yellow)] text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
            POR QUE ESCOLHER A STAYBRIDGE
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--green-dark)] mb-4">
            Facilitamos sua Vida
            <br />
            <span className="text-[var(--yellow)]">em Londres</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mais de 500 brasileiros já encontraram seu lar conosco
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[var(--green-dark)] hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
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
        <div className="mt-16 bg-[var(--green-dark)] rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[var(--yellow)] mb-2">500+</div>
              <div className="text-white text-lg">Brasileiros Atendidos</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[var(--yellow)] mb-2">100+</div>
              <div className="text-white text-lg">Propriedades Disponíveis</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[var(--yellow)] mb-2">24/7</div>
              <div className="text-white text-lg">Suporte em Português</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
