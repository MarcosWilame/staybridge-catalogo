import { Link } from 'react-router-dom';
import { PropertyCard } from './PropertyCard';
import { useProperties } from '../data/sheetProperties';
import { ArrowRight } from 'lucide-react';
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
  addProperty(['flat']);
  addProperty(['studio']);
  addProperty(['ensuite', 'studio']);
  addProperty(['double', 'ensuite', 'studio']);
  addProperty(['single', 'ensuite', 'studio']);

  for (const property of properties) {
    if (selected.length >= 6) break;
    if (selectedIds.has(property.id)) continue;

    selected.push(property);
    selectedIds.add(property.id);
  }

  return selected;
}

export function FeaturedProperties() {
  const { properties } = useProperties();

  // MOSTRA TODOS OS IMÓVEIS DISPONÍVEIS
  const featuredProperties = properties.filter(
    (p) => p.available
  );
  const visibleProperties = pickFeaturedProperties(featuredProperties);

  // CONTADORES AUTOMÁTICOS
  const studios = properties.filter(
    (p) => p.category === 'studio'
  ).length;

  const ensuites = properties.filter(
    (p) => p.category === 'ensuite'
  ).length;

  const flats = properties.filter(
    (p) => p.category === 'flat'
  ).length;

  const singles = properties.filter(
    (p) => p.category === 'single'
  ).length;

  const doubles = properties.filter(
    (p) => p.category === 'double'
  ).length;

  const propertyTypes = [
    {
      label: `Studios (${studios})`,
    },
    {
      label: `Ensuites (${ensuites})`,
    },
    {
      label: `Flats (${flats})`,
    },
    {
      label: `Singles (${singles})`,
    },
    {
      label: `Doubles (${doubles})`,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[image:linear-gradient(180deg,#ffffff_0%,#f7fbf6_52%,#eef8ee_100%)] py-14 md:py-28">

      {/* Background Decorative Elements */}
      <div className="absolute top-10 right-0 w-1/3 h-64 bg-[var(--yellow)]/10 transform skew-y-6 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-52 bg-[var(--green-medium)]/10 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#eef8ee]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center md:mb-16">

          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full bg-[var(--green-dark)] px-4 py-2 text-xs font-bold text-white shadow-lg md:mb-5 md:px-5 md:text-sm">
            🇬🇧 PROPRIEDADES EM DESTAQUE
          </div>

          <h2 className="text-3xl font-extrabold leading-tight text-[var(--green-dark)] sm:text-4xl md:text-6xl">
            Sua Nova Vida
            <br />
            <span className="text-[var(--yellow)]">
              Começa Aqui
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-600 md:mt-6 md:text-xl">
            Studios, flats e ensuites disponíveis em diversas regiões de Londres
            com entrada imediata, bills inclusas e suporte completo para brasileiros.
          </p>

      
          <div className="text-sm text-gray-500 mt-5 font-medium">
            {featuredProperties.length} propriedades disponíveis agora
          </div>
        </div>

        {/* Filters 
        <div className="mb-10 flex flex-wrap justify-center gap-2 md:mb-14 md:gap-3">

          {propertyTypes.map((type) => (
            <button
              key={type.label}
              className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-[var(--yellow)] hover:text-black hover:shadow-lg md:px-5"
            >
              {type.label}
            </button>
          ))}

        </div>
        */}

        {/* Properties Grid */}
        <div className="mb-10 grid grid-cols-1 gap-5 md:mb-16 md:grid-cols-2 md:gap-8 lg:grid-cols-3">

          {visibleProperties.map((property) => (

            <div
              key={property.id}
              className="transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <PropertyCard property={property} />
            </div>

          ))}

        </div>

        <div className="flex justify-center">
          <Link
            to="/unidades"
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[var(--yellow)] px-6 py-3.5 text-base font-bold text-black shadow-lg transition-all duration-300 hover:bg-[var(--yellow-dark)] hover:shadow-2xl sm:w-auto md:px-8 md:py-4 md:text-lg"
          >
            Ver mais unidades
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
