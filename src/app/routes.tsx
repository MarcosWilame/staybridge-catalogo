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
    <Suspense
      fallback={
        <section
          className="min-h-[70vh] bg-white px-4 pb-16 pt-28 sm:px-6 sm:pt-32"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="mx-auto max-w-6xl" role="status">
            <div className="mb-8 max-w-xl">
              <div className="mb-4 h-3 w-28 animate-pulse rounded-full bg-[var(--green-light)]" />
              <div className="mb-3 h-9 w-full max-w-md animate-pulse rounded-xl bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />
            </div>
            <p className="mb-5 text-sm font-semibold text-[var(--green-dark)]">
              Carregando conteúdo…
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                  <div className="aspect-[4/3] animate-pulse bg-gray-100" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 animate-pulse rounded-full bg-gray-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }
    >
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
