import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../data/properties';
import { useProperties } from '../data/sheetProperties';
import { PropertyMap } from '../components/PropertyMap';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterState {
  region: string;
  type: string;
  priceRange: string;
  billsIncluded: boolean;
  availableNow: boolean;
}

export function ListingPage() {
  const [searchParams] = useSearchParams();
  const { properties, isLoading, source } = useProperties();

  const [filters, setFilters] = useState<FilterState>({
    region: searchParams.get('region') || '',
    type: searchParams.get('type') || '',
    priceRange: '',
    billsIncluded: false,
    availableNow: false,
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(
    properties[0]
  );

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      region: searchParams.get('region') || '',
      type: searchParams.get('type') || '',
    }));
  }, [searchParams]);

  useEffect(() => {
    setSelectedProperty((current) => current || properties[0]);
  }, [properties]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      type: '',
      priceRange: '',
      billsIncluded: false,
      availableNow: false,
    });
  };

  const parsePriceRange = (range: string) => {
    if (!range) return [0, Infinity] as const;

    if (range.includes('+')) {
      const min = Number(range.replace('+', ''));
      return [min, Infinity] as const;
    }

    const [minStr, maxStr] = range.split('-');
    return [Number(minStr), Number(maxStr)] as const;
  };

  const getPriceValue = (price: string) => {
    const match = price.match(/\d+(?:[.,]\d+)?/);
    if (!match) return 0;

    return Number(match[0].replace(',', '.'));
  };

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

  if (filters.priceRange) {
    const [min, max] = parsePriceRange(filters.priceRange);

    filteredProperties = filteredProperties.filter((p) => {
      const price = getPriceValue(p.price);
      return price >= min && price <= max;
    });
  }

  if (filters.billsIncluded) {
    filteredProperties = filteredProperties.filter((p) => p.billsIncluded);
  }

  if (filters.availableNow) {
    filteredProperties = filteredProperties.filter(
      (p) =>
        p.available &&
        ['imediata', 'now'].includes(p.moveInDate.toLowerCase())
    );
  }

  const visibleSelectedProperty = filteredProperties.find(
    (property) => property.id === selectedProperty?.id
  );

  const hasActiveFilters =
    filters.region ||
    filters.type ||
    filters.priceRange ||
    filters.billsIncluded ||
    filters.availableNow;

  const FiltersPanel = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`overflow-y-auto overscroll-contain bg-white ${
        isMobile
          ? 'h-full px-5 pb-8 pt-5'
        : 'max-h-[calc(100vh-7rem)] rounded-2xl p-6 shadow-lg lg:sticky lg:top-24'
      }`}
    >
      <div className={`flex items-center ${isMobile ? 'justify-end' : 'justify-between'} ${hasActiveFilters || !isMobile ? 'mb-6' : ''}`}>
        <h3 className={`${isMobile ? 'sr-only' : 'text-xl font-bold text-[var(--green-dark)] flex items-center gap-2'}`}>
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

      {/* REGION */}
      <div className="space-y-2">
        <label className="font-bold text-sm">Região</label>

        <label className="flex gap-2 items-center">
          <input
            type="radio"
            checked={filters.region === ''}
            onChange={() => updateFilter('region', '')}
          />
          Todas
        </label>

        {['north', 'south', 'east', 'west', 'central'].map((region) => (
          <label key={region} className="flex gap-2 items-center">
            <input
              type="radio"
              checked={filters.region === region}
              onChange={() => updateFilter('region', region)}
            />
            {region}
          </label>
        ))}

      </div>

      {/* TYPE */}
      <div className="mt-6">
        <label className="font-bold text-sm">Tipo</label>

        <label className="flex gap-2 items-center">
          <input
            type="radio"
            checked={filters.type === ''}
            onChange={() => updateFilter('type', '')}
          />
          Todos
        </label>

        {[
          { value: 'studio', label: 'Studio' },
          { value: 'ensuite', label: 'Ensuite' },
          { value: 'single', label: 'Single' },
          { value: 'double', label: 'Double' },
          { value: 'flat', label: 'Flat' },
        ].map((type) => (
          <label key={type.value} className="flex gap-2 items-center">
            <input
              type="radio"
              checked={filters.type === type.value}
              onChange={() => updateFilter('type', type.value)}
            />
            {type.label}
          </label>
        ))}

      </div>

      {/* PRICE */}
      <div className="mt-6">
        <label className="font-bold text-sm">Preço</label>

        {[
          { value: '', label: 'Todos' },
          { value: '0-150', label: '£0 - £150' },
          { value: '150-250', label: '£150 - £250' },
          { value: '250-350', label: '£250 - £350' },
          { value: '350+', label: '£350+' },
        ].map((range) => (
          <label key={range.value} className="flex gap-2 items-center">
            <input
              type="radio"
              checked={filters.priceRange === range.value}
              onChange={() => updateFilter('priceRange', range.value)}
            />
            {range.label}
          </label>
        ))}
      </div>

      {/* CHECKS */}
      <div className="mt-6 space-y-2">
        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={filters.billsIncluded}
            onChange={(e) =>
              updateFilter('billsIncluded', e.target.checked)
            }
          />
          Bills inclusas
        </label>

        <label className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={filters.availableNow}
            onChange={(e) =>
              updateFilter('availableNow', e.target.checked)
            }
          />
          Entrada imediata
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-28 md:pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Propriedades</h1>
            <p>
              {isLoading ? 'Sincronizando planilha...' : `${filteredProperties.length} resultados`}
              {source === 'fallback' && (
                <span className="ml-2 text-sm text-amber-700">
                  usando dados locais
                </span>
              )}
            </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block">
            <FiltersPanel />
          </div>

          <div className="lg:col-span-3 grid xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredProperties.map((p) => (
                <div
                  key={p.id}
                  onMouseEnter={() => setSelectedProperty(p)}
                  onFocus={() => setSelectedProperty(p)}
                >
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>

            <div className="xl:sticky xl:top-24 xl:self-start">
              <PropertyMap
                property={visibleSelectedProperty || filteredProperties[0]}
                properties={filteredProperties}
                onSelectProperty={setSelectedProperty}
              />
            </div>
          </div>
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center mt-10">
            Nenhum resultado encontrado
          </div>
        )}
      </div>

      {/* MOBILE BUTTON */}
      <button
        type="button"
        onClick={() => setShowMobileFilters(true)}
        className="fixed bottom-24 right-24 z-50 rounded-full bg-[var(--green-dark)] p-4 text-white shadow-2xl lg:hidden"
        aria-label="Abrir filtros"
      >
        <SlidersHorizontal className="h-6 w-6" />
      </button>

      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/50 lg:hidden">
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
          </div>
        </div>
      )}
    </div>
  );
}
