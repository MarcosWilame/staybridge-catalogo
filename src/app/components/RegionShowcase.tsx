import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useProperties } from '../data/sheetProperties';

const regions = [
  {
    name: 'North London',
    description: 'Areas residenciais tranquilas, boas conexoes e opcoes praticas para morar.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    query: 'north',
  },
  {
    name: 'South London',
    description: 'Regiao com forte oferta de studios, ensuites e flats em areas bem conectadas.',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
    query: 'south',
  },
  {
    name: 'East London',
    description: 'Zona urbana e conectada, com acesso a polos modernos de Londres.',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800',
    query: 'east',
  },
  {
    name: 'West London',
    description: 'Areas mais tranquilas, residenciais e com boa estrutura local.',
    image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800',
    query: 'west',
  },
];

function getAvailableAreas(properties: ReturnType<typeof useProperties>['properties'], query: string) {
  const areas = properties
    .filter((property) => property.region.toLowerCase().includes(query))
    .map((property) => property.localArea || property.region)
    .filter(Boolean);

  return Array.from(new Set(areas)).slice(0, 4);
}

export function RegionShowcase() {
  const { properties } = useProperties();

  const countByRegion = (query: string) =>
    properties.filter((property) => property.region.toLowerCase().includes(query)).length;

  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20">
      <div className="absolute bottom-0 left-0 h-96 w-full origin-bottom-left skew-y-2 bg-gradient-to-tr from-[var(--green-dark)]/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:mb-12">
          <div className="mb-4 inline-block rounded-full bg-[var(--green-dark)] px-4 py-2 text-sm font-bold text-white">
            REGIOES DE LONDRES
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            Explore Diferentes
            <br />
            <span className="text-[var(--yellow)]">Areas de Londres</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-xl">
            Encontre a regiao perfeita para sua nova casa em Londres
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {regions.map((region, index) => {
            const propertyCount = countByRegion(region.query);
            const availableAreas = getAvailableAreas(properties, region.query);
            const highlight =
              availableAreas.length > 0
                ? availableAreas.join(', ')
                : 'Sem unidades imediatas no momento';

            return (
              <Link
                key={index}
                to={`/properties?region=${region.query}`}
                className="group relative overflow-hidden rounded-xl border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:border-[var(--green-dark)] hover:shadow-2xl md:rounded-2xl"
              >
                <div className="relative h-44 overflow-hidden md:h-48">
                  <img
                    src={region.image}
                    alt={region.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-bold text-black shadow-lg">
                      {propertyCount} {propertyCount === 1 ? 'propriedade' : 'propriedades'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                      <MapPin className="h-5 w-5" />
                      {region.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <p className="mb-3 text-sm leading-relaxed text-gray-700 md:text-base">
                    {region.description}
                  </p>
                  <p className="mb-4 text-sm font-semibold text-[var(--green-dark)]">
                    {highlight}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Ver propriedades</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--green-dark)] transition-colors group-hover:bg-[var(--yellow)]">
                      <ArrowRight className="h-5 w-5 text-white transition-colors group-hover:text-black" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
