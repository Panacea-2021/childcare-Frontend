'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { LogoMarquee } from '../shared/LogoMarquee';
import { SectionWave } from '../shared/SectionWave';
import { DcHero } from './DcHero';
import { DcMeet } from './DcMeet';
import { DcOps } from './DcOps';
import { DcAi } from './DcAi';
import { DcParents } from './DcParents';
import { DcSecurity } from './DcSecurity';
import { DcSupport } from './DcSupport';
import { DcTestimonials } from './DcTestimonials';
import { DcCta } from './DcCta';
import { DC_TRUST } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './daycare.css';

export function DaycareExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page dc-page">
        <LandingHeader />

        <main className="dc-main">
          <DcHero />

          <section className="dc-band dc-band-trust">
            <div className="dc-wrap">
              <LogoMarquee
                label={DC_TRUST.label}
                items={[...DC_TRUST.items]}
                speed={40}
              />
            </div>
          </section>

          <SectionWave
            id="dc-t"
            variant="softS"
            from="#ffffff"
            to="#fff5f8"
            accent="rgba(244, 114, 182, 0.28)"
          />

          <section className="dc-band dc-band-meet">
            <div className="dc-wrap">
              <DcMeet />
            </div>
          </section>

          <SectionWave
            id="dc-m"
            variant="valley"
            from="#fff5f8"
            to="#ffe7ee"
            accent="rgba(249, 168, 212, 0.35)"
          />

          <section className="dc-band dc-band-ops">
            <div className="dc-wrap">
              <DcOps />
            </div>
          </section>

          <SectionWave
            id="dc-o"
            variant="asymmetric"
            from="#ffe7ee"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.25)"
          />

          <section className="dc-band dc-band-ai">
            <div className="dc-wrap">
              <DcAi />
            </div>
          </section>

          <SectionWave
            id="dc-ai"
            variant="ribbon"
            from="#ffffff"
            to="#ffeaf1"
            accent="rgba(244, 114, 182, 0.3)"
          />

          <section className="dc-band dc-band-parents">
            <div className="dc-wrap">
              <DcParents />
            </div>
          </section>

          <SectionWave
            id="dc-p"
            variant="crest"
            from="#ffeaf1"
            to="#ffffff"
            accent="rgba(124, 58, 237, 0.2)"
          />

          <section className="dc-band dc-band-security">
            <div className="dc-wrap">
              <DcSecurity />
            </div>
          </section>

          <SectionWave
            id="dc-s"
            variant="softS"
            from="#ffffff"
            to="#ffe7ee"
            accent="rgba(249, 168, 212, 0.3)"
          />

          <section className="dc-band dc-band-support">
            <div className="dc-wrap">
              <DcSupport />
            </div>
          </section>

          <SectionWave
            id="dc-su"
            variant="valley"
            from="#ffe7ee"
            to="#f0f9ff"
            accent="rgba(56, 189, 248, 0.28)"
          />

          <section className="dc-band dc-band-testimonials">
            <div className="dc-wrap">
              <DcTestimonials />
            </div>
          </section>

          <SectionWave
            id="dc-te"
            variant="asymmetric"
            from="#f0f9ff"
            to="#fff2f6"
            accent="rgba(244, 114, 182, 0.25)"
          />

          <section className="dc-band dc-band-cta">
            <div className="dc-wrap">
              <DcCta />
            </div>
          </section>

          <SectionWave
            id="dc-f"
            variant="softS"
            from="#fff2f6"
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
