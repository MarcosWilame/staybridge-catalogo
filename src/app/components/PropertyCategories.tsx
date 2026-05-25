import { Home, Bed, Building2, User, Users } from 'lucide-react';
import { properties } from '../data/properties';

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

const categories = [
  {
    name: 'Studios',
    icon: Home,
    description: 'Espaços independentes completos',
    count: studios,
    color: 'from-blue-500 to-blue-600',
    category: 'studio',
  },
  {
    name: 'Ensuites',
    icon: Bed,
    description: 'Quartos com banheiro privativo',
    count: ensuites,
    color: 'from-purple-500 to-purple-600',
    category: 'ensuite',
  },
  {
    name: 'Flats',
    icon: Building2,
    description: 'Apartamentos completos',
    count: flats,
    color: 'from-green-500 to-green-600',
    category: 'flat',
  },
  {
    name: 'Single Rooms',
    icon: User,
    description: 'Quartos individuais',
    count: singles,
    color: 'from-orange-500 to-orange-600',
    category: 'single',
  },
  {
    name: 'Double Rooms',
    icon: Users,
    description: 'Quartos para casais',
    count: doubles,
    color: 'from-pink-500 to-pink-600',
    category: 'double',
  },
];

export function PropertyCategories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--green-dark)] mb-4">
            Perfeito para você
          </h2>

          <p className="text-xl text-gray-600">
            Escolha entre diferentes tipos de acomodação em toda Londres
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.name}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center flex flex-col"
              >
                <div
                  className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-[var(--green-dark)] mb-3">
                  {category.name}
                </h3>

                <p className="text-gray-600 mb-5 flex-1">
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