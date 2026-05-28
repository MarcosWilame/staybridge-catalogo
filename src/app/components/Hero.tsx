import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open('https://wa.me/5588997993046', '_blank');
  };

  const goToProperties = () => {
    navigate('/properties');
  };

  return (
    <div id="hero" className="relative flex min-h-[calc(100svh-5rem)] items-center overflow-hidden md:min-h-[90vh]">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1520986606214-8b456906c813?auto=format&fit=crop&w=1920&q=85"
          alt="Vista clara e aconchegante de Londres durante o dia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07140f]/86 via-[#173627]/48 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/40 via-transparent to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-16 lg:px-8">
        <div className="max-w-3xl">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-5 break-words text-4xl font-bold leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)] sm:text-6xl lg:text-7xl"
          >
            Sua Nova
            <br />
            <span className="relative inline-block">
              Acomodação
              <svg
                className="absolute -bottom-2 left-0 w-full"
                height="12"
                viewBox="0 0 300 12"
                fill="none"
              >
                <path
                  d="M2 10C80 2 220 2 298 10"
                  stroke="var(--yellow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <br />
            <span className="text-[var(--yellow)]">em Londres</span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-7 inline-block rounded-xl bg-black/35 px-4 py-3 text-base leading-relaxed text-white shadow-lg backdrop-blur-[2px] sm:text-xl"
          >
            Studios, ensuites e flats prontos para você morar.
            <br />
            <strong className="text-[var(--yellow)]">
              Atendimento em português
            </strong>{' '}
            e entrada imediata.
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
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-6 py-3.5 font-semibold text-black transition-all hover:bg-[var(--yellow-dark)] hover:scale-105 sm:w-auto sm:px-8 sm:py-4"
            >
              Ver Unidades
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:w-auto sm:px-8 sm:py-4"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </button>
          </motion.div>

          {/* TRUST */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap gap-2 text-sm text-white sm:mt-12 sm:gap-3"
          >
            <div className="flex items-center gap-2 rounded-full bg-black/28 px-3 py-2 backdrop-blur-[2px]">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full" />
              <span>Contratos seguros</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/28 px-3 py-2 backdrop-blur-[2px]">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full" />
              <span>Bills inclusas</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/28 px-3 py-2 backdrop-blur-[2px]">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full" />
              <span>Entrada imediata</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* DECOR */}
      <div className="absolute bottom-0 right-0 w-1/3 h-64 bg-gradient-to-tl from-[var(--green-dark)]/30 to-transparent pointer-events-none" />
    </div>
  );
}