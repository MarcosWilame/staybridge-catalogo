import { Hero } from '../components/Hero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { HomeTrustStrip } from '../components/HomeTrustStrip';
import { CTASection } from '../components/CTASection';
import { SEO } from '../components/SEO';

export function HomePage() {
  return (
    <div>
      <SEO
        title="Acomodacoes para brasileiros em Londres"
        description="Studios, ensuites e flats em Londres com bills inclusas, entrada imediata e atendimento em portugues."
      />
      <Hero />
      <FeaturedProperties />
      <HomeTrustStrip />
      <CTASection />
    </div>
  );
}
