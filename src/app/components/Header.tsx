import { useState, useEffect, type MouseEvent } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { BrandLogo } from './BrandLogo';

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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

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

  const handleCatalogClick = () => {
    trackEvent('properties_cta_click', {
      source: isMobileMenuOpen ? 'mobile_header' : 'desktop_header',
    });
    setIsMobileMenuOpen(false);
    navigate('/properties');
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
          : 'border-b border-white/10 bg-[#153d2b]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(7,30,20,.20)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between md:h-24">

          {/* Logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex h-full items-center cursor-pointer" aria-label="Staybridge London — início">
            <BrandLogo className="h-20 w-32 sm:w-36 md:h-24 md:w-44" priority />
          </NavLink>

          {/* Desktop Navigation */}
          <nav aria-label="Navegação principal" className="hidden items-center gap-2 md:flex">
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
              onClick={handleCatalogClick}
              className="flex items-center gap-2 rounded-xl bg-[var(--yellow)] px-6 py-3 font-black text-[#102c20] shadow-[0_8px_24px_rgba(244,208,63,.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--yellow-dark)]"
            >
              <Search className="w-4 h-4" />
              Buscar imóveis
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className="md:hidden p-2 rounded-lg transition-colors text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-navigation" className="md:hidden py-4 border-t border-green-700 bg-[#2d6a4f]">
            <nav aria-label="Navegação mobile" className="flex flex-col gap-4">
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
                onClick={handleCatalogClick}
                className="bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <Search className="w-4 h-4" />
                Buscar imóveis
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
