import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/properties', element: <ListingPage /> }
]);