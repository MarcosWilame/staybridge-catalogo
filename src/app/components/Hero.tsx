import { useNavigate } from 'react-router';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

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
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1519773483179-fa089c182a4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920"
          alt="Big Ben London at night"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/85 to-[#0a0a0a]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/90 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl">
          {/* Logo/Brand */}
          <motion.div
            className="mb-6 inline-block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                xmlns="http://www.w3.org/2000/svg"
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

          <motion.p
            className="text-xl text-gray-300 mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Studios, ensuites e flats prontos para você morar.
            <br />
            <strong className="text-[var(--yellow)]">Atendimento em português</strong> e entrada imediata.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button
              onClick={goToProperties}
              className="group bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Ver Unidades
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleWhatsApp}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="mt-12 flex flex-wrap gap-6 text-sm text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full" />
              <span>Contratos seguros</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full" />
              <span>Bills inclusas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full" />
              <span>Entrada imediata</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 right-0 w-1/3 h-64 bg-gradient-to-tl from-[var(--green-dark)]/30 to-transparent pointer-events-none" />
    </div>
  );
}
