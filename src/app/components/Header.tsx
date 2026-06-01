import { useState, useEffect, type MouseEvent } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Building2, Heart, Home, Menu, ShieldCheck, X } from 'lucide-react';
import { trackWhatsAppClick } from '../utils/analytics';
import { WhatsAppIcon } from './WhatsAppIcon';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
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
    trackWhatsAppClick(isMobileMenuOpen ? 'header_mobile' : 'header_desktop');
    window.open('https://wa.me/5588997993046', '_blank');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-[var(--yellow)] ${
      isActive
        ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
        : ''
    }`;

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-3 transition-all duration-500 sm:px-6 lg:px-8">
      <div
        className={`mx-auto max-w-7xl rounded-lg border px-4 shadow-[var(--surface-shadow-strong)] backdrop-blur-xl transition-all duration-500 sm:px-5 ${
          isTransparent
            ? 'border-white/20 bg-[rgba(36,55,87,0.66)]'
            : 'border-[var(--surface-border)] bg-[rgba(36,55,87,0.96)]'
        }`}
      >
        <div className="flex h-14 items-center justify-between md:h-16">

          {/* Logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex h-full items-center cursor-pointer">
            <img
              src="/img/logobedminster.png"
              alt="Bedminster London"
              className="h-12 w-auto object-contain md:h-14"
              style={{ mixBlendMode: 'screen' }}
            />
          </NavLink>

          {isAdmin ? (
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2 py-2 text-sm font-bold text-white ring-1 ring-white/15 sm:px-3">
                <ShieldCheck className="h-4 w-4 text-[var(--yellow)]" />
                Admin
              </span>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--yellow)] px-3 py-2 text-sm font-black text-black transition-all duration-300 hover:bg-[var(--yellow-dark)] sm:px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar ao site</span>
                <span className="sm:hidden">Site</span>
              </button>
            </div>
          ) : (
          <>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" end onClick={handleLogoClick} className={navLinkClass}>
              <Home className="h-4 w-4" />
              Início
            </NavLink>

            <NavLink to="/unidades" className={navLinkClass}>
              <Building2 className="h-4 w-4" />
              Unidades
            </NavLink>

            <NavLink
              to="/favorites"
              className={navLinkClass}
            >
              <Heart className="h-4 w-4" />
              Favoritos
            </NavLink>

            <button
              onClick={handleWhatsApp}
              className="ml-2 flex items-center gap-2 rounded-lg bg-[var(--whatsapp)] px-5 py-2.5 text-sm font-black text-[var(--whatsapp-foreground)] transition-all duration-300 hover:bg-[var(--whatsapp-hover)]"
            >
              <WhatsAppIcon className="w-4 h-4" />
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
          </>
          )}
        </div>

        {/* Mobile Menu */}
        {!isAdmin && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-[var(--green-dark)]">
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
                <span className="inline-flex items-center gap-2">
                  <Home className="h-4 w-4" />
                Início
                </span>
              </NavLink>

              <NavLink
                to="/unidades"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-left font-semibold transition-all duration-300 rounded-xl px-4 py-3 ${
                    isActive
                      ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
                      : 'text-white hover:bg-white/10 hover:text-[var(--yellow)]'
                  }`
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                Unidades
                </span>
              </NavLink>

              <NavLink
                to="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-left font-semibold transition-all duration-300 rounded-xl px-4 py-3 ${
                    isActive
                      ? 'bg-white/15 text-[var(--yellow)] shadow-lg shadow-black/20 ring-1 ring-white/20'
                      : 'text-white hover:bg-white/10 hover:text-[var(--yellow)]'
                  }`
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Favoritos
                </span>
              </NavLink>

              <button
                onClick={handleWhatsApp}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--whatsapp)] px-6 py-3 font-bold text-[var(--whatsapp-foreground)] transition-all duration-300 hover:bg-[var(--whatsapp-hover)]"
              >
                <WhatsAppIcon className="w-4 h-4" />
                WhatsApp
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
