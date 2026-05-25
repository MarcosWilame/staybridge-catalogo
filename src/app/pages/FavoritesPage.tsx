import { Link } from 'react-router';
import { Heart, Search } from 'lucide-react';

export function FavoritesPage() {
  return (
    <div className="min-h-screen bg-[var(--gray-light)] pt-28 pb-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-lg p-12">
          <div className="w-20 h-20 bg-[var(--yellow)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-[var(--green-dark)]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Seus Favoritos
          </h1>
          <p className="text-gray-600 mb-8">
            Você ainda não salvou nenhuma propriedade como favorita.
            <br />
            Navegue pelas propriedades e clique no ícone de coração para salvá-las aqui.
          </p>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 bg-[var(--green-dark)] hover:bg-[var(--green-medium)] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Explorar Propriedades
          </Link>
        </div>
      </div>
    </div>
  );
}
