import { useState } from 'react';
import { CalendarDays, MapPin } from 'lucide-react';
import type { Property } from '../../data/properties';
import { getAvailabilityAgenda, getPropertyStatusLabel } from './propertyManagement';

type AgendaWindow = 7 | 15 | 30;

export function AvailabilityAgenda({
  properties,
  onEdit,
}: {
  properties: Property[];
  onEdit: (property: Property) => void;
}) {
  const [windowDays, setWindowDays] = useState<AgendaWindow>(15);
  const items = getAvailabilityAgenda(properties, windowDays);

  return (
    <section className="mb-6 border-y border-[var(--surface-border)] bg-white px-5 py-5 shadow-[var(--surface-shadow)] md:px-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-[var(--green-dark)]">
            <CalendarDays className="h-5 w-5" />
            Agenda de disponibilidade
          </h2>
          <p className="mt-1 text-sm font-semibold text-gray-500">
            Próximos imóveis com data de entrada definida.
          </p>
        </div>
        <div className="inline-flex self-start rounded-lg border border-gray-200 bg-gray-100 p-1">
          {([7, 15, 30] as AgendaWindow[]).map((days) => (
            <button
              key={days}
              type="button"
              onClick={() => setWindowDays(days)}
              className={`rounded-md px-3 py-1.5 text-sm font-bold transition ${
                windowDays === days
                  ? 'bg-white text-[var(--green-dark)] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {days} dias
            </button>
          ))}
        </div>
      </div>

      {items.length ? (
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {items.map(({ property, date, daysUntil }) => (
            <button
              key={property.id}
              type="button"
              onClick={() => onEdit(property)}
              className="grid w-full gap-2 py-3 text-left transition hover:bg-[var(--gray-light)] sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center sm:px-2"
            >
              <div>
                <div className="text-sm font-extrabold text-[var(--green-dark)]">
                  {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                </div>
                <div className="text-xs font-bold text-gray-500">
                  {daysUntil === 0 ? 'Hoje' : `Em ${daysUntil} dias`}
                </div>
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-gray-900">
                  #{property.id} {property.title}
                </div>
                <div className="mt-1 flex items-center gap-1 truncate text-xs font-semibold text-gray-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {property.localArea || property.region} · {property.postcode}
                </div>
              </div>
              <span className="justify-self-start rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700 sm:justify-self-end">
                {getPropertyStatusLabel(property)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="border-y border-gray-100 py-8 text-center text-sm font-semibold text-gray-500">
          Nenhuma disponibilidade nos próximos {windowDays} dias.
        </div>
      )}
    </section>
  );
}
