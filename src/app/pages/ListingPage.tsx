import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../data/sheetProperties';
import { Building2, Home, KeyRound, MapPin, SlidersHorizontal, TrainFront, X } from 'lucide-react';
import { trackWhatsAppClick } from '../utils/analytics';
import { getPriceValue } from '../utils/price';

interface FilterState {
  region: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  availability: string;
}

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'available' | 'type';

const INITIAL_VISIBLE_COUNT = 12;

function LondonPropertiesLoading() {
  const loadingCards = [
    { label: 'Studio', width: 'w-3/4' },
    { label: 'Ensuite', width: 'w-2/3' },
    { label: 'Flat', width: 'w-4/5' },
    { label: 'Room', width: 'w-3/5' },
  ];

  return (
    <div className="rounded-lg border border-[var(--surface-border)] bg-white p-5 shadow-[var(--surface-shadow)] md:p-6">
      <div className="mb-6 overflow-hidden rounded-lg bg-[var(--green-dark)] p-5 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              <MapPin className="h-3.5 w-3.5" />
              Londres
            </div>
            <h2 className="text-xl font-bold md:text-2xl">
              Preparando as chaves das unidades
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/80">
              Estamos buscando os imoveis disponiveis e montando a vitrine.
            </p>
          </div>

          <div className="hidden shrink-0 items-end gap-1 md:flex">
            <div className="h-12 w-8 rounded-t-lg bg-white/20" />
            <div className="h-20 w-10 rounded-t-xl bg-[var(--yellow)]" />
            <div className="h-16 w-8 rounded-t-lg bg-white/25" />
          </div>
        </div>

        <div className="relative mt-6 h-10 overflow-hidden rounded-full bg-black/20">
          <div className="absolute left-4 right-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/30" />
          <div className="absolute left-8 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-[var(--yellow)] bg-white" />
          <div className="absolute right-8 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white/80 bg-[var(--green-dark)]" />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 animate-pulse items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--green-dark)] shadow-lg">
            <TrainFront className="h-4 w-4" />
            Northern Line
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {loadingCards.map((card) => (
          <div key={card.label} className="overflow-hidden rounded-lg border border-[var(--surface-border)] bg-[var(--gray-light)]">
            <div className="flex h-40 animate-pulse items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Building2 className="h-12 w-12 text-gray-300" />
            </div>
            <div className="space-y-3 p-4">
              <div className={`h-4 ${card.width} rounded-full bg-gray-200`} />
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                <Home className="h-4 w-4" />
                {card.label}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                <KeyRound className="h-4 w-4" />
                Confirmando disponibilidade
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListingPage() {
  const [searchParams] = useSearchParams();
  const { properties, isLoading, error } = useProperties();

  const [filters, setFilters] = useState<FilterState>({
    region: searchParams.get('region') || '',
    type: searchParams.get('type') || '',
    minPrice: 0,
    maxPrice: 1200,
    availability: '',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      region: searchParams.get('region') || '',
      type: searchParams.get('type') || '',
    }));
  }, [searchParams]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      type: '',
      minPrice: 0,
      maxPrice: 1200,
      availability: '',
    });
  };

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [filters, sortBy]);

  let filteredProperties = [...properties];

  if (filters.region) {
    filteredProperties = filteredProperties.filter((p) =>
      p.region.toLowerCase().includes(filters.region.toLowerCase())
    );
  }

  if (filters.type) {
    filteredProperties = filteredProperties.filter(
      (p) => p.category === filters.type
    );
  }

  filteredProperties = filteredProperties.filter((p) => {
    const price = getPriceValue(p.price);
    return price >= filters.minPrice && price <= filters.maxPrice;
  });

  if (filters.availability) {
    filteredProperties = filteredProperties.filter((p) => {
      const normalized = (p.moveInDate ?? '').trim().toLowerCase();
      if (filters.availability === 'immediate') {
        return normalized === 'now' || normalized === 'imediata';
      }
      if (filters.availability === 'soon') {
        return normalized === 'em breve';
      }
      if (filters.availability === 'arrange') {
        return normalized === 'a combinar';
      }
      return true;
    });
  }

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === 'price-asc') {
      return getPriceValue(a.price) - getPriceValue(b.price);
    }

    if (sortBy === 'price-desc') {
      return getPriceValue(b.price) - getPriceValue(a.price);
    }

    if (sortBy === 'available') {
      const aNow = ['now', 'imediata'].includes((a.moveInDate ?? '').trim().toLowerCase());
      const bNow = ['now', 'imediata'].includes((b.moveInDate ?? '').trim().toLowerCase());
      return Number(bNow) - Number(aNow);
    }

    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }

    return 0;
  });

  const visibleProperties = sortedProperties.slice(0, visibleCount);
  const hasMoreProperties = visibleCount < sortedProperties.length;

  const hasActiveFilters =
    filters.region ||
    filters.type ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1200 ||
    filters.availability;

  const activeFilterChips = [
    filters.region && {
      key: 'region' as const,
      label: `${filters.region.charAt(0).toUpperCase() + filters.region.slice(1)} London`,
      clear: () => updateFilter('region', ''),
    },
    filters.type && {
      key: 'type' as const,
      label: filters.type.charAt(0).toUpperCase() + filters.type.slice(1),
      clear: () => updateFilter('type', ''),
    },
    (filters.minPrice > 0 || filters.maxPrice < 1200) && {
      key: 'minPrice' as const,
      label: `€${filters.minPrice} - €${filters.maxPrice}`,
      clear: () => setFilters((prev) => ({ ...prev, minPrice: 0, maxPrice: 1200 })),
    },
    filters.availability && {
      key: 'availability' as const,
      label:
        filters.availability === 'immediate'
          ? 'Entrada imediata'
          : filters.availability === 'soon'
            ? 'Em breve'
            : 'A combinar',
      clear: () => updateFilter('availability', ''),
    },
  ].filter(Boolean) as Array<{ key: keyof FilterState; label: string; clear: () => void }>;

  const quickMobileFilters = [
    { key: 'studio', label: 'Studio', type: 'studio' },
    { key: 'ensuite', label: 'Ensuite', type: 'ensuite' },
    { key: 'flat', label: 'Flat', type: 'flat' },
  ];

  const typeOptions = [
    { value: 'studio', label: 'Studio' },
    { value: 'ensuite', label: 'Ensuite' },
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'flat', label: 'Flat' },
  ];

  const regionOptions = [
    { value: '', label: 'Todas' },
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
  ];
  const availabilityOptions = [
    { value: '', label: 'Todas' },
    { value: 'immediate', label: 'Entrada imediata' },
    { value: 'soon', label: 'Em breve' },
    { value: 'arrange', label: 'A combinar' },
  ];
  const minPercent = (filters.minPrice / 1200) * 100;
  const maxPercent = (filters.maxPrice / 1200) * 100;

  const FiltersPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`bg-[#f7faf7] ${
        isMobile
          ? 'h-full overflow-y-auto overscroll-contain px-5 pb-8 pt-5'
          : 'rounded-lg border border-[var(--surface-border)] p-5 shadow-[var(--surface-shadow)] lg:sticky lg:top-24'
      }`}
    >
      <div className={`flex items-center ${isMobile ? 'justify-end' : 'justify-between'} ${hasActiveFilters || !isMobile ? 'mb-6' : ''}`}>
        <h3 className={`${isMobile ? 'sr-only' : 'text-lg font-extrabold text-[var(--green-dark)] flex items-center gap-2'}`}>
          <SlidersHorizontal className="w-5 h-5" />
          Filtros
        </h3>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-[var(--green-dark)] font-semibold"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-extrabold text-gray-900">Faixa de preço</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-xs font-bold text-gray-600">De</span>
            <input
              type="number"
              min="0"
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  minPrice: Math.min(Number(event.target.value), prev.maxPrice),
                }))
              }
              className="w-full rounded-lg border border-[var(--surface-border)] bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[var(--green-dark)]"
            />
          </div>
          <div>
            <span className="mb-1 block text-xs font-bold text-gray-600">Até</span>
            <input
              type="number"
              min={filters.minPrice}
              max="2000"
              value={filters.maxPrice}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  maxPrice: Math.max(Number(event.target.value), prev.minPrice),
                }))
              }
              className="w-full rounded-lg border border-[var(--surface-border)] bg-white px-3 py-2 text-sm font-bold outline-none focus:border-[var(--green-dark)]"
            />
          </div>
        </div>
        <div
          className="price-range-control mt-3"
          style={
            {
              '--min-percent': `${minPercent}%`,
              '--max-percent': `${maxPercent}%`,
            } as React.CSSProperties
          }
        >
          <input
            type="range"
            min="0"
            max="1200"
            step="25"
            value={filters.minPrice}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                minPrice: Math.min(Number(event.target.value), prev.maxPrice),
              }))
            }
            aria-label="Preço mínimo"
          />
          <input
            type="range"
            min="0"
            max="1200"
            step="25"
            value={filters.maxPrice}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: Math.max(Number(event.target.value), prev.minPrice),
              }))
            }
            aria-label="Preço máximo"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-extrabold text-gray-900">Tipo</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateFilter('type', '')}
            className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
              filters.type === ''
                ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white'
                : 'border-[var(--surface-border)] bg-white text-gray-700'
            }`}
          >
            Todos
          </button>
          {typeOptions.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateFilter('type', filters.type === type.value ? '' : type.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                filters.type === type.value
                  ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white'
                  : 'border-[var(--surface-border)] bg-white text-gray-700'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-extrabold text-gray-900">Região</label>
        <div className="grid grid-cols-2 gap-2">
          {regionOptions.map((region) => (
            <button
              key={region.value || 'all'}
              type="button"
              onClick={() => updateFilter('region', region.value)}
              className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                filters.region === region.value
                  ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white'
                  : 'border-[var(--surface-border)] bg-white text-gray-700'
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-extrabold text-gray-900">Disponibilidade</label>
        <div className="rounded-lg border border-[var(--surface-border)] bg-white p-2">
          {availabilityOptions.map((option) => (
            <button
              key={option.value || 'all'}
              type="button"
              onClick={() => updateFilter('availability', option.value)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-bold transition ${
                filters.availability === option.value
                  ? 'bg-[var(--green-light)] text-[var(--green-dark)]'
                  : 'text-gray-700 hover:bg-[var(--gray-light)]'
              }`}
            >
              <span
                className={`h-3 w-3 rounded-full border ${
                  filters.availability === option.value
                    ? 'border-[var(--green-dark)] bg-[var(--green-dark)]'
                    : 'border-gray-300'
                }`}
              />
              {option.label}
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[image:var(--soft-gradient)] pb-28 pt-28 md:pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Propriedades</h1>
            <p>
              {isLoading ? 'Sincronizando propriedades...' : `${filteredProperties.length} resultados`}
            </p>
            {error && (
              <p className="mt-2 max-w-2xl rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowMobileFilters(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--green-dark)] px-4 py-3 text-sm font-bold text-white shadow-md lg:hidden"
            aria-label="Abrir filtros"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filtrar propriedades
          </button>
        </div>

        <div className="sticky top-20 z-30 -mx-4 mb-5 border-y border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {quickMobileFilters.map((filter) => {
              const isActive = filters.type === filter.type;

              return (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => updateFilter('type', isActive ? '' : filter.type)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                    isActive
                      ? 'bg-[var(--green-dark)] text-white shadow'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() =>
                updateFilter(
                  'availability',
                  filters.availability === 'immediate' ? '' : 'immediate'
                )
              }
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                filters.availability === 'immediate'
                  ? 'bg-[var(--green-dark)] text-white shadow'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Entrada imediata
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block">
            <FiltersPanel />
          </div>

          <div className="lg:col-span-3">
            <div className="min-w-0">
              <div className="sticky top-20 z-20 mb-4 rounded-lg border border-[var(--surface-border)] bg-white/95 p-4 shadow-[var(--surface-shadow)] backdrop-blur lg:top-24">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Resultados</div>
                    <div className="text-lg font-bold text-gray-900">
                      {isLoading
                        ? 'Buscando unidades...'
                        : `${sortedProperties.length} propriedade${sortedProperties.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Ordenar por
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[var(--green-dark)] focus:outline-none"
                    >
                      <option value="recommended">Recomendados</option>
                      <option value="price-asc">Menor preço</option>
                      <option value="price-desc">Maior preço</option>
                      <option value="available">Entrada imediata</option>
                      <option value="type">Tipo</option>
                    </select>
                  </label>
                </div>

                {activeFilterChips.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {activeFilterChips.map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={chip.clear}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--green-dark)]/10 px-3 py-1.5 text-sm font-semibold text-[var(--green-dark)]"
                      >
                        {chip.label}
                        <X className="h-3.5 w-3.5" />
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-sm font-semibold text-gray-600 hover:text-[var(--green-dark)]"
                    >
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>

              {isLoading ? (
                <LondonPropertiesLoading />
              ) : (
                <div className="grid content-start gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {visibleProperties.map((p) => (
                    <div key={p.id} className="h-full">
                      <PropertyCard property={p} />
                    </div>
                  ))}

                  {hasMoreProperties && (
                    <div className="md:col-span-2 xl:col-span-3">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + INITIAL_VISIBLE_COUNT)}
                        className="w-full rounded-xl border border-[var(--green-dark)] bg-white px-4 py-3 font-bold text-[var(--green-dark)] transition-colors hover:bg-[var(--green-dark)] hover:text-white"
                      >
                        Ver mais propriedades
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isLoading && sortedProperties.length === 0 && (
          <div className="mt-10 rounded-lg border border-[var(--surface-border)] bg-white p-8 text-center shadow-[var(--surface-shadow)]">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Nenhuma propriedade encontrada
            </h2>
            <p className="mb-5 text-gray-600">
              Ajuste os filtros ou fale conosco para encontrar uma opção ideal.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl bg-[var(--green-dark)] px-5 py-3 font-bold text-white"
              >
                Limpar filtros
              </button>
              <a
                href="https://wa.me/447000000000"
                target="_blank"
                rel="noreferrer"
                onClick={() => trackWhatsAppClick('listing_empty_state')}
                className="rounded-xl bg-[var(--whatsapp)] px-5 py-3 font-bold text-[var(--whatsapp-foreground)] transition-colors hover:bg-[var(--whatsapp-hover)]"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BUTTON */}
      <button
        type="button"
        onClick={() => setShowMobileFilters(true)}
        className="fixed bottom-40 right-4 z-50 rounded-full bg-[var(--green-dark)] p-3 text-white shadow-2xl lg:hidden"
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="h-6 w-6" />
      </button>

      {showMobileFilters && (
        <div
          className="fixed inset-0 z-[60] flex justify-end bg-black/50 lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileFilters(false);
          }}
        >
          <div className="flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
              <span className="text-lg font-bold text-[var(--green-dark)]">
                Filtros
              </span>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-700"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FiltersPanel isMobile />

            {/* Botão aplicar no mobile */}
            <div className="sticky bottom-0 border-t border-gray-100 bg-white p-4">
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-xl bg-[var(--green-dark)] py-3 font-bold text-white"
              >
                Ver {sortedProperties.length} resultado{sortedProperties.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
