const termsSections = [
  {
    title: 'Natureza do serviço',
    body: 'A Bedminster London apresenta opções de acomodação em Londres e facilita o contato entre interessados, equipe de atendimento e responsáveis pelos imóveis. A disponibilidade, valores e condições podem mudar até a confirmação final.',
  },
  {
    title: 'Informações dos imóveis',
    body: 'Fotos, descrições, preços, datas de entrada e itens inclusos são atualizados com frequência, mas devem ser confirmados antes de qualquer pagamento ou reserva. O usuário deve revisar detalhes como localização, contrato, depósito e regras da casa.',
  },
  {
    title: 'Reservas e pagamentos',
    body: 'Qualquer pagamento, sinal, depósito ou contrato deve ser feito apenas após confirmação direta com a equipe e recebimento das instruções oficiais. Não nos responsabilizamos por pagamentos realizados para contatos ou contas não verificadas.',
  },
  {
    title: 'Uso adequado do site',
    body: 'O usuário concorda em não tentar invadir, copiar indevidamente, automatizar extrações ou prejudicar o funcionamento do site. O conteúdo é fornecido para consulta pessoal sobre acomodações.',
  },
  {
    title: 'Limitação de responsabilidade',
    body: 'Embora trabalhemos para manter as informações corretas, o site pode conter erros pontuais, atrasos de atualização ou indisponibilidade temporária. Confirme sempre os dados importantes com a equipe antes de tomar uma decisão.',
  },
];

export function TermsPage() {
  return (
    <main className="bg-[var(--gray-light)] px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-lg border border-[var(--surface-border)] bg-white p-6 shadow-[var(--surface-shadow)] md:p-10">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--green-medium)]">
          Termos de Uso
        </p>
        <h1 className="mb-4 text-3xl font-extrabold text-[var(--green-dark)] md:text-5xl">
          Condições para usar o site
        </h1>
        <p className="mb-8 text-gray-600">
          Última atualização: 31 de maio de 2026. Ao navegar neste site, você
          concorda com as condições abaixo.
        </p>

        <div className="space-y-7">
          {termsSections.map((section) => (
            <article key={section.title}>
              <h2 className="mb-2 text-xl font-bold text-gray-900">{section.title}</h2>
              <p className="leading-relaxed text-gray-600">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
