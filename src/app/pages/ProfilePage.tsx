import { Link } from 'react-router-dom';
import { User, MessageCircle, Home } from 'lucide-react';

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--gray-light)] pt-28 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-[var(--green-dark)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-[var(--green-dark)]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Área do Cliente
          </h1>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Para acessar sua área pessoal, agendar visitas ou gerenciar suas reservas,
            entre em contato conosco via WhatsApp.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto">
            <a
              href="https://wa.me/447000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[var(--green-dark)] hover:bg-[var(--green-medium)] text-white px-6 py-4 rounded-lg font-semibold transition-all duration-300"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-6 py-4 rounded-lg font-semibold transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4">Serviços Disponíveis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              <div className="bg-[var(--gray-light)] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Agendamento de Visitas</h4>
                <p className="text-sm text-gray-600">Agende visitas presenciais ou virtuais</p>
              </div>
              <div className="bg-[var(--gray-light)] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Processo de Reserva</h4>
                <p className="text-sm text-gray-600">Documentação e contratos seguros</p>
              </div>
              <div className="bg-[var(--gray-light)] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Suporte Contínuo</h4>
                <p className="text-sm text-gray-600">Assistência durante toda sua estadia</p>
              </div>
              <div className="bg-[var(--gray-light)] rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Atendimento em Português</h4>
                <p className="text-sm text-gray-600">Equipe brasileira disponível</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
