import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ListingPage } from './pages/ListingPage';
import { PropertyDetailsPage } from "./pages/PropertyDetailsPage";

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {  path: "/property/:id",
  element: <PropertyDetailsPage /> }
]);