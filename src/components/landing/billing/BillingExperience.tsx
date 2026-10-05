'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { BillingHero } from './BillingHero';
import { BillingFeatureTabs } from './BillingFeatureTabs';
import { BillingAccuracy } from './BillingAccuracy';
import { BillingParentPay } from './BillingParentPay';
import { BillingSubsidyStory } from './BillingSubsidyStory';
import { BillingStoryBand } from './BillingStoryBand';
import { BillingRevenue } from './BillingRevenue';
import { BillingTrust } from './BillingTrust';
import { BillingComparison } from './BillingComparison';
import { BillingFaq } from './BillingFaq';
import { BillingCta } from './BillingCta';
import { SectionWave } from '../shared/SectionWave';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './billing.css';

export function BillingExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page en-page bl-page">
        <LandingHeader />

        <main className="en-main bl-main">
          <section className="en-band bl-band-hero">
            <BillingHero />
          </section>

          <section className="en-band bl-band-features">
            <BillingFeatureTabs />
          </section>

          <section className="en-band bl-band-accuracy">
            <BillingAccuracy />
          </section>

          <SectionWave
            id="bl-a"
            variant="softS"
            from="#eceef8"
            to="#ffffff"
            accent="rgba(93, 95, 239, 0.22)"
          />

          <section className="en-band bl-band-parent">
            <div className="en-wrap bl-sectionWrap">
              <BillingParentPay />
            </div>
          </section>

          <section className="en-band bl-band-subsidy">
            <div className="en-wrap bl-sectionWrap">
              <BillingSubsidyStory />
            </div>
          </section>

          <SectionWave
            id="bl-s"
            variant="valley"
            from="#eef6f2"
            to="#1a1230"
            accent="rgba(192, 132, 252, 0.4)"
          />

          <section className="en-band bl-band-story">
            <BillingStoryBand />
          </section>

          <SectionWave
            id="bl-st"
            variant="crest"
            from="#120c24"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.35)"
          />

          <section className="en-band bl-band-revenue">
            <div className="en-wrap bl-sectionWrap">
              <BillingRevenue />
            </div>
          </section>

          <SectionWave
            id="bl-r"
            variant="asymmetric"
            from="#ffffff"
            to="#f3eef8"
            accent="rgba(124, 58, 237, 0.25)"
          />

          <section className="en-band bl-band-trust">
            <div className="en-wrap bl-sectionWrap">
              <BillingTrust />
            </div>
          </section>

          <SectionWave
            id="bl-t"
            variant="ribbon"
            from="#f3eef8"
            to="#ffffff"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="en-band bl-band-compare">
            <div className="en-wrap bl-sectionWrap">
              <BillingComparison />
            </div>
          </section>

          <section className="en-band bl-band-faq">
            <div className="en-wrap bl-sectionWrap">
              <BillingFaq />
            </div>
          </section>

          <SectionWave
            id="bl-f"
            variant="softS"
            from="#f2fbfd"
            to="#f7f8fc"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="en-band bl-band-cta">
            <BillingCta />
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
