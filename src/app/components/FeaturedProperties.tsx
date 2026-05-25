import { Link } from 'react-router';
import { PropertyCard } from './PropertyCard';
import { properties } from '../data/properties';
import { ArrowRight } from 'lucide-react';

export function FeaturedProperties() {

  // MOSTRA TODOS OS IMÓVEIS DISPONÍVEIS
  const featuredProperties = properties.filter(
    (p) => p.available
  );

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
    <section className="py-28 bg-gradient-to-b from-white to-[var(--green-light)] relative overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-10 right-0 w-1/3 h-64 bg-[var(--yellow)]/10 transform skew-y-6 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-1/4 h-52 bg-[var(--green-medium)]/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-16">

          <div className="inline-flex items-center gap-2 bg-[var(--green-dark)] text-white px-5 py-2 rounded-full text-sm font-bold mb-5 shadow-lg">
            🇬🇧 PROPRIEDADES EM DESTAQUE
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold text-[var(--green-dark)] leading-tight">
            Sua Nova Vida
            <br />
            <span className="text-[var(--yellow)]">
              Começa Aqui
            </span>
          </h2>

          <p className="text-xl text-gray-600 mt-6 max-w-3xl mx-auto leading-relaxed">
            Studios, flats e ensuites disponíveis em diversas regiões de Londres
            com entrada imediata, bills inclusas e suporte completo para brasileiros.
          </p>

          <div className="text-sm text-gray-500 mt-5 font-medium">
            {featuredProperties.length} propriedades disponíveis agora
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">

          {propertyTypes.map((type) => (
            <button
              key={type.label}
              className="px-5 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-[var(--yellow)] hover:text-black hover:shadow-lg transition-all duration-300 font-medium"
            >
              {type.label}
            </button>
          ))}

        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

          {featuredProperties.map((property) => (

            <div
              key={property.id}
              className="transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <PropertyCard property={property} />
            </div>

          ))}

        </div>

        {/* CTA Section */}
        <div className="bg-[var(--green-dark)] rounded-3xl p-10 md:p-14 text-center shadow-2xl relative overflow-hidden">

          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--yellow)]/10 rounded-full blur-3xl" />

          <div className="relative z-10">

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ainda procurando a acomodação ideal?
            </h3>

            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
              Explore todas as nossas unidades disponíveis em Londres e encontre
              studios, flats e quartos perfeitos para você.
            </p>

            <Link
              to="/properties"
              className="inline-flex items-center gap-3 bg-[var(--yellow)] hover:scale-105 hover:shadow-2xl text-black px-8 py-4 rounded-xl font-bold transition-all duration-300 text-lg"
            >
              Ver Todas as Unidades Disponíveis
              <ArrowRight className="w-5 h-5" />
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}