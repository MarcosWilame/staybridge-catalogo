import { useState, useEffect, type MouseEvent } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { BrandLogo } from './BrandLogo';
import { useLanguage } from '../i18n/LanguageContext';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  const isHome = location.pathname === '/';
  const isPropertyDetails = location.pathname.startsWith('/property/');
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(true);
      return;
    }

    setIsScrolled(false);

    let disconnectObserver: (() => void) | undefined;

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
      disconnectObserver = () => observer.disconnect();
      return true;
    };

    // Tenta imediatamente, se hero ainda não montou aguarda um frame
    if (tryObserve()) return () => disconnectObserver?.();

    const raf = requestAnimationFrame(() => {
      tryObserve();
    });

    return () => {
      cancelAnimationFrame(raf);
      disconnectObserver?.();
    };
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
    `rounded-xl px-4 py-2 font-semibold text-white transition-all duration-300 hover:text-[var(--yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--green-dark)] ${
      isActive
        ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
        : ''
    }`;

  const buttonClass = `rounded-xl px-4 py-2 font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:text-[var(--yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--green-dark)]`;
  const languageToggle = (
    <div
      className="flex w-fit items-center rounded-full border border-white/20 bg-white/10 p-1 text-xs font-black text-white"
      aria-label="Selecionar idioma"
      data-no-translate
    >
      {(['pt', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          aria-pressed={language === option}
          className={`min-h-11 min-w-11 rounded-full px-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-1 ${
            language === option
              ? 'bg-[var(--yellow)] text-[#102c20] shadow-sm'
              : 'hover:bg-white/10'
          }`}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );

  return (
    <header
      className={`premium-header fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isTransparent
          ? 'bg-transparent'
          : 'border-b border-white/10 bg-[var(--green-dark)]/95 backdrop-blur-xl shadow-[0_10px_35px_rgba(7,30,20,.20)]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between ${
            'h-14 md:h-20'
          }`}
        >

          {/* Logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex h-full items-center cursor-pointer" aria-label="Staybridge London — início">
            <BrandLogo
              className={
                isPropertyDetails
                  ? 'h-10 w-16 md:h-14 md:w-24'
                  : 'h-10 w-16 sm:h-12 sm:w-20 md:h-16 md:w-32'
              }
              imageClassName={isPropertyDetails ? '!top-[55%] !h-[170%]' : ''}
              priority
            />
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
              type="button"
              onClick={() => { navigate('/'); setTimeout(() => scrollToSection('benefits'), 300); }}
              className={buttonClass}
            >
              Benefícios
            </button>

            <button
              type="button"
              onClick={handleCatalogClick}
              className="premium-cta flex items-center gap-2 rounded-xl bg-[var(--yellow)] px-6 py-3 font-black text-[#102c20] shadow-[0_8px_24px_rgba(244,208,63,.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--yellow-dark)]"
            >
              <Search className="w-4 h-4" />
              Buscar imóveis
            </button>
            {languageToggle}
          </nav>

          {/* Mobile controls: language stays visible; secondary links remain in the menu. */}
          <div className="flex items-center gap-2 md:hidden">
            {languageToggle}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              className="min-h-11 min-w-11 rounded-lg p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)]"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-navigation" className="border-t border-white/10 bg-[var(--green-medium)] py-4 md:hidden">
            <nav aria-label="Navegação mobile" className="flex flex-col gap-2">
              <NavLink
                to="/"
                end
                onClick={handleLogoClick}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--green-medium)] ${
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
                  `rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--green-medium)] ${
                    isActive
                      ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
                      : 'text-white hover:bg-white/10 hover:text-[var(--yellow)]'
                  }`
                }
              >
                Unidades
              </NavLink>

              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); setTimeout(() => scrollToSection('benefits'), 300); }}
                className="rounded-xl px-4 py-3 text-left font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:text-[var(--yellow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--green-medium)]"
              >
                Benefícios
              </button>

              <button
                type="button"
                onClick={handleCatalogClick}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--yellow)] px-6 py-3 font-semibold text-black transition-all duration-300 hover:bg-[var(--yellow-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--yellow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--green-medium)]"
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
