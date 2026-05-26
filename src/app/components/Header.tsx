import { useState, useEffect, type MouseEvent } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 4);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsScrolled(window.scrollY > 4);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const scrollToPageTop = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  const goHomeAndScrollTop = () => {
    setIsMobileMenuOpen(false);

    if (!isHome) {
      navigate('/');
      setTimeout(scrollToPageTop, 100);
      return;
    }

    scrollToPageTop();
  };

  const handleLogoClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    goHomeAndScrollTop();
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/447000000000', '_blank');
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-[#2d6a4f] backdrop-blur-lg shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <NavLink to="/" onClick={handleLogoClick} className="flex h-full items-center cursor-pointer">
            <img
              src="/img/logo-white.png"
              alt="Staybridge London"
              className={`h-16 w-auto object-contain md:h-[68px] ${
                isTransparent ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]' : ''
              }`}
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
              onClick={() => { navigate('/'); setTimeout(() => scrollToSection('benefits'), 100); }}
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
            className={`md:hidden p-2 rounded-lg transition-colors text-white ${
              isTransparent ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.75)]' : ''
            }`}
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
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); setTimeout(() => scrollToSection('benefits'), 100); }}
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
