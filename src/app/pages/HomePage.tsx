import { Hero } from '../components/Hero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { HomeTrustStrip } from '../components/HomeTrustStrip';
import { CTASection } from '../components/CTASection';
import { SEO } from '../components/SEO';
import { getAbsoluteUrl, SITE_NAME, SITE_URL } from '../config/site';

export function HomePage() {
  const homeJsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: getAbsoluteUrl('/img/logo-white.png'),
      sameAs: ['https://instagram.com/staybridge_london'],
      areaServed: {
        '@type': 'City',
        name: 'London',
      },
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
        title="Acomodacoes para brasileiros em Londres"
        description="Studios, ensuites e flats em Londres com bills inclusas, entrada imediata e atendimento em portugues."
        jsonLd={homeJsonLd}
      />
      <Hero />
      <FeaturedProperties />
      <HomeTrustStrip />
      <CTASection />
    </div>
  );
}
