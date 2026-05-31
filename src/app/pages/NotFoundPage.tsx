import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-24 pt-28">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="text-7xl font-bold text-[var(--green-dark)] md:text-9xl">404</div>
          <h1 className="mb-2 mt-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Página não encontrada
          </h1>
          <p className="text-gray-600">
            Desculpe, a página que você está procurando não existe.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-5 py-3 font-semibold text-white transition-all duration-300 hover:bg-[var(--green-medium)] md:px-6"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
          <Link
            to="/unidades"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-5 py-3 font-semibold text-black transition-all duration-300 hover:bg-[var(--yellow-dark)] md:px-6"
          >
            <Search className="w-5 h-5" />
            Ver Propriedades
          </Link>
        </div>
      </div>
    </div>
  );
}
