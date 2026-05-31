import { useState, useEffect, type MouseEvent } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Menu, MessageCircle, X } from 'lucide-react';
import { trackWhatsAppClick } from '../utils/analytics';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

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
    `rounded-lg px-4 py-2 font-semibold text-[#111] transition-all duration-300 hover:bg-[#2563eb]/10 hover:text-[#2563eb] ${
      isActive ? 'bg-[#2563eb]/10 text-[#2563eb]' : ''
    }`;

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-[#f4f1eb]/90 shadow-sm backdrop-blur-xl transition-all duration-300 ${
        isScrolled ? 'bg-[#f4f1eb]/95' : ''
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between md:h-24">
          <NavLink to="/" onClick={handleLogoClick} className="flex h-full cursor-pointer items-center">
            <img
              src="/img/logobedminster.png"
              alt="Bedminster London"
              className="h-14 w-auto rounded-lg bg-[#14532d] object-contain p-1.5 md:h-16"
            />
          </NavLink>

          <nav className="hidden items-center gap-8 md:flex">
            <NavLink to="/" end onClick={handleLogoClick} className={navLinkClass}>
              Início
            </NavLink>

            <NavLink to="/unidades" className={navLinkClass}>
              Unidades
            </NavLink>

            <NavLink to="/favorites" className={navLinkClass}>
              Favoritos
            </NavLink>

            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 rounded-lg bg-[#2563eb] px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-[#1d4ed8]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </button>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-lg p-2 text-[#111] transition-colors hover:bg-black/5 md:hidden"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-black/10 bg-[#f4f1eb] py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <NavLink
                to="/"
                end
                onClick={handleLogoClick}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    isActive ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'text-[#111] hover:bg-black/5 hover:text-[#2563eb]'
                  }`
                }
              >
                Início
              </NavLink>

              <NavLink
                to="/unidades"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    isActive ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'text-[#111] hover:bg-black/5 hover:text-[#2563eb]'
                  }`
                }
              >
                Unidades
              </NavLink>

              <NavLink
                to="/favorites"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-left font-semibold transition-all duration-300 ${
                    isActive ? 'bg-[#2563eb]/10 text-[#2563eb]' : 'text-[#111] hover:bg-black/5 hover:text-[#2563eb]'
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
                className="flex items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#1d4ed8]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
