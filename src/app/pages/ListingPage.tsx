import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { PropertyCard } from '../components/PropertyCard';
import { properties } from '../data/properties';
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
  const [filters, setFilters] = useState<FilterState>({
    region: searchParams.get('region') || '',
    type: searchParams.get('type') || '',
    priceRange: '',
    billsIncluded: false,
    availableNow: false,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Update filters when URL params change
  useEffect(() => {
    const region = searchParams.get('region') || '';
    const type = searchParams.get('type') || '';
    setFilters(prev => ({ ...prev, region, type }));
  }, [searchParams]);

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
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

  let filteredProperties = [...properties];

  if (filters.region) {
    filteredProperties = filteredProperties.filter((p) =>
      p.region.toLowerCase().includes(filters.region.toLowerCase())
    );
  }

  if (filters.type) {
    filteredProperties = filteredProperties.filter((p) => p.category === filters.type);
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split('-').map((v) => parseInt(v.replace('+', '')) || Infinity);
    filteredProperties = filteredProperties.filter((p) => {
      if (max === Infinity) return p.price >= min;
      return p.price >= min && p.price <= max;
    });
  }

  if (filters.billsIncluded) {
    filteredProperties = filteredProperties.filter((p) => p.billsIncluded);
  }

  if (filters.availableNow) {
    filteredProperties = filteredProperties.filter((p) => p.available && p.moveInDate === 'Imediata');
  }

  const FiltersPanel = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[var(--green-dark)] flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filtros
        </h3>
        {(filters.region || filters.type || filters.priceRange || filters.billsIncluded || filters.availableNow) && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-[var(--green-dark)] font-semibold transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Region Filter */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Região</label>
          <div className="space-y-2">
            {['north', 'south', 'east', 'west', 'central'].map((region) => (
              <label key={region} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="region"
                  value={region}
                  checked={filters.region === region}
                  onChange={(e) => updateFilter('region', e.target.value)}
                  className="w-4 h-4 accent-[var(--green-dark)]"
                />
                <span className="text-gray-700 capitalize">{region} London</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="region"
                value=""
                checked={filters.region === ''}
                onChange={(e) => updateFilter('region', e.target.value)}
                className="w-4 h-4 accent-[var(--green-dark)]"
              />
              <span className="text-gray-700">Todas as regiões</span>
            </label>
          </div>
        </div>

        {/* Type Filter */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">Tipo de Acomodação</label>
          <div className="space-y-2">
            {[
              { value: 'studio', label: 'Studio' },
              { value: 'ensuite', label: 'Ensuite' },
              { value: 'flat', label: 'Flat' },
              { value: 'single', label: 'Single Room' },
              { value: 'double', label: 'Double Room' },
            ].map((type) => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={filters.type === type.value}
                  onChange={(e) => updateFilter('type', e.target.value)}
                  className="w-4 h-4 accent-[var(--green-dark)]"
                />
                <span className="text-gray-700">{type.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="type"
                value=""
                checked={filters.type === ''}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-4 h-4 accent-[var(--green-dark)]"
              />
              <span className="text-gray-700">Todos os tipos</span>
            </label>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block text-sm font-bold text-gray-700 mb-3">Preço por Semana</label>
          <div className="space-y-2">
            {[
              { value: '0-150', label: '£0 - £150' },
              { value: '150-250', label: '£150 - £250' },
              { value: '250-350', label: '£250 - £350' },
              { value: '350+', label: '£350+' },
            ].map((range) => (
              <label key={range.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="radio"
                  name="price"
                  value={range.value}
                  checked={filters.priceRange === range.value}
                  onChange={(e) => updateFilter('priceRange', e.target.value)}
                  className="w-4 h-4 accent-[var(--green-dark)]"
                />
                <span className="text-gray-700">{range.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="radio"
                name="price"
                value=""
                checked={filters.priceRange === ''}
                onChange={(e) => updateFilter('priceRange', e.target.value)}
                className="w-4 h-4 accent-[var(--green-dark)]"
              />
              <span className="text-gray-700">Qualquer preço</span>
            </label>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="border-t border-gray-200 pt-6 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border-2 border-gray-200">
            <input
              type="checkbox"
              checked={filters.billsIncluded}
              onChange={(e) => updateFilter('billsIncluded', e.target.checked)}
              className="w-5 h-5 accent-[var(--green-dark)] rounded"
            />
            <span className="text-gray-700 font-semibold">Bills Inclusas</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border-2 border-gray-200">
            <input
              type="checkbox"
              checked={filters.availableNow}
              onChange={(e) => updateFilter('availableNow', e.target.checked)}
              className="w-5 h-5 accent-[var(--green-dark)] rounded"
            />
            <span className="text-gray-700 font-semibold">Entrada Imediata</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--gray-light)] py-8 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--green-dark)] mb-2">
            Todas as Propriedades
          </h1>
          <p className="text-gray-600 text-lg">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'propriedade encontrada' : 'propriedades encontradas'}
          </p>
        </div>

        {/* Mobile Filter Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden fixed bottom-20 right-4 z-40 bg-[var(--green-dark)] text-white p-4 rounded-full shadow-2xl hover:bg-[var(--green-medium)] transition-all duration-300 flex items-center gap-2"
        >
          <SlidersHorizontal className="w-6 h-6" />
          <span className="font-semibold">Filtros</span>
        </button>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
            <div
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[var(--green-dark)]">Filtros</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <FiltersPanel />
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block">
            <FiltersPanel />
          </div>

          {/* Properties Grid */}
          <div className="lg:col-span-3">
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <p className="text-xl text-gray-600 mb-4">
                  Nenhuma propriedade encontrada com os filtros selecionados.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-[var(--green-dark)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--green-medium)] transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
