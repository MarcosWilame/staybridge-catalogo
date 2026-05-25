import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
      const price = Number(p.price);
      return price >= min && price <= max;
    });
  }

  if (filters.billsIncluded) {
    filteredProperties = filteredProperties.filter((p) => p.billsIncluded);
  }

  if (filters.availableNow) {
    filteredProperties = filteredProperties.filter(
      (p) => p.available && p.moveInDate === 'Imediata'
    );
  }

  const FiltersPanel = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[var(--green-dark)] flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          Filtros
        </h3>

        {(filters.region ||
          filters.type ||
          filters.priceRange ||
          filters.billsIncluded ||
          filters.availableNow) && (
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

        <label className="flex gap-2 items-center">
          <input
            type="radio"
            checked={filters.region === ''}
            onChange={() => updateFilter('region', '')}
          />
          Todas
        </label>
      </div>

      {/* TYPE */}
      <div className="mt-6">
        <label className="font-bold text-sm">Tipo</label>

        {['studio', 'ensuite', 'flat'].map((type) => (
          <label key={type} className="flex gap-2 items-center">
            <input
              type="radio"
              checked={filters.type === type}
              onChange={() => updateFilter('type', type)}
            />
            {type}
          </label>
        ))}
      </div>

      {/* PRICE */}
      <div className="mt-6">
        <label className="font-bold text-sm">Preço</label>

        {[
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
    <div className="min-h-screen py-10 pt-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Propriedades</h1>
        <p className="mb-6">{filteredProperties.length} resultados</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="hidden lg:block">
            <FiltersPanel />
          </div>

          <div className="lg:col-span-3 grid md:grid-cols-2 gap-4">
            {filteredProperties.map((p) => (
              <PropertyCard key={p.id} property={p} />
            ))}
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
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden fixed bottom-6 right-6 bg-black text-white p-4 rounded-full"
      >
        <SlidersHorizontal />
      </button>

      {showMobileFilters && (
        <div className="fixed inset-0 bg-black/50 flex justify-end">
          <div className="bg-white w-80 p-4">
            <button onClick={() => setShowMobileFilters(false)}>
              <X />
            </button>
            <FiltersPanel />
          </div>
        </div>
      )}
    </div>
  );
}