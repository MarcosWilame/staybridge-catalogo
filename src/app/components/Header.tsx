import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Header transparente só na home sem scroll
  const isTransparent = isHome && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reseta scroll state ao mudar de página
  useEffect(() => {
    setIsScrolled(window.scrollY > 20);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const handleWhatsApp = () => {
    window.open('https://wa.me/447000000000', '_blank');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `font-semibold transition-colors ${
      isTransparent
        ? 'text-white hover:text-[var(--yellow)]'
        : 'text-gray-700 hover:text-[var(--green-dark)]'
    } ${
      isActive
        ? isTransparent
          ? 'border-b-2 border-[var(--yellow)] pb-0.5 text-[var(--yellow)]'
          : 'border-b-2 border-[var(--green-dark)] pb-0.5 text-[var(--green-dark)]'
        : ''
    }`;

  const buttonClass = `font-semibold transition-colors ${
    isTransparent
      ? 'text-white hover:text-[var(--yellow)]'
      : 'text-gray-700 hover:text-[var(--green-dark)]'
  }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-lg shadow-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <NavLink to="/" className="font-bold text-lg tracking-wider cursor-pointer transition-colors">
            <span className="bg-[var(--green-dark)] text-white px-4 py-2 rounded-lg">
              STAYBRIDGE
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>
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
              onClick={() => { navigate('/'); setTimeout(() => scrollToSection('testimonials'), 100); }}
              className={buttonClass}
            >
              Depoimentos
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
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isTransparent ? 'text-white' : 'text-[var(--green-dark)]'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col gap-4">
              <NavLink
                to="/"
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-left font-semibold transition-colors ${
                    isActive ? 'text-[var(--green-dark)]' : 'text-gray-700 hover:text-[var(--green-dark)]'
                  }`
                }
              >
                Início
              </NavLink>

              <NavLink
                to="/properties"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `text-left font-semibold transition-colors ${
                    isActive ? 'text-[var(--green-dark)]' : 'text-gray-700 hover:text-[var(--green-dark)]'
                  }`
                }
              >
                Unidades
              </NavLink>

              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); setTimeout(() => scrollToSection('benefits'), 100); }}
                className="text-left font-semibold text-gray-700 hover:text-[var(--green-dark)] transition-colors"
              >
                Benefícios
              </button>

              <button
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); setTimeout(() => scrollToSection('testimonials'), 100); }}
                className="text-left font-semibold text-gray-700 hover:text-[var(--green-dark)] transition-colors"
              >
                Depoimentos
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