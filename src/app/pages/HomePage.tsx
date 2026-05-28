import { Hero } from '../components/Hero';
import { QuickStats } from '../components/QuickStats';
import { PropertyCategories } from '../components/PropertyCategories';
import { FeaturedProperties } from '../components/FeaturedProperties';
//import { RegionShowcase } from '../components/RegionShowcase';
import { Benefits } from '../components/Benefits';
import { HowItWorks } from '../components/HowItWorks';
import { Testimonials } from '../components/Testimonials';
import { InstagramFeed } from '../components/InstagramFeed';
import { CTASection } from '../components/CTASection';

export function HomePage() {
  return (
    <div>
      <Hero />
      <QuickStats />
      <PropertyCategories />
      <FeaturedProperties />
      <div id="benefits">
        <Benefits />
      </div>
      <HowItWorks />
      <div id="testimonials">
        <Testimonials />
      </div>
      <InstagramFeed />
      <CTASection />
    </div>
  );
}
