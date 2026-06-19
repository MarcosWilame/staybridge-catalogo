import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

const AdminPage = lazy(() =>
  import('./pages/AdminPage').then((module) => ({ default: module.AdminPage }))
);

function AdminRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--gray-light)] px-4 pt-24">
          <div className="rounded-xl bg-white px-5 py-4 text-sm font-bold text-[var(--green-dark)] shadow-sm">
            Carregando admin...
          </div>
        </div>
      }
    >
      <AdminPage />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/properties', element: <ListingPage /> },
      { path: '/property/:id', element: <PropertyDetailsPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/admin/*', element: <AdminRoute /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
