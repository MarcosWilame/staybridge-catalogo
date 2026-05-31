import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Camila R.',
    role: 'Mora em Stratford',
    initials: 'CR',
    text: 'Eu precisava entrar rápido e tinha medo de fechar algo de longe. A equipe mostrou a casa por vídeo, explicou as contas e no dia combinado estava tudo pronto.',
    rating: 5,
  },
  {
    name: 'Rafael M.',
    role: 'Mora em Willesden',
    initials: 'RM',
    text: 'Gostei porque as informações bateram com a visita. Preço, depósito, transporte perto e regras da casa foram explicados antes de eu decidir.',
    rating: 5,
  },
  {
    name: 'Juliana P.',
    role: 'Mora em Croydon',
    initials: 'JP',
    text: 'Cheguei em Londres sem conhecer muita coisa. Ter atendimento em português ajudou demais, principalmente para entender contrato e mudança.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-[var(--green-light)] py-14 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10 text-center md:mb-16">
          <div className="mb-4 inline-flex rounded-full bg-[#143725] px-4 py-2 text-xs font-bold text-white md:text-sm">
            DEPOIMENTOS
          </div>
          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-[#143725] md:text-5xl">
            Histórias de quem
            <br />
            <span className="text-[#0f8f5f]">já se mudou</span>
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600 md:text-lg">
            Relatos curtos, sem exagero, de brasileiros que encontraram moradia em Londres.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative rounded-lg border border-gray-200 bg-[#fbfcfa] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#0f8f5f]/40 hover:shadow-lg md:p-7"
            >
              <div className="absolute right-5 top-5 text-[#d8e3d5]">
                <Quote className="h-10 w-10" />
              </div>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#f4c542] text-[#f4c542]" />
                ))}
              </div>

              <p className="mb-6 min-h-32 text-gray-700 leading-relaxed">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#143725] text-sm font-bold text-white">
                  {testimonial.initials}
                </div>
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
