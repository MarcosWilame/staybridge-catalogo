import { Search, MessageCircle, Key, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Pesquise',
    description: 'Filtre imóveis por região, tipo, valor e data de entrada.',
  },
  {
    icon: MessageCircle,
    number: '02',
    title: 'Fale com a equipe',
    description: 'Tire dúvidas em português e solicite uma visita ou vídeo.',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Reserve',
    description: 'Confirme os detalhes e avance com o processo de reserva.',
  },
  {
    icon: Key,
    number: '04',
    title: 'Mude-se',
    description: 'Receba as orientações para entrar no seu novo lar em Londres.',
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#f7f4df] py-12 md:py-20">
      {/* Diagonal Background */}
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-tr from-[var(--green-dark)]/5 to-transparent transform skew-y-2 origin-bottom-left" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:mb-16">
          <div className="mb-4 inline-block rounded-full bg-[var(--green-dark)] px-4 py-2 text-xs font-bold text-white md:text-sm">
            COMO FUNCIONA
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            4 Passos Simples para
            <br />
            <span className="text-[var(--green-medium)]">Seu novo lar</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-xl">
            Tornamos o processo de encontrar acomodação em Londres simples e seguro
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative rounded-xl border-2 border-[var(--green-dark)]/10 bg-[#eef3ec] p-5 shadow-md transition-all duration-300 hover:border-[var(--green-dark)] hover:shadow-xl md:rounded-2xl md:p-8"
              >
                {/* Number Badge */}
                <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--green-dark)]/20 bg-white shadow-lg transition-transform duration-300 group-hover:scale-110 md:-right-4 md:-top-4 md:h-16 md:w-16">
                  <span className="text-lg font-bold text-[var(--green-dark)] md:text-2xl">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] transition-transform duration-300 group-hover:scale-110 md:mb-6 md:h-16 md:w-16 md:rounded-2xl">
                  <Icon className="h-6 w-6 text-white md:h-8 md:w-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector Line (except last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[var(--green-dark)]/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
