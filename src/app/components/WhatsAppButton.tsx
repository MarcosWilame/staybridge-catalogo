import { MessageCircle } from 'lucide-react';
import { motion } from "framer-motion";
import { trackWhatsAppClick } from '../utils/analytics';

export function WhatsAppButton() {
  const handleClick = () => {
    trackWhatsAppClick('floating_button');
    window.open('https://wa.me/5588997993046', '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      className="group fixed bottom-24 right-4 z-50 rounded-full bg-[#0f8f5f] p-3 text-white shadow-2xl transition-all duration-300 hover:bg-[#0b754f] hover:shadow-3xl md:bottom-6 md:right-6 md:p-4"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <MessageCircle className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12 md:h-8 md:w-8" />

      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Fale conosco no WhatsApp
        <div className="absolute left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-gray-900" />
      </div>

      {/* Pulse Animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-[#0f8f5f]"
        animate={{
          scale: [1, 1.5, 1.5],
          opacity: [0.7, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />
    </motion.button>
  );
}
