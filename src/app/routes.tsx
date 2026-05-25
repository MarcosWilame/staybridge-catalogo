import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { PropertyDetailsPage } from './pages/PropertyDetailsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'properties', Component: ListingPage },
      { path: 'property/:id', Component: PropertyDetailsPage },
      { path: 'favorites', Component: FavoritesPage },
      { path: 'profile', Component: ProfilePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
