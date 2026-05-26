import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useProperties } from '../data/sheetProperties';

const regions = [
  {
    name: 'North London',
    description: 'Áreas residenciais tranquilas com excelente transporte',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    highlight: 'Camden, Islington, Finsbury Park',
    query: 'north',
  },
  {
    name: 'South London',
    description: 'Regiões modernas com vida noturna vibrante',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
    highlight: 'Clapham, Brixton, Stockwell',
    query: 'south',
  },
  {
    name: 'East London',
    description: 'Área jovem e criativa, próximo a Stratford',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800',
    highlight: 'Stratford, Mile End, Bethnal Green',
    query: 'east',
  },
  {
    name: 'West London',
    description: 'Zonas tranquilas com parques e áreas verdes',
    image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800',
    highlight: 'Acton, Shepherd\'s Bush, White City',
    query: 'west',
  },
];

export function RegionShowcase() {
  const { properties } = useProperties();

  const countByRegion = (query: string) =>
    properties.filter((property) =>
      property.region.toLowerCase().includes(query)
    ).length;

  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20">
      {/* Diagonal background element */}
      <div className="absolute bottom-0 left-0 w-full h-96 bg-gradient-to-tr from-[var(--green-dark)]/5 to-transparent transform skew-y-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:mb-12">
          <div className="inline-block bg-[var(--green-dark)] text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            REGIÕES DE LONDRES
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            Explore Diferentes
            <br />
            <span className="text-[var(--yellow)]">Áreas de Londres</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-xl">
            Encontre a região perfeita para sua nova casa em Londres
          </p>
        </div>

        {/* Regions Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {regions.map((region, index) => (
            <Link
              key={index}
              to={`/properties?region=${region.query}`}
              className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:border-[var(--green-dark)] hover:shadow-2xl md:rounded-2xl"
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden md:h-48">
                <img
                  src={region.image}
                  alt={region.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Property Count Badge */}
                <div className="absolute top-4 right-4">
                  <span className="bg-[var(--yellow)] text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {countByRegion(region.query)} {countByRegion(region.query) === 1 ? 'propriedade' : 'propriedades'}
                  </span>
                </div>

                {/* Region Name */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                    <MapPin className="w-5 h-5" />
                    {region.name}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                <p className="mb-3 text-sm leading-relaxed text-gray-700 md:text-base">
                  {region.description}
                </p>
                <p className="text-sm text-[var(--green-dark)] font-semibold mb-4">
                  {region.highlight}
                </p>

                {/* CTA */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-600">Ver propriedades</span>
                  <div className="w-10 h-10 bg-[var(--green-dark)] group-hover:bg-[var(--yellow)] rounded-full flex items-center justify-center transition-colors">
                    <ArrowRight className="w-5 h-5 text-white group-hover:text-black transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
