import { useState } from 'react';
import { PropertyCard, Property } from './PropertyCard';
import { SearchFilter } from './SearchFilter';

interface FilterState {
  region: string;
  type: string;
  priceRange: string;
  billsIncluded: boolean;
}

const properties: Property[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1632743441209-8a09b8a37e25?w=800',
    type: 'Studio',
    title: 'Modern Studio em North London',
    region: 'North London',
    price: 280,
    description: 'Studio moderno com cozinha equipada, banheiro privativo e área de trabalho. Próximo ao metrô.',
    available: true,
    billsIncluded: true,
    bedrooms: 1,
    category: 'studio',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1633694705199-bc1e0a87c97a?w=800',
    type: 'Ensuite',
    title: 'Ensuite Luxuoso em South London',
    region: 'South London',
    price: 220,
    description: 'Quarto com banheiro privativo em casa compartilhada. Cozinha e sala compartilhadas.',
    available: true,
    billsIncluded: true,
    bedrooms: 1,
    category: 'ensuite',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1595846723416-99a641e1231a?w=800',
    type: 'Flat',
    title: 'Flat 2 Quartos em East London',
    region: 'East London',
    price: 450,
    description: 'Apartamento completo com 2 quartos, sala, cozinha e banheiro. Perfeito para dividir.',
    available: true,
    billsIncluded: false,
    bedrooms: 2,
    category: 'flat',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1663811397207-418a92396ad5?w=800',
    type: 'Single Room',
    title: 'Single Room em West London',
    region: 'West London',
    price: 180,
    description: 'Quarto individual em casa compartilhada. Ambiente acolhedor e perto de transportes.',
    available: true,
    billsIncluded: true,
    bedrooms: 1,
    category: 'single',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1696762932825-2737db830bbe?w=800',
    type: 'Double Room',
    title: 'Double Room em Central London',
    region: 'Central London',
    price: 320,
    description: 'Quarto duplo espaçoso em localização premium. Ideal para casais.',
    available: true,
    billsIncluded: true,
    bedrooms: 1,
    category: 'double',
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?w=800',
    type: 'Studio',
    title: 'Studio Compacto em South London',
    region: 'South London',
    price: 240,
    description: 'Studio bem localizado com todas as comodidades necessárias. Entrada imediata.',
    available: true,
    billsIncluded: true,
    bedrooms: 1,
    category: 'studio',
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1663811397007-010e535ffcd7?w=800',
    type: 'Ensuite',
    title: 'Ensuite Premium em North London',
    region: 'North London',
    price: 260,
    description: 'Ensuite de alto padrão em casa nova. Totalmente mobiliado e pronto para morar.',
    available: false,
    billsIncluded: true,
    bedrooms: 1,
    category: 'ensuite',
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1609234841642-6008b93ab310?w=800',
    type: 'Flat',
    title: 'Flat 1 Quarto em West London',
    region: 'West London',
    price: 380,
    description: 'Apartamento completo de 1 quarto com varanda. Zona tranquila e segura.',
    available: true,
    billsIncluded: false,
    bedrooms: 1,
    category: 'flat',
  },
  {
    id: 9,
    image: 'https://images.unsplash.com/photo-1654064550858-c62b971a378a?w=800',
    type: 'Double Room',
    title: 'Double Room em East London',
    region: 'East London',
    price: 290,
    description: 'Quarto duplo amplo com armário embutido. Casa recém-reformada.',
    available: true,
    billsIncluded: true,
    bedrooms: 1,
    category: 'double',
  },
];

export function PropertiesSection() {
  const [filteredProperties, setFilteredProperties] = useState(properties);

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...properties];

    if (filters.region) {
      filtered = filtered.filter((p) =>
        p.region.toLowerCase().includes(filters.region.toLowerCase())
      );
    }

    if (filters.type) {
      filtered = filtered.filter((p) => p.category === filters.type);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map((v) => parseInt(v.replace('+', '')) || Infinity);
      filtered = filtered.filter((p) => {
        if (max === Infinity) return p.price >= min;
        return p.price >= min && p.price <= max;
      });
    }

    if (filters.billsIncluded) {
      filtered = filtered.filter((p) => p.billsIncluded);
    }

    setFilteredProperties(filtered);
  };

  return (
    <section id="properties" className="relative overflow-hidden bg-[var(--gray-light)] py-12 md:py-20">
      {/* Decorative brush stroke effect */}
      <div className="absolute top-10 right-0 w-1/3 h-64 bg-[var(--yellow)]/10 transform skew-y-6 blur-3xl" />
      <div className="absolute bottom-10 left-0 w-1/4 h-48 bg-[var(--green-dark)]/5 transform -skew-y-3 blur-2xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Search Filter */}
        <SearchFilter onFilterChange={handleFilterChange} />

        {/* Section Header */}
        <div className="mb-10 mt-10 text-center md:mb-12 md:mt-20">
          <div className="inline-block bg-[var(--green-dark)] text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
            NOSSAS PROPRIEDADES
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            Encontre seu
            <br />
            <span className="text-[var(--yellow)]">Novo Lar</span>
          </h2>
          <p className="text-base text-gray-600 md:text-xl">
            {filteredProperties.length} {filteredProperties.length === 1 ? 'propriedade disponível' : 'propriedades disponíveis'}
          </p>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center md:py-16">
            <p className="mb-4 text-base text-gray-600 md:text-xl">Nenhuma propriedade encontrada com os filtros selecionados.</p>
            <button
              onClick={() => setFilteredProperties(properties)}
              className="bg-[var(--green-dark)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--green-medium)] transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
