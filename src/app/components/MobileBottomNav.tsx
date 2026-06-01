import { NavLink } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';

export function MobileBottomNav() {
  const navItems = [
    { path: '/', icon: Home, label: 'Início', end: true },
    { path: '/unidades', icon: Search, label: 'Buscar' },
    { path: '/favorites', icon: Heart, label: 'Favoritos' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--surface-border)] bg-white/95 shadow-2xl backdrop-blur md:hidden">
      <div className="grid grid-cols-4 items-stretch pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">

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
                    ? 'text-[var(--green-dark)]'
                    : 'text-gray-400 hover:text-[var(--green-dark)]'
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
