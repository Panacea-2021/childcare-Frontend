'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { PricingHero } from './PricingHero';
import { PricingPlans } from './PricingPlans';
import { TrustBadges } from './TrustBadges';
import { ComparisonTable } from './ComparisonTable';
import { TestimonialCarousel } from './TestimonialCarousel';
import { FAQSection } from './FAQSection';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './pricing.css';

export function PricingExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page px-page">
        <LandingHeader />
        <main className="px-main">
          <PricingHero />
          <PricingPlans />
          <TrustBadges />
          <SectionWave
            id="px-c"
            variant="softS"
            from="#fff5f8"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.22)"
          />
          <ComparisonTable />
          <SectionWave
            id="px-t"
            variant="valley"
            from="#ffffff"
            to="#fff1f7"
            accent="rgba(244, 114, 182, 0.2)"
          />
          <TestimonialCarousel />
          <SectionWave
            id="px-f"
            variant="crest"
            from="#fff1f7"
            to="#faf5ff"
            accent="rgba(167, 139, 250, 0.22)"
          />
          <FAQSection />
          <SectionWave
            id="px-ff"
            variant="softS"
            from="#faf5ff"
            to="#f5ebff"
            accent="rgba(167, 139, 250, 0.25)"
          />
        </main>
        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
