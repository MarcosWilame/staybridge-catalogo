import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-9xl font-bold text-[var(--green-dark)]">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
            Página não encontrada
          </h1>
          <p className="text-gray-600">
            Desculpe, a página que você está procurando não existe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-[var(--green-dark)] hover:bg-[var(--green-medium)] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
          <Link
            to="/properties"
            className="inline-flex items-center justify-center gap-2 bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300"
          >
            <Search className="w-5 h-5" />
            Ver Propriedades
          </Link>
        </div>
      </div>
    </div>
  );
}
