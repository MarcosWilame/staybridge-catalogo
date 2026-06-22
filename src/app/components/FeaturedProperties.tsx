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
    () => properties.filter((property) => property.available && hasDisplayImage(property)),
    [properties]
  );
  const featuredProperties = useMemo(
    () => pickFeaturedProperties(availableProperties),
    [availableProperties]
  );
  const displayedProperties = featuredProperties.slice(0, 3);

  return (
    <section className="bg-[#f4f0dd] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.16em] text-[var(--green-medium)]">Seleção disponível agora</p>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-[var(--green-dark)] md:text-5xl">
              Lugares para começar uma nova fase em Londres
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
              Estúdios, suítes, apartamentos e quartos com suporte em português para
              você decidir com segurança.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[var(--green-dark)] shadow-sm">
              {availableProperties.length} opções disponíveis
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--green-dark)] bg-white px-4 py-3 text-sm font-bold text-[var(--green-dark)] transition hover:bg-[var(--green-dark)] hover:text-white"
            >
              Ver todas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {displayedProperties.map((property, index) => (
            <div
              key={property.id}
              className={`h-full transform transition-all duration-500 hover:-translate-y-1 ${
                index > 0 ? 'hidden md:block' : ''
              }`}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
