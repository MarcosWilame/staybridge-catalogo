import { Hero } from '../components/Hero';
import { lazy, Suspense } from 'react';
import { HomeTrustStrip } from '../components/HomeTrustStrip';
import { CTASection } from '../components/CTASection';
import { SEO } from '../components/SEO';
import { getAbsoluteUrl, SITE_NAME, SITE_URL } from '../config/site';

const FeaturedProperties = lazy(() =>
  import('../components/FeaturedProperties').then((module) => ({ default: module.FeaturedProperties }))
);
const HomeSeoContent = lazy(() =>
  import('../components/HomeSeoContent').then((module) => ({ default: module.HomeSeoContent }))
);

export function HomePage() {
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': ['LocalBusiness', 'RealEstateAgent'],
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: getAbsoluteUrl('/img/logo-white.png'),
      image: getAbsoluteUrl('/img/logo-white.png'),
      sameAs: ['https://instagram.com/staybridge_london'],
      priceRange: '££',
      knowsLanguage: ['pt-BR', 'en-GB'],
      areaServed: {
        '@type': 'City',
        name: 'London',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        ['Quais tipos de acomodação estão disponíveis em Londres?', 'O catálogo reúne quartos, suítes, estúdios e apartamentos com filtros por região, preço, capacidade e data de entrada.'],
        ['As contas estão incluídas no aluguel?', 'Algumas unidades incluem bills. A informação aparece no anúncio e pode ser selecionada como filtro.'],
        ['Posso receber atendimento em português?', 'Sim. A equipe oferece atendimento em português pelo WhatsApp durante a busca e a reserva.'],
        ['Posso procurar acomodação antes de chegar a Londres?', 'Sim. É possível consultar fotos, detalhes, localização aproximada e disponibilidade online antes da mudança.'],
      ].map(([name, text]) => ({
        '@type': 'Question',
        name,
        acceptedAnswer: { '@type': 'Answer', text },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${getAbsoluteUrl('/properties')}?search={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <div>
      <SEO
        title="Acomodações para brasileiros em Londres"
        description="Quartos, estúdios, suítes e apartamentos para alugar em Londres, com filtros por preço, região e disponibilidade e atendimento em português."
        imageAlt="Staybridge London — acomodações para alugar em Londres"
        canonicalPath="/"
        jsonLd={homeJsonLd}
      />
      <Hero />
      <Suspense fallback={<div className="h-96 bg-gray-50" aria-hidden="true" />}>
        <FeaturedProperties />
      </Suspense>
      <div className="deferred-section">
        <HomeTrustStrip />
        <Suspense fallback={null}>
          <HomeSeoContent />
        </Suspense>
        <CTASection />
      </div>
    </div>
  );
}
