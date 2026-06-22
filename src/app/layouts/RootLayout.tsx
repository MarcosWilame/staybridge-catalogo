import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { WhatsAppButton } from '../components/WhatsAppButton';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ScrollToTop } from '../components/ScrollToTop';
import { Analytics } from '../components/Analytics';

export function RootLayout() {
  return (
    <>
      <Analytics />

      <div className="min-h-screen bg-white">
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-3 font-bold text-[var(--green-dark)] shadow-xl transition-transform focus:translate-y-0"
        >
          Pular para o conteúdo principal
        </a>
        <ScrollToTop />
        <Header />

        <main id="main-content" tabIndex={-1}>
          <Outlet />
        </main>

        <Footer />
        <WhatsAppButton />
        <MobileBottomNav />
      </div>
    </>
  );
}
