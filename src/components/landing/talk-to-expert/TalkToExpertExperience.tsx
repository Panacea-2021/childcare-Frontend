'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { LandingFaq } from '../faq/LandingFaq';
import { TalkToExpertHero } from './TalkToExpertHero';
import { PromotionBanner } from './PromotionBanner';
import { FeatureComparison } from './FeatureComparison';
import { AddOnsSection } from './AddOnsSection';
import { AgenticAISection } from './AgenticAISection';
import { AIPlatformCTA } from './AIPlatformCTA';
import { TTE_FAQS } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './talk-to-expert.css';

const FAQ_CHIPS = ['Contracts', 'Billing', 'Migration', 'Enterprise'] as const;

export function TalkToExpertExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page tte-page">
        <LandingHeader />
        <main className="tte-main">
          <TalkToExpertHero />
          <PromotionBanner />
          <SectionWave
            id="tte-c"
            variant="softS"
            from="#f5f3ff"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.22)"
          />
          <FeatureComparison />
          <SectionWave
            id="tte-a"
            variant="valley"
            from="#ffffff"
            to="#faf5ff"
            accent="rgba(236, 72, 153, 0.18)"
          />
          <AddOnsSection />
          <SectionWave
            id="tte-ai"
            variant="crest"
            from="#faf5ff"
            to="#fff1f7"
            accent="rgba(167, 139, 250, 0.2)"
          />
          <AgenticAISection />
          <AIPlatformCTA />
          <SectionWave
            id="tte-f"
            variant="softS"
            from="#ffffff"
            to="#faf5ff"
            accent="rgba(167, 139, 250, 0.22)"
          />
          <section className="tte-faq">
            <div className="tte-wrap">
              <LandingFaq
                titleId="tte-faq-title"
                description="Answers multi-center operators ask before talking to an expert."
                items={[...TTE_FAQS]}
                chips={FAQ_CHIPS}
                className="tte-lfFaq"
              />
            </div>
          </section>
          <SectionWave
            id="tte-ff"
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
