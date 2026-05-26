import { Home, Users, CheckCircle, Clock } from 'lucide-react';

const stats = [
  {
    icon: Home,
    value: '100+',
    label: 'Propriedades Disponíveis',
    color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
  },
  {
    icon: Users,
    value: '500+',
    label: 'Brasileiros Atendidos',
    color: 'from-[var(--yellow-dark)] to-[var(--yellow)]',
  },
  {
    icon: CheckCircle,
    value: '98%',
    label: 'Taxa de Satisfação',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Clock,
    value: '24/7',
    label: 'Suporte em Português',
    color: 'from-blue-500 to-blue-600',
  },
];

export function QuickStats() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] py-10 md:py-16">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--yellow)]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="rounded-xl border border-white/20 bg-white/10 p-4 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 md:rounded-2xl md:p-6"
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} md:mb-4 md:h-16 md:w-16 md:rounded-2xl`}>
                  <Icon className="h-6 w-6 text-white md:h-8 md:w-8" />
                </div>
                <div className="mb-1 text-2xl font-bold text-white md:mb-2 md:text-4xl">{stat.value}</div>
                <div className="text-xs leading-snug text-white/90 md:text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
