import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, MessageCircle, Globe } from 'lucide-react';
import { useState } from 'react';
import { trackEvent, trackWhatsAppClick } from '../utils/analytics';

function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.3V14h2.8v8h3.4Z" />
    </svg>
  );
}

export function Footer() {
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');

  return (
    <footer className="mb-16 bg-[var(--green-dark)] text-white md:mb-0">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <Link to="/" className="mb-4 inline-flex items-center gap-3">
              <img
                src="/img/logobedminster.png"
                alt="Bedminster"
                className="h-14 w-auto object-contain"
                style={{ mixBlendMode: 'screen' }}
              />
              <span className="text-lg font-extrabold tracking-wide text-white">
                Bedminster
              </span>
            </Link>

            <p className="mb-5 max-w-md leading-relaxed text-gray-300">
              Acomodações em Londres para brasileiros, com atendimento em português,
              suporte na chegada e informações claras antes da reserva.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="https://www.facebook.com/bedminsterlondon"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('social_click', { network: 'facebook', source: 'footer' })}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-[var(--yellow)] hover:text-black"
              >
                <FacebookIcon />
                Facebook
              </a>
              <a
                href="https://wa.me/5588997993046"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('footer')}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-[var(--yellow)] hover:text-black"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[var(--yellow)]">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/unidades"
                  onClick={() => trackEvent('view_units_click', { source: 'footer' })}
                  className="text-gray-300 transition-colors hover:text-[var(--yellow)]"
                >
                  Ver Unidades
                </Link>
              </li>
              <li>
                <Link to="/#testimonials" className="text-gray-300 transition-colors hover:text-[var(--yellow)]">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="text-gray-300 transition-colors hover:text-[var(--yellow)]">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-gray-300 transition-colors hover:text-[var(--yellow)]">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/termos" className="text-gray-300 transition-colors hover:text-[var(--yellow)]">
                  Termos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-[var(--yellow)]">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-gray-300">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>Londres, Reino Unido</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Phone className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>+55 88 99799-3046</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <span>contato@bedminsterlondon.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm text-gray-400">
            © 2026 Bedminster. Todos os direitos reservados.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5">
              <Globe className="h-4 w-4 text-[var(--yellow)]" />
              <button
                onClick={() => setLanguage('pt')}
                className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  language === 'pt'
                    ? 'bg-[var(--yellow)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-[var(--yellow)] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <Link to="/privacidade" className="transition-colors hover:text-[var(--yellow)]">
                Privacidade
              </Link>
              <Link to="/termos" className="transition-colors hover:text-[var(--yellow)]">
                Termos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
