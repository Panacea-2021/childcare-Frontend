'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { EwHero } from './EwHero';
import { EwUpcoming } from './EwUpcoming';
import { EwPodcasts } from './EwPodcasts';
import { EwPast } from './EwPast';
import { EwSubscribe } from './EwSubscribe';
import { EwReveal } from './EwReveal';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './events-webinars.css';

export function EventsWebinarsExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page ew-page">
        <LandingHeader />
        <main className="ew-main">
          <EwHero />
          <SectionWave
            id="ew-h"
            variant="crest"
            from="#fce7f3"
            to="#ffffff"
            accent="rgba(244, 114, 182, 0.28)"
          />
          <EwUpcoming />
          <SectionWave
            id="ew-u"
            variant="softS"
            from="#ffffff"
            to="#fff5f8"
            accent="rgba(196, 181, 253, 0.25)"
          />
          <EwPodcasts />
          <SectionWave
            id="ew-p"
            variant="valley"
            from="#fff5f8"
            to="#ffffff"
            accent="rgba(125, 211, 252, 0.22)"
          />
          <EwPast />
          <SectionWave
            id="ew-past"
            variant="ribbon"
            from="#ffffff"
            to="#fce7f3"
            accent="rgba(244, 114, 182, 0.25)"
          />
          <EwSubscribe />
          <EwReveal>
            <SectionWave
              id="ew-f"
              variant="softS"
              from="#fce7f3"
              to="#f5ebff"
              accent="rgba(167, 139, 250, 0.28)"
            />
          </EwReveal>
        </main>
        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
