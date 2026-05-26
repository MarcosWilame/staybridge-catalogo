import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { useProperties } from '../data/sheetProperties';

const regions = [
  {
    name: 'North London',
    description: 'Areas residenciais tranquilas com excelente transporte',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    query: 'north',
  },
  {
    name: 'South London',
    description: 'Regioes com otima oferta de studios, ensuites e flats',
    image: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800',
    query: 'south',
  },
  {
    name: 'East London',
    description: 'Areas conectadas ao leste de Londres',
    image: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800',
    query: 'east',
  },
  {
    name: 'West London',
    description: 'Zonas tranquilas com parques e areas verdes',
    image: 'https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=800',
    query: 'west',
  },
];

const areaDescriptions: Record<string, string> = {
  brixton: 'Area vibrante no sul, com boa vida local e acesso pratico ao centro.',
  croydon: 'Regiao ao sul com boa estrutura urbana, comercio e conexoes de transporte.',
  'dollis hill': 'Area residencial no noroeste, pratica para quem busca tranquilidade e metro por perto.',
  'elephant & castle': 'Localizacao bem conectada, com acesso rapido a zonas centrais.',
  feltham: 'Area residencial no oeste, indicada para quem busca mais espaco e rotina tranquila.',
  'golders green': 'Regiao residencial no norte, conhecida por comercio local e boas conexoes.',
  greenford: 'Area no oeste/noroeste com perfil residencial e boas opcoes para studios.',
  harlesden: 'Regiao multicultural no noroeste, com transporte e comercio proximos.',
  lambeth: 'Area ao sul com acesso facil a diferentes pontos de Londres.',
  lewisham: 'Regiao ao sudeste com boa oferta de transporte e comercio local.',
  mitcham: 'Area residencial ao sul, indicada para quem busca custo-beneficio.',
  neasden: 'Regiao residencial no noroeste, com opcoes praticas para quartos e ensuites.',
  norwood: 'Area ao sul com perfil residencial e boas ligacoes para outras regioes.',
  'stamford hill': 'Regiao ao norte com perfil residencial e acesso a rotas locais.',
  streatham: 'Area forte no sul, com varias opcoes de studios e ensuites disponiveis.',
  tottenham: 'Regiao ao norte com boa conexao e perfil urbano residencial.',
  uxbridge: 'Area mais tranquila no oeste, com boa estrutura local.',
  'willesden green': 'Regiao no noroeste com metro, comercio local e perfil residencial.',
};

function normalizeArea(area: string) {
  return area.trim().toLowerCase();
}

function getAreaDescription(area: string) {
  return (
    areaDescriptions[normalizeArea(area)] ||
    'Area com unidades disponiveis e acesso pratico para a rotina em Londres.'
  );
}

function getPropertyKindLabel(category: string) {
  if (category === 'studio') return 'studio';
  if (category === 'ensuite') return 'ensuite';
  if (category === 'flat') return 'flat';
  if (category === 'single') return 'single room';
  if (category === 'double') return 'double room';
  return category || 'unidade';
}

export function RegionShowcase() {
  const { properties } = useProperties();

  const getRegionProperties = (query: string) =>
    properties.filter((property) => property.region.toLowerCase().includes(query));

  const getAreasByRegion = (query: string) => {
    const groupedAreas = getRegionProperties(query).reduce<
      Record<string, { name: string; count: number; categories: Set<string> }>
    >((areas, property) => {
      const areaName = property.localArea || property.region;
      const key = normalizeArea(areaName);

      if (!areas[key]) {
        areas[key] = {
          name: areaName,
          count: 0,
          categories: new Set<string>(),
        };
      }

      areas[key].count += 1;
      areas[key].categories.add(getPropertyKindLabel(property.category));
      return areas;
    }, {});

    return Object.values(groupedAreas).sort((a, b) => b.count - a.count);
  };

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
            Veja exatamente onde temos unidades disponiveis agora
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {regions.map((region, index) => {
            const regionProperties = getRegionProperties(region.query);
            const availableAreas = getAreasByRegion(region.query);

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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

                  <div className="absolute right-4 top-4">
                    <span className="rounded-full bg-[var(--yellow)] px-3 py-1 text-xs font-bold text-black shadow-lg">
                      {regionProperties.length}{' '}
                      {regionProperties.length === 1 ? 'propriedade' : 'propriedades'}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="mb-1 flex items-center gap-2 text-xl font-bold text-white md:text-2xl">
                      <MapPin className="h-5 w-5" />
                      {region.name}
                    </h3>
                    <p className="text-sm text-white/90">{region.description}</p>
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="space-y-4">
                    {availableAreas.length > 0 ? (
                      availableAreas.map((area) => (
                        <div
                          key={area.name}
                          className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                        >
                          <div className="mb-1 flex items-start justify-between gap-3">
                            <h4 className="font-bold text-[var(--green-dark)]">
                              {area.name}
                            </h4>
                            <span className="shrink-0 rounded-full bg-[var(--green-dark)]/10 px-2.5 py-1 text-xs font-bold text-[var(--green-dark)]">
                              {area.count}
                            </span>
                          </div>
                          <p className="mb-2 text-sm leading-relaxed text-gray-600">
                            {getAreaDescription(area.name)}
                          </p>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {Array.from(area.categories).join(', ')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-relaxed text-gray-600">
                        No momento nao temos unidades imediatas nessa regiao.
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex items-center justify-between">
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
