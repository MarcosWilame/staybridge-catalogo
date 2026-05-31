import { Link } from 'react-router-dom';
import { Home, Bed, Building2, User, Users } from 'lucide-react';
import { useProperties } from '../data/sheetProperties';
import { trackEvent } from '../utils/analytics';

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
      accent: 'border-blue-100 hover:border-blue-300',
      category: 'studio',
    },
    {
      name: 'Ensuites',
      icon: Bed,
      description: 'Quartos com banheiro privativo',
      count: countByCategory('ensuite'),
      color: 'from-purple-500 to-purple-600',
      accent: 'border-purple-100 hover:border-purple-300',
      category: 'ensuite',
    },
    {
      name: 'Flats',
      icon: Building2,
      description: 'Apartamentos completos',
      count: countByCategory('flat'),
      color: 'from-green-500 to-green-600',
      accent: 'border-emerald-100 hover:border-emerald-300',
      category: 'flat',
    },
    {
      name: 'Single Rooms',
      icon: User,
      description: 'Quartos individuais',
      count: countByCategory('single'),
      color: 'from-orange-500 to-orange-600',
      accent: 'border-orange-100 hover:border-orange-300',
      category: 'single',
    },
    {
      name: 'Double Rooms',
      icon: Users,
      description: 'Quartos para casais',
      count: countByCategory('double'),
      color: 'from-[var(--green-medium)] to-[var(--yellow-dark)]',
      accent: 'border-amber-100 hover:border-[var(--yellow-dark)]',
      category: 'double',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[image:linear-gradient(180deg,#edf7ed_0%,#f7fbf6_42%,#ffffff_100%)] py-12 md:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#edf7ed] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-white" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white p-5 text-center shadow-[0_18px_40px_rgba(15,83,45,0.10)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_26px_55px_rgba(15,83,45,0.18)] md:p-8 lg:rounded-3xl ${category.accent}`}
              >
                <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${category.color}`} />
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${category.color} shadow-lg shadow-black/10 transition-transform duration-300 group-hover:scale-110 md:mb-6 md:h-16 md:w-16 md:rounded-2xl`}
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
                  <Link
                    to={`/unidades?type=${category.category}`}
                    onClick={() =>
                      trackEvent('property_category_click', {
                        category: category.category,
                        category_name: category.name,
                        available_count: category.count,
                      })
                    }
                    className="inline-flex items-center justify-center rounded-full bg-[var(--green-dark)] px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--green-medium)] hover:shadow-md"
                  >
                    {category.count} disponíveis
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
