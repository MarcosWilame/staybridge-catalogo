import { useState } from 'react';
import { Search, MapPin, Home, PoundSterling } from 'lucide-react';

interface FilterState {
  region: string;
  type: string;
  priceRange: string;
  billsIncluded: boolean;
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterState) => void;
}

export function SearchFilter({ onFilterChange }: SearchFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    region: '',
    type: '',
    priceRange: '',
    billsIncluded: false,
  });

  const updateFilter = (key: keyof FilterState, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="relative z-20 mx-auto max-w-6xl rounded-2xl bg-white p-4 shadow-2xl md:-mt-20 md:p-6">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-xl font-bold text-[var(--green-dark)] md:text-2xl">
          <Search className="w-6 h-6" />
          Encontre sua acomodação ideal
        </h3>
        <p className="text-gray-600 mt-1">Filtre por região, tipo e preço</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {/* Region Filter */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Região
          </label>
          <select
            value={filters.region}
            onChange={(e) => updateFilter('region', e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-[var(--green-dark)] focus:outline-none"
          >
            <option value="">Todas as regiões</option>
            <option value="north">North London</option>
            <option value="south">South London</option>
            <option value="east">East London</option>
            <option value="west">West London</option>
            <option value="central">Central London</option>
          </select>
        </div>

        {/* Type Filter */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <Home className="w-4 h-4 inline mr-1" />
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-[var(--green-dark)] focus:outline-none"
          >
            <option value="">Todos os tipos</option>
            <option value="studio">Studio</option>
            <option value="ensuite">Ensuite</option>
            <option value="flat">Flat</option>
            <option value="single">Single Room</option>
            <option value="double">Double Room</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <PoundSterling className="w-4 h-4 inline mr-1" />
            Preço por semana
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => updateFilter('priceRange', e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 transition-colors focus:border-[var(--green-dark)] focus:outline-none"
          >
            <option value="">Qualquer preço</option>
            <option value="0-150">£0 - £150</option>
            <option value="150-250">£150 - £250</option>
            <option value="250-350">£250 - £350</option>
            <option value="350+">£350+</option>
          </select>
        </div>

        {/* Bills Included */}
        <div className="flex items-end">
          <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-[var(--gray-light)] px-4 py-3 transition-colors hover:bg-gray-200">
            <input
              type="checkbox"
              checked={filters.billsIncluded}
              onChange={(e) => updateFilter('billsIncluded', e.target.checked)}
              className="w-5 h-5 accent-[var(--green-dark)] rounded"
            />
            <span className="text-sm font-semibold text-gray-700">Bills Inclusas</span>
          </label>
        </div>
      </div>
    </div>
  );
}
