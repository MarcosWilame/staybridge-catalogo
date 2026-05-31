import { useNavigate } from 'react-router-dom';
import { ArrowRight, BedDouble, Bolt, Home, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { trackEvent, trackWhatsAppClick } from '../utils/analytics';

const heroBenefits = [
  {
    icon: BedDouble,
    title: 'Studios e ensuites',
    description: 'Opções para todos os perfis e orçamentos.',
    tone: 'bg-[#dbe7ff] text-[#2563eb]',
  },
  {
    icon: Bolt,
    title: 'Entrada imediata',
    description: 'Chegou em Londres? Resolva em até 24h.',
    tone: 'bg-[#ccf3dc] text-[#14532d]',
  },
  {
    icon: Home,
    title: 'Fala nossa língua',
    description: 'Suporte 100% em português.',
    tone: 'bg-[#fff1bf] text-[#9a6a12]',
  },
];

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
    <section id="hero" className="relative overflow-hidden bg-[#f4f1eb] pt-28 md:pt-32">
      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-8rem)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-16 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(300px,0.72fr)] md:gap-16 md:pb-20 lg:px-8">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex flex-wrap gap-3"
          >
            <span className="rounded-full bg-[#dbe7ff] px-4 py-2 text-xs font-extrabold text-[#2563eb]">
              BR PT-BR
            </span>
            <span className="rounded-full bg-[#ccf3dc] px-4 py-2 text-xs font-extrabold text-[#14532d]">
              Contas inclusas
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 max-w-3xl break-words font-['Syne'] text-[clamp(3.35rem,8.8vw,7.2rem)] font-extrabold leading-[0.88] tracking-normal text-[#111]"
          >
            Moradia em <span className="text-[#2563eb]">Londres</span> sem complicar.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 max-w-2xl text-base leading-relaxed text-[#605b54] sm:text-xl"
          >
            Studios, ensuites e flats prontos para entrar, com bills inclusas,
            atendimento em português e suporte do primeiro contato até a chave.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <button
              onClick={goToProperties}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563eb] px-6 py-3.5 font-bold text-white shadow-xl shadow-[#2563eb]/20 transition-all hover:scale-[1.02] hover:bg-[#1d4ed8] sm:w-auto sm:px-8 sm:py-4"
            >
              Ver unidades
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-6 py-3.5 font-bold text-[#111] shadow-lg shadow-black/5 transition-all hover:scale-[1.02] hover:border-[#2563eb]/30 sm:w-auto sm:px-8 sm:py-4"
            >
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-[#605b54]"
          >
            <span>Bills inclusas</span>
            <span className="text-[#2563eb]">·</span>
            <span>Entrada imediata</span>
            <span className="text-[#2563eb]">·</span>
            <span>Atendimento em português</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid gap-4"
        >
          {heroBenefits.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="grid min-h-[104px] grid-cols-[54px_1fr] items-center gap-4 rounded-lg border border-white/80 bg-white/85 p-5 shadow-[0_18px_36px_rgba(17,17,17,0.06)] backdrop-blur"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="mb-1 font-['Syne'] text-base font-extrabold leading-tight text-[#111]">
                    {item.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-[#6f6a62]">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
