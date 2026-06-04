import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { useProperties } from '../data/sheetProperties';
import type { Property } from '../data/properties';
import { getOptimizedImageUrl } from '../utils/cloudinary';

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

function canLoadImage(src: string) {
  return new Promise<boolean>((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(() => resolve(false), 5000);

    image.onload = () => {
      window.clearTimeout(timeout);
      resolve(Boolean(image.naturalWidth && image.naturalHeight));
    };

    image.onerror = () => {
      window.clearTimeout(timeout);
      resolve(false);
    };

    image.src = getOptimizedImageUrl(src, 'card');
  });
}

async function propertyHasLoadableImage(property: Property) {
  for (const image of getPropertyImageCandidates(property)) {
    if (await canLoadImage(image)) return true;
  }

  return false;
}

export function FeaturedProperties() {
  const { properties } = useProperties();
  const [activeIndex, setActiveIndex] = useState(0);
  const [verifiedImageIds, setVerifiedImageIds] = useState<Set<number>>(new Set());

  const availableProperties = useMemo(
    () => properties.filter((property) => property.available && hasDisplayImage(property)),
    [properties]
  );
  const imageReadyProperties = useMemo(
    () => availableProperties.filter((property) => verifiedImageIds.has(property.id)),
    [availableProperties, verifiedImageIds]
  );
  const featuredProperties = useMemo(
    () => pickFeaturedProperties(imageReadyProperties),
    [imageReadyProperties]
  );
  const carouselProperties = featuredProperties.length
    ? Array.from(
        { length: Math.min(3, featuredProperties.length) },
        (_, index) => featuredProperties[(activeIndex + index) % featuredProperties.length]
      )
    : [];

  useEffect(() => {
    let isMounted = true;

    setVerifiedImageIds(new Set());

    availableProperties.forEach((property) => {
      propertyHasLoadableImage(property).then((hasImage) => {
        if (!isMounted || !hasImage) return;

        setVerifiedImageIds((current) => {
          if (current.has(property.id)) return current;

          const next = new Set(current);
          next.add(property.id);
          return next;
        });
      });
    });

    return () => {
      isMounted = false;
    };
  }, [availableProperties]);

  useEffect(() => {
    if (featuredProperties.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % featuredProperties.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [featuredProperties.length]);

  useEffect(() => {
    if (activeIndex < featuredProperties.length) return;
    setActiveIndex(0);
  }, [activeIndex, featuredProperties.length]);

  return (
    <section className="bg-gray-50 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-full bg-[var(--green-dark)] px-3 py-1.5 text-xs font-bold uppercase text-white">
              Unidades disponíveis agora
            </div>
            <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-[var(--green-dark)] md:text-5xl">
              Escolha sua próxima acomodação em Londres
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-600 md:text-lg">
              Studios, ensuites, flats e quartos com suporte em português para
              você decidir com segurança.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-[var(--green-dark)] shadow-sm">
              {imageReadyProperties.length} opções disponíveis
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
          {carouselProperties.map((property, index) => (
            <div
              key={`${property.id}-${activeIndex}`}
              className={`h-full transform transition-all duration-500 hover:-translate-y-1 ${
                index > 0 ? 'hidden md:block' : ''
              }`}
            >
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

        {featuredProperties.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {featuredProperties.slice(0, 6).map((property, index) => (
              <button
                key={property.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-8 bg-[var(--green-dark)]'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ver acomodacao ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
