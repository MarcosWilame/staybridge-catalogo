import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Search, Sparkles } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { useProperties } from '../data/sheetProperties';
import { getFavoritePropertyIds } from '../utils/favorites';

export function FavoritesPage() {
  const { properties } = useProperties();
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() =>
    getFavoritePropertyIds()
  );

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(getFavoritePropertyIds());

    window.addEventListener('bedminster:favorites-changed', syncFavorites);
    window.addEventListener('storage', syncFavorites);

    return () => {
      window.removeEventListener('bedminster:favorites-changed', syncFavorites);
      window.removeEventListener('storage', syncFavorites);
    };
  }, []);

  const favoriteProperties = useMemo(
    () => properties.filter((property) => favoriteIds.includes(property.id)),
    [favoriteIds, properties]
  );

  return (
    <div className="min-h-screen bg-[image:var(--page-gradient)] px-4 pb-28 pt-28 md:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white/90 p-6 text-center shadow-[var(--surface-shadow)] md:p-10">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-lg bg-[var(--yellow)] text-black shadow-lg shadow-[rgba(184,155,99,0.18)] md:h-20 md:w-20">
            <Heart className="h-8 w-8 md:h-10 md:w-10" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-[var(--green-dark)] md:text-5xl">
            Seus Favoritos
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
            Salve as unidades que chamaram sua atenção e volte nelas rapidamente.
          </p>
          {favoriteProperties.length > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--green-dark)] px-4 py-2 text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-[var(--yellow)]" />
              {favoriteProperties.length} unidade{favoriteProperties.length > 1 ? 's' : ''} salva{favoriteProperties.length > 1 ? 's' : ''}
            </div>
          )}
        </div>

        {favoriteProperties.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {favoriteProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-[var(--surface-border)] bg-white text-center shadow-[var(--surface-shadow)]">
            <div className="h-2 bg-[image:var(--brand-gradient)]" />
            <div className="p-6 md:p-12">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--gray-light)] text-[var(--green-dark)]">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-[var(--green-dark)] md:text-3xl">
              Monte sua lista ideal
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-gray-600 md:text-base">
              Você ainda não salvou nenhuma propriedade como favorita.
              <br />
              Abra uma unidade e toque no coração para salvá-la aqui.
            </p>
            <Link
              to="/unidades"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--green-dark)] px-5 py-3.5 font-bold text-white transition-all duration-300 hover:bg-[var(--green-medium)] hover:shadow-lg sm:w-auto md:px-6"
            >
              Explorar Propriedades
              <ArrowRight className="h-5 w-5" />
            </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
