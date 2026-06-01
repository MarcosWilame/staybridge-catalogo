const privacySections = [
  {
    title: 'Dados que coletamos',
    body: 'Coletamos apenas as informações necessárias para responder ao seu contato e apresentar acomodações: nome, telefone, e-mail, preferências de moradia, datas desejadas, orçamento e mensagens enviadas pelo site ou WhatsApp.',
  },
  {
    title: 'Como usamos as informações',
    body: 'Usamos seus dados para atendimento, envio de opções de imóveis, organização de visitas, acompanhamento de disponibilidade e melhoria da experiência no site. Também podemos usar dados agregados de navegação para entender quais páginas são mais acessadas.',
  },
  {
    title: 'Compartilhamento',
    body: 'Não vendemos dados pessoais. Podemos compartilhar informações estritamente necessárias com parceiros operacionais, proprietários ou administradores de imóveis quando isso for necessário para avançar uma consulta, visita ou reserva.',
  },
  {
    title: 'Cookies e métricas',
    body: 'O site pode usar cookies e ferramentas de análise, como Google Analytics, para medir acessos, origem de tráfego e interações. Esses dados ajudam a melhorar conteúdo, navegação e campanhas.',
  },
  {
    title: 'Seus direitos',
    body: 'Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais. Para isso, entre em contato pelos canais oficiais informados no rodapé do site.',
  },
];

export function PrivacyPage() {
  return (
    <main className="bg-[var(--gray-light)] px-4 pb-20 pt-32 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl rounded-lg border border-[var(--surface-border)] bg-white p-6 shadow-[var(--surface-shadow)] md:p-10">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--green-medium)]">
          Política de Privacidade
        </p>
        <h1 className="mb-4 text-3xl font-extrabold text-[var(--green-dark)] md:text-5xl">
          Privacidade e uso de dados
        </h1>
        <p className="mb-8 text-gray-600">
          Última atualização: 31 de maio de 2026. Esta política explica como a
          Bedminster London trata informações enviadas por visitantes e clientes.
        </p>

        <div className="space-y-7">
          {privacySections.map((section) => (
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
