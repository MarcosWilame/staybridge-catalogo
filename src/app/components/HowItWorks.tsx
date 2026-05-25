import { Search, MessageCircle, Key, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Pesquise',
    description: 'Navegue por nossas propriedades disponíveis em todas as regiões de Londres',
  },
  {
    icon: MessageCircle,
    number: '02',
    title: 'Entre em Contato',
    description: 'Fale conosco via WhatsApp em português para tirar dúvidas e agendar visitas',
  },
  {
    icon: CheckCircle,
    number: '03',
    title: 'Reserve',
    description: 'Escolha sua acomodação e complete o processo de reserva de forma segura',
  },
  {
    icon: Key,
    number: '04',
    title: 'Mude-se',
    description: 'Receba as chaves e aproveite seu novo lar em Londres com entrada imediata',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gradient-to-b from-[var(--gray-light)] to-white relative overflow-hidden">
      {/* Diagonal Background */}
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-tr from-[var(--green-dark)]/5 to-transparent transform skew-y-2 origin-bottom-left" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-[var(--yellow)] text-black px-4 py-2 rounded-full text-sm font-bold mb-4">
            COMO FUNCIONA
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--green-dark)] mb-4">
            4 Passos Simples para
            <br />
            <span className="text-[var(--yellow)]">Seu Novo Lar</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tornamos o processo de encontrar acomodação em Londres simples e seguro
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[var(--green-dark)] group"
              >
                {/* Number Badge */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[var(--yellow)] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-bold text-black">{step.number}</span>
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-white" />
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
