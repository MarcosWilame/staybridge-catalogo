import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';

const ListingPage = lazy(() =>
  import('./pages/ListingPage').then((module) => ({ default: module.ListingPage }))
);
const PropertyDetailsPage = lazy(() =>
  import('./pages/PropertyDetailsPage').then((module) => ({ default: module.PropertyDetailsPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

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

function DeferredRoute({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-white" aria-busy="true" />}>
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/properties', element: <DeferredRoute><ListingPage /></DeferredRoute> },
      { path: '/property/:id', element: <DeferredRoute><PropertyDetailsPage /></DeferredRoute> },
      { path: '/profile', element: <DeferredRoute><ProfilePage /></DeferredRoute> },
      { path: '/admin/*', element: <AdminRoute /> },
      { path: '*', element: <DeferredRoute><NotFoundPage /></DeferredRoute> },
    ],
  },
]);
