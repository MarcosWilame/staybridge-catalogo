import { Hero } from '../components/Hero';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { HomeTrustStrip } from '../components/HomeTrustStrip';
import { CTASection } from '../components/CTASection';

export function HomePage() {
  return (
    <div>
      <Hero />
      <FeaturedProperties />
      <HomeTrustStrip />
      <CTASection />
    </div>
  );
}
