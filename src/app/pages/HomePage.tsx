import { Hero } from '../components/Hero';
import { QuickStats } from '../components/QuickStats';
import { PropertyCategories } from '../components/PropertyCategories';
import { FeaturedProperties } from '../components/FeaturedProperties';
import { Benefits } from '../components/Benefits';
import { Testimonials } from '../components/Testimonials';

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
      <div id="testimonials">
        <Testimonials />
      </div>
    </div>
  );
}
