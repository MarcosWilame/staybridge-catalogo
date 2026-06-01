import { Home, Users, CheckCircle, Clock } from 'lucide-react';

const stats = [
  {
    icon: Home,
    value: '100+',
    label: 'Propriedades Disponíveis',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Users,
    value: '500+',
    label: 'Brasileiros Atendidos',
    color: 'from-purple-500 to-purple-600',
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
    color: 'from-orange-500 to-orange-600',
  },
];

export function QuickStats() {
  return (
    <section className="relative z-10 overflow-hidden bg-[var(--color1)] py-16 md:py-20">
      {/* Decorative elements */}
      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[var(--yellow)]/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-white/8 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-[image:linear-gradient(180deg,rgba(218,213,183,0)_0%,rgba(218,213,183,0.58)_58%,var(--color3)_100%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="home-stat-card rounded-lg p-4 text-center backdrop-blur-sm transition-all duration-300 md:p-6"
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
