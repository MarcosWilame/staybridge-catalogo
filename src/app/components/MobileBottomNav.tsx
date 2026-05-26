import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

export function MobileBottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Início', end: true },
    { path: '/properties', icon: Search, label: 'Buscar' },
    { path: '/favorites', icon: Heart, label: 'Favoritos' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-2xl md:hidden">
      <div className="grid grid-cols-4 items-stretch pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `min-w-0 px-1 py-1.5 text-center text-xs transition-colors ${
                  isActive
                    ? 'text-yellow-500'
                    : 'text-gray-400 hover:text-yellow-500'
                }`
              }
            >
              <Icon className="mx-auto h-6 w-6" />
              <span className="mt-1 block truncate font-semibold leading-tight">
                {item.label}
              </span>
            </NavLink>
          );
        })}

      </div>
    </nav>
  );
}
