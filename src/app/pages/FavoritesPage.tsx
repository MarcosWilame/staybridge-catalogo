import { Link } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';

export function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-4 pb-28 pt-28 md:pb-24">
      <div className="mx-auto max-w-4xl text-center">
        <div className="rounded-2xl bg-white p-6 shadow-lg md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--yellow)]/20 md:h-20 md:w-20">
            <Heart className="h-8 w-8 text-[var(--green-dark)] md:h-10 md:w-10" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Seus Favoritos
          </h1>
          <p className="mb-8 text-sm leading-relaxed text-gray-600 md:text-base">
            Você ainda não salvou nenhuma propriedade como favorita.
            <br />
            Navegue pelas propriedades e clique no ícone de coração para salvá-las aqui.
          </p>
          <Link
            to="/properties"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-[var(--green-medium)] sm:w-auto md:px-6"
          >
            <Search className="w-5 h-5" />
            Explorar Propriedades
          </Link>
        </div>
      </div>
    </div>
  );
}
