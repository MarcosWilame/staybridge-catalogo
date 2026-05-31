import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Instagram, MessageCircle, Globe } from 'lucide-react';
import { useState } from 'react';

export function Footer() {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');

  return (
    <footer className="mb-16 bg-[var(--green-dark)] text-white md:mb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4 inline-block rounded-lg bg-[var(--yellow)] px-4 py-3 text-black md:px-6">
              <span className="text-base font-bold tracking-wider md:text-xl">BEDMINSTER LONDON</span>
            </div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Conectando brasileiros às melhores acomodações em Londres.
              Atendimento especializado e suporte em português.
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[var(--yellow)] hover:text-black rounded-full flex items-center justify-center transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://wa.me/5588997993046"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-[var(--yellow)] hover:text-black rounded-full flex items-center justify-center transition-all duration-300"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--yellow)]">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/unidades" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Ver Unidades
                </Link>
              </li>
              <li>
                <Link to="/#testimonials" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-300 hover:text-[var(--yellow)] transition-colors">
                  Favoritos
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--yellow)]">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Londres, Reino Unido</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>+44 7000 000000</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>contato@bedminster.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm text-gray-400">
            © 2026 Bedminster London. Todos os direitos reservados.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            {/* Language Switcher */}
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
              <Globe className="w-4 h-4 text-[var(--yellow)]" />
              <button
                onClick={() => setLanguage('pt')}
                className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                  language === 'pt'
                    ? 'bg-[var(--yellow)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                  language === 'en'
                    ? 'bg-[var(--yellow)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-[var(--yellow)] transition-colors">
                Privacidade
              </a>
              <a href="#" className="hover:text-[var(--yellow)] transition-colors">
                Termos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
