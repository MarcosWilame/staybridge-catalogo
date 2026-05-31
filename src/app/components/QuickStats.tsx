import { Home, Users, CheckCircle, Clock } from 'lucide-react';

const stats = [
  {
    icon: Home,
    value: '100+',
    label: 'Propriedades Disponíveis',
    color: 'bg-[#dbe7ff] text-[#2563eb]',
  },
  {
    icon: Users,
    value: '500+',
    label: 'Brasileiros Atendidos',
    color: 'bg-[#fff1bf] text-[#9a6a12]',
  },
  {
    icon: CheckCircle,
    value: '98%',
    label: 'Taxa de Satisfação',
    color: 'bg-[#ccf3dc] text-[#14532d]',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Suporte em Português',
    color: 'bg-[#ece7dd] text-[#111]',
  },
];

export function QuickStats() {
  return (
    <section className="relative overflow-hidden bg-[#f4f1eb] py-12 md:py-16">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-lg border border-black/5 bg-white p-4 text-center shadow-[0_18px_36px_rgba(17,17,17,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(17,17,17,0.09)] md:p-6"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg ${stat.color} md:mb-4 md:h-16 md:w-16`}>
                  <Icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <div className="mb-1 font-['Syne'] text-2xl font-extrabold text-[#111] md:mb-2 md:text-4xl">{stat.value}</div>
                <div className="text-xs font-semibold leading-snug text-[#6f6a62] md:text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
