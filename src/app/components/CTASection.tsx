import { useNavigate } from 'react-router';
import { MessageCircle, ArrowRight } from 'lucide-react';

export function CTASection() {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open('https://wa.me/447000000000', '_blank');
  };

  const goToProperties = () => {
    navigate('/properties');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-[var(--green-dark)] to-[var(--green-medium)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--yellow)]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          {/* Brush Stroke Title */}
          <div className="mb-6 relative inline-block">
            <h2 className="text-4xl md:text-6xl font-bold text-white relative z-10">
              Pronto para se Mudar?
            </h2>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="16"
              viewBox="0 0 400 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 13C100 3 300 3 397 13"
                stroke="var(--yellow)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Fale com nossa equipe em português agora e garanta sua acomodação em Londres.
            <br />
            <strong className="text-[var(--yellow)]">Entrada imediata disponível!</strong>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleWhatsApp}
              className="group bg-[var(--yellow)] hover:bg-[var(--yellow-dark)] text-black px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <MessageCircle className="w-6 h-6" />
              Falar no WhatsApp Agora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={goToProperties}
              className="group bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/40 px-10 py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3"
            >
              Ver Todas as Unidades
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full animate-pulse" />
              <span className="text-sm">Resposta em minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full animate-pulse" />
              <span className="text-sm">Sem taxas escondidas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[var(--yellow)] rounded-full animate-pulse" />
              <span className="text-sm">Equipe brasileira</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
