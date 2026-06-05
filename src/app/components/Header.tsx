import { useState, useEffect, type MouseEvent } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { openWhatsApp } from '../config/contact';
import { trackEvent } from '../utils/analytics';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    setIsScrolled(false);

    const tryObserve = () => {
      const hero = document.getElementById('hero');
      if (!hero) return false;

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        { threshold: 0.1 }
      );

      observer.observe(hero);
      return () => observer.disconnect();
    };

    // Tenta imediatamente, se hero ainda não montou aguarda um frame
    const cleanup = tryObserve();
    if (cleanup) return cleanup;

    const raf = requestAnimationFrame(() => {
      tryObserve();
    });

    return () => cancelAnimationFrame(raf);
  }, [isHome]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    if (!isHome) {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleWhatsApp = () => {
    trackEvent('whatsapp_click', {
      source: isMobileMenuOpen ? 'mobile_header' : 'desktop_header',
    });
    openWhatsApp();
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-semibold transition-all duration-300 rounded-xl px-4 py-2 text-white hover:text-[var(--yellow)] ${
      isActive
        ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
        : ''
    }`;

  const buttonClass = `font-semibold transition-all duration-300 rounded-xl px-4 py-2 text-white hover:bg-white/10 hover:text-[var(--yellow)]`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-[#2d6a4f] backdrop-blur-lg shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">

          {/* Logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex h-full items-center cursor-pointer">
            <img
              src="/img/logo-white.png"
              alt="Staybridge London"
              className="h-20 w-auto object-contain md:h-[86px]"
              style={{ mixBlendMode: 'screen' }}
            />
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end onClick={handleLogoClick} className={navLinkClass}>
              Início
            </NavLink>

            <NavLink to="/properties" className={navLinkClass}>
              Unidades
            </NavLink>

            <button
              onClick={() => { navigate('/'); setTimeout(() => scrollToSection('benefits'), 300); }}
              className={buttonClass}
            >
              Benefícios
            </button>

            <button
              onClick={handleWhatsApp}
              className="bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-green-700 bg-[#2d6a4f]">
            <nav className="flex flex-col gap-4">
              <NavLink
                to="/"
                end
                onClick={handleLogoClick}
                className={({ isActive }) =>
                  `text-left font-semibold transition-all duration-300 rounded-xl px-4 py-3 ${
                    isActive
                      ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
                      : 'text-white hover:bg-white/10 hover:text-[var(--yellow)]'
                  }`
                }
              >
                Início
              </NavLink>

              <NavLink
                to="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-left font-semibold transition-all duration-300 rounded-xl px-4 py-3 ${
                    isActive
                      ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
                      : 'text-white hover:bg-white/10 hover:text-[var(--yellow)]'
                  }`
                }
              >
                Unidades
              </NavLink>

              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); setTimeout(() => scrollToSection('benefits'), 300); }}
                className="text-left font-semibold text-white hover:bg-white/10 hover:text-[var(--yellow)] transition-all duration-300 rounded-xl px-4 py-3"
              >
                Benefícios
              </button>

              <button
                onClick={handleWhatsApp}
                className="bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
