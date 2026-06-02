import { CheckCircle, FileCheck, MessageCircle, Shield, Zap } from 'lucide-react';

const trustItems = [
  {
    icon: MessageCircle,
    title: 'Atendimento em português',
    description: 'Equipe brasileira para tirar dúvidas e acompanhar sua reserva.',
  },
  {
    icon: FileCheck,
    title: 'Bills inclusas',
    description: 'Água, luz, gás e internet já entram nas unidades selecionadas.',
  },
  {
    icon: Shield,
    title: 'Contrato seguro',
    description: 'Processo claro para reservar com mais tranquilidade.',
  },
  {
    icon: Zap,
    title: 'Entrada rápida',
    description: 'Opções com disponibilidade imediata para quem precisa mudar logo.',
  },
];

export function HomeTrustStrip() {
  return (
    <section id="benefits" className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--yellow)] px-3 py-1.5 text-xs font-bold uppercase text-black">
              <CheckCircle className="h-4 w-4" />
              Por que reservar com a Staybridge
            </div>
            <h2 className="max-w-2xl text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-4xl">
              Menos incerteza para encontrar seu lugar em Londres
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-gray-600 md:text-base">
            Veja opções reais, compare com calma e fale com uma equipe que entende
            o processo de mudança para Londres.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 md:p-5"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--green-dark)] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-1.5 text-base font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
