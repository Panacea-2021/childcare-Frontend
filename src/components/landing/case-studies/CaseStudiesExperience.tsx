'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { LogoMarquee } from '../shared/LogoMarquee';
import { CASE_STUDY_LOGOS } from './data';
import { CsHero } from './CsHero';
import { CsBrowse } from './CsBrowse';
import { CsCta } from './CsCta';
import { CsReveal } from './CsReveal';
import { fadeScale } from './motion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './case-studies.css';

export function CaseStudiesExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page cs-page">
        <LandingHeader />
        <main className="cs-main">
          <CsHero />
          <SectionWave
            id="cs-h"
            variant="softS"
            from="#f4f0ff"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.28)"
          />
          <CsReveal className="cs-logos" variants={fadeScale} amount={0.35}>
            <div className="cs-wrap">
              <LogoMarquee
                label="Trusted by childcare centers worldwide"
                items={[...CASE_STUDY_LOGOS]}
                speed={40}
                pauseOnHover
              />
            </div>
          </CsReveal>
          <SectionWave
            id="cs-l"
            variant="asymmetric"
            from="#ffffff"
            to="#ffffff"
            accent="rgba(125, 211, 252, 0.2)"
          />
          <CsBrowse />
          <SectionWave
            id="cs-g"
            variant="ribbon"
            from="#ffffff"
            to="#e8f7fb"
            accent="rgba(56, 189, 248, 0.25)"
          />
          <CsCta />
          <SectionWave
            id="cs-f"
            variant="softS"
            from="#e8f7fb"
            to="#f5ebff"
            accent="rgba(167, 139, 250, 0.28)"
          />
        </main>
        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
