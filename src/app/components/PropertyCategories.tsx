import { Home, Bed, Building2, User, Users } from 'lucide-react';
import { useProperties } from '../data/sheetProperties';

export function PropertyCategories() {
  const { properties } = useProperties();

  const countByCategory = (category: string) =>
    properties.filter((property) => property.category === category).length;

  const categories = [
    {
      name: 'Studios',
      icon: Home,
      description: 'Espaços independentes completos',
      count: countByCategory('studio'),
      color: 'from-blue-500 to-blue-600',
      category: 'studio',
    },
    {
      name: 'Ensuites',
      icon: Bed,
      description: 'Quartos com banheiro privativo',
      count: countByCategory('ensuite'),
      color: 'from-purple-500 to-purple-600',
      category: 'ensuite',
    },
    {
      name: 'Flats',
      icon: Building2,
      description: 'Apartamentos completos',
      count: countByCategory('flat'),
      color: 'from-green-500 to-green-600',
      category: 'flat',
    },
    {
      name: 'Single Rooms',
      icon: User,
      description: 'Quartos individuais',
      count: countByCategory('single'),
      color: 'from-orange-500 to-orange-600',
      category: 'single',
    },
    {
      name: 'Double Rooms',
      icon: Users,
      description: 'Quartos para casais',
      count: countByCategory('double'),
      color: 'from-pink-500 to-pink-600',
      category: 'double',
    },
  ];

  return (
    <section className="bg-gray-50 py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10 text-center md:mb-14">
          <h2 className="mb-3 text-3xl font-bold text-[var(--green-dark)] md:mb-4 md:text-5xl">
            Perfeito para você
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-600 md:text-xl">
            Escolha entre diferentes tipos de acomodação em toda Londres
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.name}
                className="flex flex-col rounded-2xl bg-white p-5 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl md:p-8 lg:rounded-3xl"
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} md:mb-6 md:h-16 md:w-16 md:rounded-2xl`}
                >
                  <Icon className="h-6 w-6 text-white md:h-8 md:w-8" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-[var(--green-dark)] md:mb-3 md:text-2xl">
                  {category.name}
                </h3>

                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 md:mb-5 md:text-base">
                  {category.description}
                </p>

                <div className="mt-auto">
                  <div className="inline-block bg-[var(--green-dark)] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {category.count} disponíveis
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
