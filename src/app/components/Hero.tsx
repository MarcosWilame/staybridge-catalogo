import { useNavigate } from 'react-router-dom';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open('https://wa.me/447000000000', '_blank');
  };

  const goToProperties = () => {
    navigate('/properties');
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">

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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="max-w-3xl">

          {/* TITLE */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)]"
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
            className="inline-block rounded-2xl bg-black/28 px-4 py-3 text-xl text-white mb-8 leading-relaxed shadow-lg backdrop-blur-[2px]"
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
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={goToProperties}
              className="group bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              Ver Unidades
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 backdrop-blur-sm transition-all"
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
            className="mt-12 flex flex-wrap gap-3 text-sm text-white"
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
