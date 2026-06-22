import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { useProperties } from '../data/sheetProperties';
import type { Property } from '../data/properties';

function pickFirstUnused(
  properties: Property[],
  categories: string[],
  selectedIds: Set<number>
) {
  for (const category of categories) {
    const property = properties.find(
      (item) => item.category === category && !selectedIds.has(item.id)
    );

    if (property) return property;
  }

  return undefined;
}

function pickFeaturedProperties(properties: Property[]) {
  const selectedIds = new Set<number>();
  const selected: Property[] = [];

  const addProperty = (categories: string[]) => {
    const property = pickFirstUnused(properties, categories, selectedIds);
    if (!property) return;

    selected.push(property);
    selectedIds.add(property.id);
  };

  addProperty(['flat']);
  addProperty(['studio']);
  addProperty(['ensuite', 'studio']);
  addProperty(['double', 'ensuite', 'studio']);
  addProperty(['single', 'ensuite', 'studio']);
  addProperty(['flat', 'studio', 'ensuite']);

  for (const property of properties) {
    if (selected.length >= 6) break;
    if (selectedIds.has(property.id)) continue;

    selected.push(property);
    selectedIds.add(property.id);
  }

  return selected;
}

function hasDisplayImage(property: Property) {
  return getPropertyImageCandidates(property).length > 0;
}

function getPropertyImageCandidates(property: Property) {
  const candidates = [property.image, ...(property.images || [])]
    .map((image) => image?.trim())
    .filter((image): image is string => Boolean(image));

  return Array.from(new Set(candidates)).filter((image) => {
    const normalized = image.toLowerCase();

    return (
      /^https?:\/\//.test(normalized) &&
      !normalized.includes('undefined') &&
      !normalized.includes('null') &&
      !/\.(mp4|mov|webm|avi)(\?|#|$)/.test(normalized)
    );
  });
}

export function FeaturedProperties() {
  const { properties } = useProperties();

  const availableProperties = useMemo(
    () => properties.filter((property) => property.available),
    [properties]
  );
  const displayableProperties = useMemo(
    () => availableProperties.filter(hasDisplayImage),
    [availableProperties]
  );
  const featuredProperties = useMemo(
    () => pickFeaturedProperties(displayableProperties),
    [displayableProperties]
  );
  const displayedProperties = featuredProperties.slice(0, 3);

  return (
    <section className="reveal-section relative overflow-hidden bg-[#f4f0dd] py-14 md:py-20">
      <div aria-hidden="true" className="absolute -right-32 top-10 h-80 w-80 rounded-full bg-[var(--yellow)]/15 blur-3xl" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[var(--green-medium)]"><span className="h-2 w-2 rounded-full bg-[#22a95a] shadow-[0_0_0_5px_rgba(34,169,90,.12)]" /> Seleção disponível agora</p>
            <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-[-.03em] text-[var(--green-dark)] md:text-4xl">
              Disponíveis agora em Londres
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600">
              Compare fotos, valores semanais e localização antes de falar com a equipe.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/properties"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--green-dark)] px-5 text-sm font-black text-white shadow-[0_10px_25px_rgba(26,77,46,.18)] transition hover:-translate-y-0.5 hover:bg-[var(--green-medium)]"
            >
              Ver mais imóveis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-5 scrollbar-hide md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {displayedProperties.map((property, index) => (
            <div
              key={property.id}
              className="h-full w-[86vw] max-w-[390px] shrink-0 snap-center transform transition-all duration-500 hover:-translate-y-1 md:w-auto md:max-w-none"
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>
        <p className="mt-1 text-center text-xs font-semibold text-[var(--green-dark)]/60 md:hidden">Deslize para comparar mais opções</p>
      </div>
    </section>
  );
}
