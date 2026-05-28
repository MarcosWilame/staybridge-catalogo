import { Link } from 'react-router-dom';
import { User, MessageCircle, Home } from 'lucide-react';
import { getWhatsAppUrl } from '../utils/whatsapp';

export function ProfilePage() {
  return (
    <div className="min-h-screen bg-[var(--gray-light)] px-4 pb-28 pt-28 md:pb-24">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 text-center shadow-lg md:p-12">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--green-dark)]/20 md:h-20 md:w-20">
            <User className="h-8 w-8 text-[var(--green-dark)] md:h-10 md:w-10" />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
            Área do Cliente
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-gray-600 md:text-base">
            Para acessar sua área pessoal, agendar visitas ou gerenciar suas reservas,
            entre em contato conosco via WhatsApp.
          </p>

          <div className="mx-auto grid max-w-lg grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <a
              href={getWhatsAppUrl(
                'Olá! Gostaria de acessar minha área do cliente, agendar uma visita ou receber suporte sobre reservas.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--green-dark)] px-5 py-3.5 font-semibold text-white transition-all duration-300 hover:bg-[var(--green-medium)] md:px-6 md:py-4"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-5 py-3.5 font-semibold text-black transition-all duration-300 hover:bg-[var(--yellow-dark)] md:px-6 md:py-4"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </Link>
          </div>

          <div className="mt-10 border-t border-gray-200 pt-6 md:mt-12 md:pt-8">
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
