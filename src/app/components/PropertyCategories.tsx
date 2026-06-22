import { Home, Bed, Building2, User, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProperties } from '../data/sheetProperties';

export function PropertyCategories() {
  const { properties, isLoading } = useProperties();

  const countByCategory = (category: string) =>
    properties.filter((property) => property.category === category).length;

  const categories = [
    {
      name: 'Studios',
      icon: Home,
      description: 'Espaços independentes completos',
      count: countByCategory('studio'),
      color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
      category: 'studio',
    },
    {
      name: 'Ensuites',
      icon: Bed,
      description: 'Quartos com banheiro privativo',
      count: countByCategory('ensuite'),
      color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
      category: 'ensuite',
    },
    {
      name: 'Flats',
      icon: Building2,
      description: 'Flats completos',
      count: countByCategory('flat'),
      color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
      category: 'flat',
    },
    {
      name: 'Quartos individuais',
      icon: User,
      description: 'Quartos individuais',
      count: countByCategory('single'),
      color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
      category: 'single',
    },
    {
      name: 'Quartos duplos',
      icon: Users,
      description: 'Quartos para casais',
      count: countByCategory('double'),
      color: 'from-[var(--green-dark)] to-[var(--green-medium)]',
      category: 'double',
    },
  ];

  return (
    <section className="bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] py-12 text-white md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10 text-center md:mb-14">
          <h2 className="mb-3 text-3xl font-bold text-white md:mb-4 md:text-5xl">
            Encontre o espaço que combina com sua rotina
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/80 md:text-xl">
            Escolha entre diferentes tipos de acomodação em toda Londres
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.name}
                to={`/properties?type=${category.category}`}
                className="flex flex-col rounded-2xl border border-white/20 bg-[#f7f4df] p-5 text-center text-gray-900 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[var(--yellow)] hover:shadow-2xl md:p-6"
              >
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--yellow)] text-[var(--green-dark)] md:mb-6 md:h-16 md:w-16 md:rounded-2xl"
                >
                  <Icon className="h-6 w-6 md:h-8 md:w-8" />
                </div>

                <h3 className="mb-2 text-xl font-bold text-[var(--green-dark)] md:mb-3 md:text-2xl">
                  {category.name}
                </h3>

                <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600 md:mb-5 md:text-base">
                  {category.description}
                </p>

                <div className="mt-auto">
                  <div className="inline-block bg-[var(--green-dark)] text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {isLoading ? 'Carregando opções' : `${category.count} disponíveis`}
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
