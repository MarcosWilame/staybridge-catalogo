import { NavLink } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';

export function MobileBottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Inicio', end: true },
    { path: '/properties', icon: Search, label: 'Buscar' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-2xl md:hidden">
      <div className="grid grid-cols-3 items-stretch pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => {
                if (item.path === '/') {
                  setTimeout(scrollToPageTop, 0);
                }
              }}
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
