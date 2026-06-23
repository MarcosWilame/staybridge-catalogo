import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';

const CHUNK_RELOAD_KEY = 'staybridge:chunk-reload';

function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  return /failed to fetch dynamically imported module|importing a module script failed|loading chunk|chunkloaderror/i.test(message);
}

function handleChunkLoadError(error: unknown): Promise<never> {
  if (
    typeof window !== 'undefined' &&
    isChunkLoadError(error) &&
    window.sessionStorage.getItem(CHUNK_RELOAD_KEY) !== '1'
  ) {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, '1');
    window.location.reload();
    return new Promise(() => {});
  }

  throw error;
}

function lazyRoute<T extends ComponentType>(loader: () => Promise<{ default: T }>) {
  return lazy(() =>
    loader()
      .then((module) => {
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
        }
        return module;
      })
      .catch(handleChunkLoadError)
  );
}

const ListingPage = lazyRoute(() =>
  import('./pages/ListingPage').then((module) => ({ default: module.ListingPage }))
);
const PropertyDetailsPage = lazyRoute(() =>
  import('./pages/PropertyDetailsPage').then((module) => ({ default: module.PropertyDetailsPage }))
);
const ProfilePage = lazyRoute(() =>
  import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage }))
);
const NotFoundPage = lazyRoute(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

const AdminPage = lazyRoute(() =>
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
