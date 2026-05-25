import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ScrollToTop } from '../components/ScrollToTop'


export function RootLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileBottomNav />
      <>
        <ScrollToTop />
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
      </>
    </div>
  );
}
