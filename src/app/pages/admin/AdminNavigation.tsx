import { CalendarRange, Building2, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export function AdminNavigation({ trashCount }: { trashCount: number }) {
  const location = useLocation();
  const items = [
    { to: '/admin', label: 'Visão geral', icon: CalendarRange, exact: true },
    { to: '/admin/properties', label: 'Imóveis', icon: Building2 },
    { to: '/admin/new', label: 'Novo cadastro', icon: Plus },
    { to: '/admin/library', label: 'Biblioteca', icon: FolderOpen },
    { to: '/admin/trash', label: 'Lixeira', icon: Trash2, count: trashCount },
  ];

  return (
    <nav className="border-y border-[var(--surface-border)] bg-white lg:sticky lg:top-24 lg:self-start lg:border">
      <div className="flex gap-1 overflow-x-auto p-2 lg:grid lg:overflow-visible">
        {items.map(({ to, label, icon: Icon, exact, count }) => {
          const isActive = exact
            ? location.pathname === '/admin' || location.pathname === '/admin/'
            : location.pathname.startsWith(to) ||
              (to === '/admin/new' && location.pathname.startsWith('/admin/edit/'));

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={`flex min-w-max items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition lg:min-w-0 ${
                isActive
                  ? 'bg-[var(--green-dark)] text-white'
                  : 'text-gray-700 hover:bg-[var(--gray-light)] hover:text-[var(--green-dark)]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {count ? (
                <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-white/20' : 'bg-gray-100'}`}>
                  {count}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
