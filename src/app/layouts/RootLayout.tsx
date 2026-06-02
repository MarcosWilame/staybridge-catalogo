import { Outlet, useLocation } from 'react-router-dom';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ScrollToTop } from '../components/ScrollToTop';
import { Analytics } from '../components/Analytics';

export function RootLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      <Analytics />
      <VercelAnalytics />

      <div className="min-h-screen bg-[image:var(--page-gradient)]">
        <ScrollToTop />
        <Header />

        <main>
          <Outlet />
        </main>

        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppButton />}
        {!isAdmin && <MobileBottomNav />}
      </div>
    </>
  );
}
