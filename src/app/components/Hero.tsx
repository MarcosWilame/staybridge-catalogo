import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEvent, trackWhatsAppClick } from '../utils/analytics';
import { WhatsAppIcon } from './WhatsAppIcon';

export function Hero() {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    trackWhatsAppClick('hero');
    window.open('https://wa.me/5588997993046', '_blank');
  };

  const goToProperties = () => {
    trackEvent('view_units_click', {
      source: 'hero',
    });
    navigate('/unidades');
  };

  return (
    <div id="hero" className="relative flex min-h-[calc(100svh-6rem)] items-center overflow-hidden md:min-h-[90vh]">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="/img/pexels-shambadatta-33257244.jpg"
          alt="Rua residencial em Londres"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color1)]/90 via-[var(--color2)]/62 to-[var(--color1)]/24" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--green-dark)]/70 via-transparent to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-16 lg:px-8">
        <div className="max-w-3xl">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 break-words text-4xl leading-[0.98] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.7)] sm:text-6xl lg:text-7xl"
          >
            Moradia em Londres,
            <span className="block text-[var(--yellow)]">
              sem complicação
            </span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 max-w-2xl text-base leading-relaxed text-white/95 drop-shadow-[0_3px_12px_rgba(0,0,0,0.7)] sm:text-xl"
          >
            Studios, ensuites e flats prontos para entrar, com bills inclusas,
            atendimento em português e suporte do primeiro contato até a chave.
          </motion.p>

          {/* BUTTONS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <button
              onClick={goToProperties}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-6 py-3.5 font-bold text-black shadow-xl shadow-black/20 transition-all hover:bg-[var(--yellow-dark)] hover:scale-[1.02] sm:w-auto sm:px-8 sm:py-4"
            >
              Ver unidades
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--whatsapp)] px-6 py-3.5 font-bold text-[var(--whatsapp-foreground)] shadow-lg shadow-[rgba(37,211,102,0.22)] transition-all hover:scale-[1.02] hover:bg-[var(--whatsapp-hover)] sm:w-auto sm:px-8 sm:py-4"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Falar no WhatsApp
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-white/90"
          >
            <span>Bills inclusas</span>
            <span className="text-[var(--yellow)]">·</span>
            <span>Entrada imediata</span>
            <span className="text-[var(--yellow)]">·</span>
            <span>Atendimento em português</span>
          </motion.div>
        </div>
      </div>

      {/* DECOR */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[image:linear-gradient(180deg,rgba(36,55,87,0)_0%,rgba(36,55,87,0.7)_100%)]" />
    </div>
  );
}
