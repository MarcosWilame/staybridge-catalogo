import { Link } from 'react-router-dom';

const questions = [
  {
    question: 'Quais tipos de acomodação estão disponíveis em Londres?',
    answer: 'O catálogo reúne quartos, ensuites, studios e apartamentos. Use os filtros para comparar região, preço semanal, capacidade e data de entrada.',
  },
  {
    question: 'As contas estão incluídas no aluguel?',
    answer: 'Algumas unidades incluem bills. Essa informação aparece no anúncio e também pode ser selecionada como filtro no catálogo.',
  },
  {
    question: 'Posso receber atendimento em português?',
    answer: 'Sim. A equipe atende brasileiros e outros interessados em português pelo WhatsApp durante a busca e a reserva.',
  },
  {
    question: 'Posso procurar acomodação antes de chegar a Londres?',
    answer: 'Sim. Você pode consultar fotos, detalhes, localização aproximada e disponibilidade online e falar com a equipe antes da mudança.',
  },
];

export function HomeSeoContent() {
  return (
    <section id="faq" className="scroll-mt-24 bg-[#f7f7f0] py-12 md:py-16" aria-labelledby="london-accommodation-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-[var(--green-medium)]">
            London accommodation for Brazilians and international renters
          </p>
          <h2 id="london-accommodation-title" className="text-3xl font-extrabold leading-tight text-[var(--green-dark)] md:text-4xl">
            Aluguel de quartos, ensuites, studios e apartamentos em Londres
          </h2>
          <p className="mt-5 leading-relaxed text-gray-700">
            Encontre acomodação em Londres com informações claras sobre valor semanal,
            bills, disponibilidade e região. Compare opções para curta ou longa permanência
            e converse em português com uma equipe que conhece as dúvidas de quem está
            chegando ao Reino Unido.
          </p>
          <p className="mt-4 leading-relaxed text-gray-700" lang="en">
            Looking for a room, ensuite, studio or flat in London? Browse available homes,
            compare weekly prices and move-in dates, and get support in Portuguese.
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
              <details key={item.question} className="group rounded-xl border border-[var(--surface-border)] bg-white p-4 shadow-sm">
                <summary className="cursor-pointer list-none pr-6 font-bold text-gray-900 marker:hidden">
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
