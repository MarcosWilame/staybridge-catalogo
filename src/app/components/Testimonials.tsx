import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Maria Silva',
    role: 'Estudante em Londres',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    text: 'Encontrei meu studio perfeito em North London. O atendimento em português fez toda diferença! Bills inclusas e entrada imediata.',
    rating: 5,
  },
  {
    name: 'João Santos',
    role: 'Profissional de TI',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    text: 'Processo super rápido e seguro. Em 3 dias já estava morando no meu flat em East London. Equipe muito atenciosa e profissional.',
    rating: 5,
  },
  {
    name: 'Ana Costa',
    role: 'Au Pair',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    text: 'Melhor experiência! Me ajudaram com todo o processo desde o Brasil. O ensuite que aluguei é exatamente como nas fotos.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-white py-12 md:py-20">
      {/* Diagonal decorative element */}
      <div className="absolute bottom-0 right-0 w-2/3 h-96 bg-gradient-to-tl from-[var(--yellow)]/10 via-transparent to-transparent transform skew-y-2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-10 text-center md:mb-16">
          <div className="mb-4 inline-block rounded-full bg-[var(--green-dark)] px-4 py-2 text-xs font-bold text-white md:text-sm">
            DEPOIMENTOS
          </div>
          <h2 className="mb-4 text-3xl font-bold leading-tight text-[var(--green-dark)] md:text-5xl">
            O que nossos clientes
            <br />
            <span className="text-[var(--yellow)]">estão dizendo</span>
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-xl border-2 border-[var(--gray-medium)] bg-gradient-to-br from-[var(--gray-light)] to-white p-5 shadow-lg transition-all duration-300 hover:border-[var(--green-dark)] hover:shadow-2xl md:rounded-2xl md:p-8"
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 opacity-10">
                <Quote className="h-12 w-12 text-[var(--green-dark)] md:h-16 md:w-16" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[var(--yellow)] text-[var(--yellow)]" />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[var(--green-dark)]"
                />
                <div>
                  <div className="font-bold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
