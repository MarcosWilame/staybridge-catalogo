import { Link, useLocation } from 'react-router';
import { Home, Search, Heart, User } from 'lucide-react';

export function MobileBottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/properties', icon: Search, label: 'Buscar' },
    { path: '/favorites', icon: Heart, label: 'Favoritos' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive
                  ? 'text-[var(--green-dark)]'
                  : 'text-gray-500 hover:text-[var(--green-dark)]'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
