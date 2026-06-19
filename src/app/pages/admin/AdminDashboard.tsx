import { Eye, EyeOff, CalendarDays, MapPin } from 'lucide-react';
import type { Property } from '../../data/properties';
import { getAdminDashboardMetrics } from './propertyManagement';

export function AdminDashboard({ properties }: { properties: Property[] }) {
  const metrics = getAdminDashboardMetrics(properties);
  const maxRegionCount = Math.max(1, ...metrics.regions.map((region) => region.count));
  const cards = [
    { label: 'Visíveis no site', value: metrics.visible, icon: Eye },
    { label: 'Alugados', value: metrics.rented, icon: EyeOff },
    { label: 'Disponíveis agora', value: metrics.availableNow, icon: CalendarDays },
  ];

  return (
    <section className="mb-6 border-y border-[var(--surface-border)] bg-white py-5 shadow-[var(--surface-shadow)]">
      <div className="grid gap-px bg-[var(--surface-border)] sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex min-h-28 items-center gap-4 bg-white px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[var(--green-light)] text-[var(--green-dark)]">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
              <p className="mt-1 truncate text-2xl font-extrabold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-5 md:px-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[var(--green-dark)]">
          <MapPin className="h-4 w-4" />
          Imóveis visíveis por região
        </div>
        {metrics.regions.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {metrics.regions.map((region) => (
              <div key={region.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div>
                  <div className="mb-1 truncate text-xs font-bold text-gray-600">{region.name}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[var(--green-dark)]"
                      style={{ width: `${(region.count / maxRegionCount) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-extrabold text-gray-900">{region.count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-semibold text-gray-500">Nenhum imóvel visível.</p>
        )}
      </div>
    </section>
  );
}
