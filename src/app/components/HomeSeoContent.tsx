import { Link } from 'react-router-dom';

const questions = [
  {
    question: 'Quais tipos de acomodação estão disponíveis em Londres?',
    answer: 'O catálogo reúne Rooms, Ensuites, Studios e Flats. Use os filtros para comparar região, preço semanal, capacidade e data de entrada.',
  },
  {
    question: 'As bills estão inclusas no aluguel?',
    answer: 'Algumas unidades têm Bills inclusas. Essa informação aparece no anúncio e também pode ser selecionada como filtro no catálogo.',
  },
  {
    question: 'Posso receber atendimento em mais de um idioma?',
    answer: 'Sim. A equipe oferece suporte em português e inglês pelo WhatsApp durante a busca e a reserva.',
  },
  {
    question: 'Posso procurar acomodação antes de chegar a Londres?',
    answer: 'Sim. Você pode consultar fotos, detalhes, localização aproximada e disponibilidade online e falar com a equipe antes da mudança.',
  },
];

export function HomeSeoContent() {
  return (
    <section id="faq" className="reveal-section scroll-mt-24 bg-[#f7f7f0] py-14 md:py-20" aria-labelledby="london-accommodation-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div>
          <p className="mb-3 text-xs font-black uppercase tracking-[.14em] text-[var(--green-medium)]">
            Moradia em Londres
          </p>
          <h2 id="london-accommodation-title" className="text-3xl font-extrabold leading-tight text-[var(--green-dark)] md:text-4xl">
            Encontre sua acomodação em Londres
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-gray-700">
            Compare Rooms, Ensuites, Studios e Flats por preço, região e disponibilidade — com atendimento personalizado.
          </p>
          <Link
            to="/properties"
            className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--green-dark)] px-5 py-3 font-bold text-white transition hover:bg-[var(--green-medium)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green-dark)]"
          >
            Explorar acomodações em Londres
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-[var(--green-dark)]">Perguntas frequentes</h2>
          <div className="mt-4 space-y-3">
            {questions.map((item) => (
              <details key={item.question} className="group rounded-2xl border border-[var(--surface-border)] bg-white p-5 shadow-[0_10px_30px_rgba(26,77,46,.06)] transition hover:border-[var(--green-dark)]/35 hover:shadow-[0_14px_38px_rgba(26,77,46,.10)]">
                <summary className="cursor-pointer list-none pr-6 font-black text-gray-900 marker:hidden">
                  {item.question}
                </summary>
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
