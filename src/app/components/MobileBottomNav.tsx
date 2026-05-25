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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-2xl">
      <div className="flex items-center justify-around py-2">

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 transition-colors text-xs ${
                  isActive
                    ? 'text-yellow-500'
                    : 'text-gray-400 hover:text-yellow-500'
                }`
              }
            >
              <Icon size={22} />
              <span className="font-semibold">{item.label}</span>
            </NavLink>
          );
        })}

      </div>
    </nav>
  );
}