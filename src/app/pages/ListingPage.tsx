import { Fragment, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { Property } from '../data/properties';
import { useProperties } from '../data/sheetProperties';
import { PropertyMap } from '../components/PropertyMap';
import { getAvailabilityInfo } from '../utils/availability';
import { WHATSAPP_URL } from '../config/contact';
import { SEO } from '../components/SEO';
import { LeadCaptureModal } from '../components/LeadCaptureModal';
import type { LeadIntent } from '../utils/leadCapture';
import { trackEvent } from '../utils/analytics';
import { getAbsoluteUrl, SITE_NAME } from '../config/site';
import { getPropertyImageAlt } from '../utils/imageAlt';
import { formatPropertyType } from '../utils/propertyType';
import {
  MAX_COMPARE_ITEMS,
  getCompareProperties,
  getLowestComparePrice,
  toggleCompareId,
} from '../utils/compare';
import {
  Banknote,
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  Scale,
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

const filterLabels: Record<keyof FilterState, string> = {
  search: 'busca',
  region: 'regiao',
  type: 'tipo',
  priceRange: 'valor',
  availableNow: 'Disponível agora',
  billsIncluded: 'contas inclusas',
  people: 'capacidade',
};

function LondonPropertiesLoading() {
  const loadingCards = [
    { label: 'Estúdio', width: 'w-3/4' },
    { label: 'Suíte', width: 'w-2/3' },
    { label: 'Apartamento', width: 'w-4/5' },
    { label: 'Quarto', width: 'w-3/5' },
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
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareMessage, setCompareMessage] = useState('');
  const [leadIntent, setLeadIntent] = useState<LeadIntent>('whatsapp');
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const mobileFilterCloseRef = useRef<HTMLButtonElement>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | undefined>(
    properties[0]
  );

  const listRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    if (!showMobileFilters) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowMobileFilters(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => mobileFilterCloseRef.current?.focus());

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [showMobileFilters]);

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

  useEffect(() => {
    const searchParamValue = searchParams.get('search') || '';
    const nextSearch = filters.search.trim();

    if (searchParamValue === nextSearch) return;

    const timeout = window.setTimeout(() => {
      syncSearchParams(filtersRef.current);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [filters.search, searchParams]);

  const getTrackingFilters = (nextFilters = filters) => ({
    search_term: nextFilters.search.trim() || undefined,
    region: nextFilters.region || undefined,
    property_type: nextFilters.type || undefined,
    price_range: nextFilters.priceRange || undefined,
    available_now: nextFilters.availableNow || undefined,
    bills_included: nextFilters.billsIncluded || undefined,
    people: nextFilters.people || undefined,
  });

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
      if (key !== 'search') {
        trackEvent('property_filter_change', {
          filter: filterLabels[key],
          filter_key: String(key),
          value: String(value),
          ...getTrackingFilters(next),
        });
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
    trackEvent('property_filters_clear');
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
    trackEvent('property_filter_change', {
      filter: filterLabels.priceRange,
      filter_key: 'priceRange',
      value: next.priceRange || 'any',
      ...getTrackingFilters(next),
    });
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
      return getAvailabilityInfo(p.moveInDate, p.available).isNow;
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
      const aNow = getAvailabilityInfo(a.moveInDate, a.available).isNow;
      const bNow = getAvailabilityInfo(b.moveInDate, b.available).isNow;
      return Number(bNow) - Number(aNow);
    }

    if (sortBy === 'type') {
      return a.type.localeCompare(b.type);
    }

    return 0;
  });

  const visibleProperties = sortedProperties.slice(0, visibleCount);
  const hasMoreProperties = visibleCount < sortedProperties.length;
  const compareProperties = getCompareProperties(properties, compareIds);

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
      label: 'Disponível agora',
      clear: () => updateFilter('availableNow', false),
    },
    filters.billsIncluded && {
      key: 'billsIncluded' as const,
      label: 'Contas inclusas',
      clear: () => updateFilter('billsIncluded', false),
    },
    filters.people && {
      key: 'people' as const,
      label: filters.people === '4+' ? '4+ pessoas' : `${filters.people}+ pessoa${filters.people === '1' ? '' : 's'}`,
      clear: () => updateFilter('people', ''),
    },
  ].filter(Boolean) as Array<{ key: keyof FilterState; label: string; clear: () => void }>;

  const quickMobileFilters = [
    { key: 'studio', label: 'Estúdio', type: 'studio' },
    { key: 'ensuite', label: 'Suíte', type: 'ensuite' },
    { key: 'flat', label: 'Apartamento', type: 'flat' },
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
    { value: 'studio', label: 'Estúdio' },
    { value: 'ensuite', label: 'Suíte' },
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'flat', label: 'Apartamento' },
  ];

  const activeFilterSummary = activeFilterChips
    .map((chip) => chip.label)
    .join(', ');

  const listingTitle = filters.type
    ? `${typeOptions.find((type) => type.value === filters.type)?.label || filters.type} em Londres`
    : filters.region
      ? `Acomodacoes em ${filters.region.charAt(0).toUpperCase() + filters.region.slice(1)} London`
      : filters.availableNow
        ? 'Acomodacoes disponíveis agora em Londres'
        : 'Imoveis e quartos em Londres';

  const listingDescription = activeFilterSummary
    ? `Veja ${sortedProperties.length} opções em Londres para ${activeFilterSummary}. Estúdios, suítes, quartos e apartamentos com atendimento em português.`
    : 'Compare estúdios, suítes, quartos e apartamentos em Londres com filtros por região, valor, capacidade, contas inclusas e disponibilidade.';

  const listingJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${getAbsoluteUrl('/properties')}#collection`,
      name: `${listingTitle} | ${SITE_NAME}`,
      description: listingDescription,
      url: getAbsoluteUrl('/properties'),
      inLanguage: ['pt-BR', 'en-GB'],
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: sortedProperties.length,
        itemListElement: visibleProperties.slice(0, 12).map((property, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'RealEstateListing',
            name: property.title,
            description: property.description,
            image: property.image,
            url: getAbsoluteUrl(`/property/${property.id}`),
            mainEntity: {
              '@type': ['flat', 'studio', 'apartment'].includes(property.category.toLowerCase())
                ? ['Residence', 'Apartment']
                : 'Residence',
              name: property.title,
              address: {
                '@type': 'PostalAddress',
                addressLocality: property.localArea || property.region,
                postalCode: property.postcode,
                addressCountry: 'GB',
              },
            },
          },
        })),
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: getAbsoluteUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Imóveis em Londres',
          item: getAbsoluteUrl('/properties'),
        },
      ],
    },
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

  const toggleCompareProperty = (property: Property) => {
    setCompareIds((currentIds) => {
      const result = toggleCompareId(currentIds, property.id);

      if (result.status === 'removed') {
        if (result.ids.length === 0) setIsCompareOpen(false);
        trackEvent('compare_remove', {
          property_id: property.id,
          count: result.ids.length,
        });
        return result.ids;
      }

      if (result.status === 'limit') {
        setCompareMessage(`Compare ate ${MAX_COMPARE_ITEMS} imoveis por vez`);
        window.setTimeout(() => setCompareMessage(''), 2200);
        trackEvent('compare_limit_reached', {
          property_id: property.id,
          count: result.ids.length,
        });
        return result.ids;
      }

      setCompareMessage('');
      setIsCompareOpen(true);
      trackEvent('compare_add', {
        property_id: property.id,
        property_type: property.type,
        region: property.region,
        count: result.ids.length,
      });
      return result.ids;
    });
  };

  const clearCompare = () => {
    trackEvent('compare_clear', {
      count: compareIds.length,
    });
    setCompareIds([]);
    setIsCompareOpen(false);
    setCompareMessage('');
  };

  useEffect(() => {
    const searchTerm = filters.search.trim();
    if (!searchTerm) return;

    const timeout = window.setTimeout(() => {
      trackEvent('search_submit', {
        ...getTrackingFilters(),
        results_count: sortedProperties.length,
      });
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [filters.search, sortedProperties.length]);

  useEffect(() => {
    if (isLoading || sortedProperties.length > 0 || !hasActiveFilters) return;

    trackEvent('filter_results_empty', {
      results_count: 0,
      ...getTrackingFilters(),
    });
  }, [hasActiveFilters, isLoading, sortedProperties.length]);

  useEffect(() => {
    if (isLoading || visibleProperties.length === 0) return;

    trackEvent('property_impression', {
      results_count: sortedProperties.length,
      visible_count: visibleProperties.length,
      property_ids: visibleProperties.map((property) => property.id).join(','),
      sort_by: sortBy,
      ...getTrackingFilters(),
    });
  }, [
    filters.availableNow,
    filters.billsIncluded,
    filters.people,
    filters.priceRange,
    filters.region,
    filters.search,
    filters.type,
    isLoading,
    sortBy,
    sortedProperties.length,
    visibleCount,
  ]);

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
          <div
            id={`price-label-${isMobile ? 'mobile' : 'desktop'}`}
            className="flex items-center gap-2 font-bold text-sm"
          >
            <Banknote className="h-4 w-4" />
            Valor
          </div>
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
          aria-labelledby={`price-label-${isMobile ? 'mobile' : 'desktop'}`}
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

  const renderFiltersPanel = (isMobile = false) => (
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
            inputMode="search"
            autoComplete="off"
            value={filters.search}
            onChange={(event) =>
              updateFilter('search', event.target.value, { syncUrl: false })
            }
            placeholder="Bairro, postcode ou estacao"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-[var(--green-dark)] focus:bg-white"
          />
        </div>
      </div>

      <PriceSliderFilter isMobile={isMobile} />

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

      {/* Disponível agora */}
      <div className="mt-6 space-y-3">
        {isMobile ? (
          <>
            <button
              type="button"
              onClick={() => updateFilter('availableNow', !filters.availableNow)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-bold transition ${
                filters.availableNow
                  ? 'border-[var(--green-dark)] bg-[var(--green-dark)] text-white shadow-sm'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              Disponível agora
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
              Contas inclusas
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
              Disponível agora
            </label>

            <label className="flex gap-2 items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.billsIncluded}
                onChange={(e) => updateFilter('billsIncluded', e.target.checked)}
              />
              Contas inclusas
            </label>
          </>
        )}
      </div>
    </div>
  );

  const ComparePanel = () => {
    if (compareProperties.length === 0) return null;

    const rows = [
      {
        label: 'Valor',
        getValue: (property: Property) => property.price || '-',
      },
      {
        label: 'Tipo',
        getValue: (property: Property) => formatPropertyType(property) || '-',
      },
      {
        label: 'Regiao',
        getValue: (property: Property) => property.localArea || property.region || '-',
      },
      {
        label: 'Capacidade',
        getValue: (property: Property) =>
          `${property.people || 1} pessoa${Number(property.people || 1) === 1 ? '' : 's'}`,
      },
      {
        label: 'Contas',
        getValue: (property: Property) => (property.billsIncluded ? 'Inclusas' : 'Consultar'),
      },
      {
        label: 'Entrada',
        getValue: (property: Property) =>
          getAvailabilityInfo(property.moveInDate, property.available).label,
      },
    ];

    const lowestPrice = getLowestComparePrice(compareProperties);

    return (
      <div className="fixed bottom-16 left-0 right-0 z-50 border-t border-gray-200 bg-white shadow-[0_-16px_40px_rgba(0,0,0,0.16)] md:bottom-0">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                trackEvent('compare_panel_toggle', {
                  open: !isCompareOpen,
                  count: compareProperties.length,
                });
                setIsCompareOpen((open) => !open);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--green-dark)] px-4 py-2.5 text-sm font-bold text-white"
            >
              <Scale className="h-4 w-4" />
              Comparar {compareProperties.length}/{MAX_COMPARE_ITEMS}
            </button>

            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {compareProperties.map((property) => (
                <div
                  key={property.id}
                  className="inline-flex max-w-[220px] shrink-0 items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm font-bold text-gray-800"
                >
                  <span className="truncate">{property.title}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompareProperty(property)}
                    className="rounded-full bg-white p-1 text-gray-500 hover:text-red-600"
                    aria-label="Remover da comparacao"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={clearCompare}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600 hover:border-red-200 hover:text-red-700"
            >
              Limpar
            </button>
          </div>

          {compareMessage && (
            <div className="mt-2 text-sm font-bold text-red-700">
              {compareMessage}
            </div>
          )}

          {isCompareOpen && (
            <div className="mt-3 max-h-[55vh] overflow-auto rounded-xl border border-gray-200 bg-white">
              <div
                className="grid min-w-[760px]"
                style={{
                  gridTemplateColumns: `150px repeat(${compareProperties.length}, minmax(180px, 1fr))`,
                }}
              >
                <div className="sticky left-0 z-10 border-b border-r border-gray-200 bg-gray-50 p-3 text-sm font-black text-gray-600">
                  Imovel
                </div>
                {compareProperties.map((property) => {
                  const price = getPriceValue(property.price);
                  const isBestPrice = price > 0 && price === lowestPrice;

                  return (
                    <div key={property.id} className="border-b border-gray-200 p-3">
                      <div className="mb-2 aspect-[4/3] overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={property.image}
                          alt={getPropertyImageAlt(property)}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="line-clamp-2 text-sm font-black text-gray-900">
                        {property.title}
                      </div>
                      {isBestPrice && compareProperties.length > 1 && (
                        <div className="mt-2 inline-flex rounded-full bg-[var(--yellow)] px-2 py-1 text-[11px] font-black text-black">
                          Melhor valor
                        </div>
                      )}
                    </div>
                  );
                })}

                {rows.map((row) => (
                  <Fragment key={row.label}>
                    <div className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 p-3 text-sm font-black text-gray-700">
                      {row.label}
                    </div>
                    {compareProperties.map((property) => (
                      <div key={`${property.id}-${row.label}`} className="border-t border-gray-100 p-3 text-sm font-semibold text-gray-700">
                        {row.getValue(property)}
                      </div>
                    ))}
                  </Fragment>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40 pt-28 md:pb-10">
      <SEO
        title={listingTitle}
        description={listingDescription}
        imageAlt="Imóveis e quartos para alugar em Londres"
        canonicalPath="/properties"
        jsonLd={listingJsonLd}
      />
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-5">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listingTitle}</h1>
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
              onChange={(event) => {
                const nextSort = event.target.value as SortOption;
                setSortBy(nextSort);
                trackEvent('property_sort_change', {
                  sort_by: nextSort,
                  results_count: sortedProperties.length,
                  ...getTrackingFilters(),
                });
              }}
              className="max-w-[10rem] rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold text-gray-700 shadow-sm focus:border-[var(--green-dark)] focus:outline-none"
              aria-label="Ordenar propriedades"
            >
              <option value="recommended">Recomendados</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
              <option value="available">Disponível agora</option>
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
                  ? 'bg-[var(--green-dark)] text-white shadow'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Disponível agora
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
            {renderFiltersPanel()}
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
                    <div className="text-lg font-bold text-gray-900" role="status" aria-live="polite">
                      {isLoading
                        ? 'Buscando unidades...'
                        : `${sortedProperties.length} propriedade${sortedProperties.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>

                  <label className="hidden items-center gap-2 text-sm font-semibold text-gray-700 lg:flex">
                    Ordenar por
                    <select
                      value={sortBy}
                      onChange={(event) => {
                        const nextSort = event.target.value as SortOption;
                        setSortBy(nextSort);
                        trackEvent('property_sort_change', {
                          sort_by: nextSort,
                          results_count: sortedProperties.length,
                          ...getTrackingFilters(),
                        });
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[var(--green-dark)] focus:outline-none"
                    >
                      <option value="recommended">Recomendados</option>
                      <option value="price-asc">Menor preço</option>
                      <option value="price-desc">Maior preço</option>
                      <option value="available">Disponível agora</option>
                      <option value="type">Tipo</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLeadIntent('whatsapp');
                      setIsLeadFormOpen(true);
                    }}
                    className="hidden min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-4 py-2 text-sm font-bold text-black xl:flex"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ajuda para escolher
                  </button>
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
                      <PropertyCard
                        property={p}
                        isCompareSelected={compareIds.includes(p.id)}
                        isCompareDisabled={compareIds.length >= MAX_COMPARE_ITEMS}
                        onToggleCompare={toggleCompareProperty}
                      />
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
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'empty_results' })}
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
          role="dialog"
          aria-modal="true"
          aria-label="Filtros de imóveis"
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
                ref={mobileFilterCloseRef}
                type="button"
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-700"
                aria-label="Fechar filtros"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderFiltersPanel(true)}

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

      <div className="fixed bottom-16 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-2.5 shadow-[0_-8px_24px_rgba(0,0,0,.10)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-gray-900">Não encontrou o ideal?</div>
            <div className="truncate text-xs text-gray-600">Receba ajuda em português</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setLeadIntent('whatsapp');
              setIsLeadFormOpen(true);
            }}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-[var(--yellow)] px-4 py-2.5 text-sm font-extrabold text-black shadow"
          >
            <MessageCircle className="h-5 w-5" />
            Quero ajuda
          </button>
        </div>
      </div>

      <LeadCaptureModal
        isOpen={isLeadFormOpen}
        intent={leadIntent}
        source="property_listing"
        onIntentChange={setLeadIntent}
        onClose={() => setIsLeadFormOpen(false)}
      />

      <ComparePanel />
    </div>
  );
}
