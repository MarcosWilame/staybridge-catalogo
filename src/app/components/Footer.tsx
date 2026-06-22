import { Link } from 'react-router-dom';
import { MapPin, Instagram, MessageCircle } from 'lucide-react';
import { WHATSAPP_URL } from '../config/contact';

export function Footer() {
  return (
    <footer className="mb-16 bg-[var(--green-dark)] text-white md:mb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 inline-block rounded-lg bg-[var(--yellow)] px-4 py-3 text-black md:px-6">
              <span className="text-base font-bold tracking-wider md:text-xl">STAYBRIDGE LONDON</span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Conectando brasileiros às melhores acomodações em Londres.
              Atendimento especializado e suporte em português.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/staybridge_london"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[var(--yellow)] hover:text-black rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="Instagram da Staybridge London"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[var(--yellow)] hover:text-black rounded-full flex items-center justify-center transition-all duration-300"
                aria-label="WhatsApp da Staybridge London"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="font-bold text-lg mb-4 text-[var(--yellow)]">Links Rápidos</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Ver Unidades
                </Link>
              </li>
              <li>
                <Link to="/#benefits" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Benefícios
                </Link>
              </li>
              <li>
                <Link to="/#faq" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Perguntas frequentes
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Atendimento
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-bold text-lg mb-4 text-[var(--yellow)]">Contato</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Londres, Reino Unido</span>
              </li>
              <li>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-gray-300 transition hover:text-[var(--yellow)]">
                  <MessageCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>Atendimento pelo WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm text-gray-300">
            © 2026 Staybridge London. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
