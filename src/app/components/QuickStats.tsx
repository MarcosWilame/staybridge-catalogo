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
    <section className="py-16 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--yellow)]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-white/90">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
