import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ScrollToTop } from '../components/ScrollToTop';
import { Analytics } from '../components/analytics';

export function RootLayout() {
  return (
    <>
      <Analytics />

      <div className="min-h-screen bg-white">
        <ScrollToTop />
        <Header />

        <main>
          <Outlet />
        </main>

        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
      </div>
    </>
  );
}