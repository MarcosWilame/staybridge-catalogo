import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../data/properties';
import { useProperties } from '../data/sheetProperties';
import { PropertyMap } from '../components/PropertyMap';
import { getAvailabilityInfo } from '../utils/availability';
import {
  Banknote,
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  MapPin,
  Search,
  SlidersHorizontal,
  TrainFront,
  Users,
  X,
} from 'lucide-react';

interface FilterState {
  search: string;
  region: string;
  type: string;
  priceRange: string;
  availableNow: boolean;
  billsIncluded: boolean;
  people: string;
}

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'available' | 'type';

const INITIAL_VISIBLE_COUNT = 12;
const PRICE_STEP = 25;
const DEFAULT_MAX_PRICE = 700;

function LondonPropertiesLoading() {
  const loadingCards = [
    { label: 'Studio', width: 'w-3/4' },
    { label: 'Ensuite', width: 'w-2/3' },
    { label: 'Flat', width: 'w-4/5' },
    { label: 'Room', width: 'w-3/5' },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6 overflow-hidden rounded-2xl bg-[var(--green-dark)] p-5 text-white">
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
          <div key={card.label} className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, isLoading, error } = useProperties();

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    region: searchParams.get('region') || '',
    type: searchParams.get('type') || '',
    priceRange: searchParams.get('price') || '',
    availableNow: searchParams.get('availableNow') === '1',
    billsIncluded: searchParams.get('billsIncluded') === '1',
    people: searchParams.get('people') || '',
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(
    properties[0]
  );

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      region: searchParams.get('region') || '',
      type: searchParams.get('type') || '',
      priceRange: searchParams.get('price') || '',
      availableNow: searchParams.get('availableNow') === '1',
      billsIncluded: searchParams.get('billsIncluded') === '1',
      people: searchParams.get('people') || '',
    }));
  }, [searchParams]);

  useEffect(() => {
    setSelectedProperty((current) => current || properties[0]);
  }, [properties]);

  const syncSearchParams = (nextFilters: FilterState) => {
    const nextParams = new URLSearchParams();

    if (nextFilters.search.trim()) nextParams.set('search', nextFilters.search.trim());
    if (nextFilters.region) nextParams.set('region', nextFilters.region);
    if (nextFilters.type) nextParams.set('type', nextFilters.type);
    if (nextFilters.priceRange) nextParams.set('price', nextFilters.priceRange);
    if (nextFilters.availableNow) nextParams.set('availableNow', '1');
    if (nextFilters.billsIncluded) nextParams.set('billsIncluded', '1');
    if (nextFilters.people) nextParams.set('people', nextFilters.people);

    setSearchParams(nextParams, { replace: true });
  };

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
    options: { syncUrl?: boolean } = {}
  ) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      if (options.syncUrl !== false) {
        syncSearchParams(next);
      }
      return next;
    });
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      region: '',
      type: '',
      priceRange: '',
      availableNow: false,
      billsIncluded: false,
      people: '',
    };

    setFilters(emptyFilters);
    syncSearchParams(emptyFilters);
  };

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [filters, sortBy]);

  const parsePriceRange = (range: string) => {
    if (!range) return [0, Infinity] as const;
    if (/^\d+$/.test(range)) {
      return [0, Number(range)] as const;
    }
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

  const availableMaxPrice = Math.max(
    DEFAULT_MAX_PRICE,
    Math.ceil(Math.max(0, ...properties.map((p) => getPriceValue(p.price))) / PRICE_STEP) *
      PRICE_STEP
  );

  const selectedMaxPrice = /^\d+$/.test(filters.priceRange)
    ? Math.min(Number(filters.priceRange), availableMaxPrice)
    : availableMaxPrice;

  const getPriceRangeValue = (value: number | string) => {
    const nextValue = Number(value);
    return nextValue >= availableMaxPrice ? '' : String(nextValue);
  };

  const commitMaxPrice = (value: number | string) => {
    const next = { ...filters, priceRange: getPriceRangeValue(value) };
    setFilters(next);
    syncSearchParams(next);
  };

  const getSliderPriceFromPointer = (clientX: number, track: HTMLDivElement) => {
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const rawValue = ratio * availableMaxPrice;
    return Math.max(PRICE_STEP, Math.round(rawValue / PRICE_STEP) * PRICE_STEP);
  };

  const getPriceFilterLabel = (range: string) => {
    if (/^\d+$/.test(range)) return `Ate £${range}`;
    if (range === '350+') return '£350+';
    return `£${range.replace('-', ' - £')}`;
  };

  const matchesSearch = (property: Property, query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return [
      property.title,
      property.region,
      property.localArea,
      property.postcode,
      property.address,
      property.type,
      property.description,
      ...property.nearbyStations,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalizedQuery));
  };

  let filteredProperties = [...properties];

  if (filters.search.trim()) {
    filteredProperties = filteredProperties.filter((p) => matchesSearch(p, filters.search));
  }

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

  if (filters.availableNow) {
    filteredProperties = filteredProperties.filter((p) => {
      return getAvailabilityInfo(p.moveInDate).isNow;
    });
  }

  if (filters.billsIncluded) {
    filteredProperties = filteredProperties.filter((p) => p.billsIncluded);
  }

  if (filters.people) {
    filteredProperties = filteredProperties.filter((p) => {
      const capacity = Number(p.people || 0);
      if (filters.people === '4+') return capacity >= 4;
      return capacity >= Number(filters.people);
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
      const aNow = getAvailabilityInfo(a.moveInDate).isNow;
      const bNow = getAvailabilityInfo(b.moveInDate).isNow;
      return Number(bNow) - Number(aNow);
    }

    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }

    return 0;
  });

  const visibleProperties = sortedProperties.slice(0, visibleCount);
  const hasMoreProperties = visibleCount < sortedProperties.length;

  const visibleSelectedProperty = sortedProperties.find(
    (property) => property.id === selectedProperty?.id
  );

  const hasActiveFilters =
    filters.search ||
    filters.region ||
    filters.type ||
    filters.priceRange ||
    filters.availableNow ||
    filters.billsIncluded ||
    filters.people;

  const activeFilterChips = [
    filters.search && {
      key: 'search' as const,
      label: filters.search,
      clear: () => updateFilter('search', ''),
    },
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
    filters.priceRange && {
      key: 'priceRange' as const,
      label: getPriceFilterLabel(filters.priceRange),
      clear: () => updateFilter('priceRange', ''),
    },
    filters.availableNow && {
      key: 'availableNow' as const,
      label: 'Entrada imediata',
      clear: () => updateFilter('availableNow', false),
    },
    filters.billsIncluded && {
      key: 'billsIncluded' as const,
      label: 'Bills inclusas',
      clear: () => updateFilter('billsIncluded', false),
    },
    filters.people && {
      key: 'people' as const,
      label: filters.people === '4+' ? '4+ pessoas' : `${filters.people}+ pessoa${filters.people === '1' ? '' : 's'}`,
      clear: () => updateFilter('people', ''),
    },
  ].filter(Boolean) as Array<{ key: keyof FilterState; label: string; clear: () => void }>;

  const quickMobileFilters = [
    { key: 'studio', label: 'Studio', type: 'studio' },
    { key: 'ensuite', label: 'Ensuite', type: 'ensuite' },
    { key: 'flat', label: 'Flat', type: 'flat' },
  ];

  const regionOptions = [
    { value: '', label: 'Todas' },
    { value: 'north', label: 'North' },
    { value: 'south', label: 'South' },
    { value: 'east', label: 'East' },
    { value: 'west', label: 'West' },
  ];

  const typeOptions = [
    { value: '', label: 'Todos' },
    { value: 'studio', label: 'Studio' },
    { value: 'ensuite', label: 'Ensuite' },
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'flat', label: 'Flat' },
  ];

  const peopleOptions = [
    { value: '', label: 'Qualquer' },
    { value: '1', label: '1 pessoa' },
    { value: '2', label: '2 pessoas' },
    { value: '3', label: '3 pessoas' },
    { value: '4+', label: '4+ pessoas' },
  ];

  const mobileFilterButtonClass = (isActive: boolean) =>
    `rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
      isActive
        ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white shadow-sm'
        : 'border-gray-200 bg-gray-50 text-gray-700'
    }`;

  const PriceSliderFilter = ({ isMobile = false }: { isMobile?: boolean }) => {
    const [draftPrice, setDraftPrice] = useState(selectedMaxPrice);
    const isDraggingRef = useRef(false);
    const draftProgress = (draftPrice / availableMaxPrice) * 100;
    const hasPriceFilter = draftPrice < availableMaxPrice;

    useEffect(() => {
      if (!isDraggingRef.current) {
        setDraftPrice(selectedMaxPrice);
      }
    }, [selectedMaxPrice]);

    const setDraftFromPointer = (clientX: number, track: HTMLDivElement) => {
      const nextPrice = getSliderPriceFromPointer(clientX, track);
      setDraftPrice(nextPrice);
      return nextPrice;
    };

    const commitDraft = (value: number) => {
      isDraggingRef.current = false;
      setDraftPrice(value);
      commitMaxPrice(value);
    };

    return (
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor={`price-${isMobile ? 'mobile' : 'desktop'}`}
            className="flex items-center gap-2 font-bold text-sm"
          >
            <Banknote className="h-4 w-4" />
            Valor
          </label>
          <span className="shrink-0 rounded-full bg-[var(--green-dark)]/10 px-3 py-1 text-sm font-bold text-[var(--green-dark)]">
            {hasPriceFilter ? `Ate £${draftPrice}` : 'Qualquer'}
          </span>
        </div>

        <div
          id={`price-${isMobile ? 'mobile' : 'desktop'}`}
          role="slider"
          tabIndex={0}
          aria-valuemin={PRICE_STEP}
          aria-valuemax={availableMaxPrice}
          aria-valuenow={draftPrice}
          aria-valuetext={hasPriceFilter ? `Ate £${draftPrice} por semana` : 'Qualquer valor'}
          className="group relative h-10 cursor-grab touch-none select-none active:cursor-grabbing"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            isDraggingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            setDraftFromPointer(event.clientX, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            setDraftFromPointer(event.clientX, event.currentTarget);
          }}
          onPointerUp={(event) => {
            const nextPrice = setDraftFromPointer(event.clientX, event.currentTarget);
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            commitDraft(nextPrice);
          }}
          onPointerCancel={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
            commitDraft(draftPrice);
          }}
          onKeyDown={(event) => {
            const nextValue =
              event.key === 'ArrowRight' || event.key === 'ArrowUp'
                ? draftPrice + PRICE_STEP
                : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                  ? draftPrice - PRICE_STEP
                  : event.key === 'Home'
                    ? PRICE_STEP
                    : event.key === 'End'
                      ? availableMaxPrice
                      : draftPrice;

            if (nextValue === draftPrice && !['Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const clampedValue = Math.min(availableMaxPrice, Math.max(PRICE_STEP, nextValue));
            commitDraft(clampedValue);
          }}
        >
          <div className="absolute left-0 right-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gray-200" />
          <div
            className="absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-[var(--green-dark)]"
            style={{ width: `${draftProgress}%` }}
          />
          <div
            className="absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-[var(--green-dark)] shadow-md ring-1 ring-[var(--green-dark)] transition-transform group-active:scale-110"
            style={{ left: `${draftProgress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
          <span>£{PRICE_STEP}</span>
          <span>£{availableMaxPrice}+</span>
        </div>

        {filters.priceRange && (
          <button
            type="button"
            onClick={() => updateFilter('priceRange', '')}
            className="text-sm font-semibold text-gray-600 hover:text-[var(--green-dark)]"
          >
            Limpar valor
          </button>
        )}
      </div>
    );
  };

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

      <PriceSliderFilter isMobile={isMobile} />

      <div className="mb-6">
        <label
          htmlFor={`search-${isMobile ? 'mobile' : 'desktop'}`}
          className="mb-2 flex items-center gap-2 font-bold text-sm"
        >
          <Search className="h-4 w-4" />
          Buscar
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id={`search-${isMobile ? 'mobile' : 'desktop'}`}
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter('search', event.target.value)}
            placeholder="Bairro, postcode ou estacao"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[var(--green-dark)] focus:bg-white"
          />
        </div>
      </div>

      {/* REGION */}
      <div className="space-y-2">
        <label className="font-bold text-sm">Região</label>

        {isMobile ? (
          <div className="grid grid-cols-2 gap-2">
            {regionOptions.map((region) => (
              <button
                key={region.value || 'all'}
                type="button"
                onClick={() => updateFilter('region', region.value)}
                className={mobileFilterButtonClass(filters.region === region.value)}
              >
                {region.value ? `${region.label} London` : region.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            {regionOptions.map((region) => (
              <label key={region.value || 'all'} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name={`region-${isMobile ? 'mobile' : 'desktop'}`}
                  checked={filters.region === region.value}
                  onChange={() => updateFilter('region', region.value)}
                />
                {region.value ? `${region.label} London` : region.label}
              </label>
            ))}
          </>
        )}
      </div>

      {/* TYPE */}
      <div className="mt-6 space-y-2">
        <label className="font-bold text-sm">Tipo</label>

        {isMobile ? (
          <div className="grid grid-cols-2 gap-2">
            {typeOptions.map((type) => (
              <button
                key={type.value || 'all'}
                type="button"
                onClick={() => updateFilter('type', type.value)}
                className={mobileFilterButtonClass(filters.type === type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            {typeOptions.map((type) => (
              <label key={type.value || 'all'} className="flex gap-2 items-center cursor-pointer">
                <input
                  type="radio"
                  name={`type-${isMobile ? 'mobile' : 'desktop'}`}
                  checked={filters.type === type.value}
                  onChange={() => updateFilter('type', type.value)}
                />
                {type.label}
              </label>
            ))}
          </>
        )}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Users className="h-4 w-4" />
          Capacidade
        </div>

        {isMobile ? (
          <div className="grid grid-cols-2 gap-2">
            {peopleOptions.map((option) => (
              <button
                key={option.value || 'any'}
                type="button"
                onClick={() => updateFilter('people', option.value)}
                className={mobileFilterButtonClass(filters.people === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <select
            value={filters.people}
            onChange={(event) => updateFilter('people', event.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold outline-none transition focus:border-[var(--green-dark)] focus:bg-white"
          >
            {peopleOptions.map((option) => (
              <option key={option.value || 'any'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ENTRADA IMEDIATA */}
      <div className="mt-6 space-y-3">
        {isMobile ? (
          <>
            <button
              type="button"
              onClick={() => updateFilter('availableNow', !filters.availableNow)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-bold transition ${
                filters.availableNow
                  ? 'border-[var(--yellow)] bg-[var(--yellow)] text-black shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              Entrada imediata
              <CheckCircle2 className={`h-5 w-5 ${filters.availableNow ? 'text-black' : 'text-gray-300'}`} />
            </button>

            <button
              type="button"
              onClick={() => updateFilter('billsIncluded', !filters.billsIncluded)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-bold transition ${
                filters.billsIncluded
                  ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              Bills inclusas
              <Banknote className={`h-5 w-5 ${filters.billsIncluded ? 'text-white' : 'text-gray-300'}`} />
            </button>
          </>
        ) : (
          <>
            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availableNow}
                onChange={(e) => updateFilter('availableNow', e.target.checked)}
              />
              Entrada imediata
            </label>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.billsIncluded}
                onChange={(e) => updateFilter('billsIncluded', e.target.checked)}
              />
              Bills inclusas
            </label>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28 pt-28 md:pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-5">
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
        </div>

        <div className="sticky top-20 z-30 -mx-4 mb-5 border-y border-gray-100 bg-white/95 px-4 py-3 shadow-sm backdrop-blur lg:hidden">
          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <button
              type="button"
              onClick={() => setShowMobileFilters(true)}
              className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl bg-[var(--green-dark)] px-4 py-3 text-sm font-bold text-white shadow-sm"
              aria-label="Abrir filtros"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Filtros</span>
              {activeFilterChips.length > 0 && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[var(--green-dark)]">
                  {activeFilterChips.length}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="max-w-[10rem] rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-700 shadow-sm focus:border-[var(--green-dark)] focus:outline-none"
              aria-label="Ordenar propriedades"
            >
              <option value="recommended">Recomendados</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="available">Entrada imediata</option>
              <option value="type">Tipo</option>
            </select>
          </div>

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
              onClick={() => updateFilter('availableNow', !filters.availableNow)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                filters.availableNow
                  ? 'bg-[var(--yellow)] text-black shadow'
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

          <div
            ref={listRef}
            className={`lg:col-span-3 grid gap-6 ${
              isLoading ? '' : 'xl:grid-cols-[minmax(0,1fr)_360px]'
            }`}
          >
            <div className="min-w-0">
              <div className="mb-4 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-sm backdrop-blur lg:sticky lg:top-24 lg:z-20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-500">Resultados</div>
                    <div className="text-lg font-bold text-gray-900">
                      {isLoading
                        ? 'Buscando unidades...'
                        : `${sortedProperties.length} propriedade${sortedProperties.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>

                  <label className="hidden items-center gap-2 text-sm font-semibold text-gray-700 lg:flex">
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
                <div className="grid content-start gap-4 md:grid-cols-2 lg:max-h-[calc(100vh-17rem)] lg:overflow-y-auto lg:pr-1">
                  {visibleProperties.map((p) => (
                    <div
                      key={p.id}
                      onMouseEnter={() => setSelectedProperty(p)}
                      onFocus={() => setSelectedProperty(p)}
                    >
                      <PropertyCard property={p} />
                    </div>
                  ))}

                  {hasMoreProperties && (
                    <div className="md:col-span-2">
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

            {!isLoading && (
              <div className="xl:sticky xl:top-24 xl:self-start">
                <PropertyMap
                  property={visibleSelectedProperty || sortedProperties[0]}
                  properties={sortedProperties}
                  onSelectProperty={setSelectedProperty}
                />
              </div>
            )}
          </div>
        </div>

        {!isLoading && sortedProperties.length === 0 && (
          <div className="mt-10 rounded-2xl bg-white p-8 text-center shadow-sm">
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
                className="rounded-xl border border-[var(--green-dark)] px-5 py-3 font-bold text-[var(--green-dark)]"
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

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
