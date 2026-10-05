'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { LogoMarquee } from '../shared/LogoMarquee';
import { SectionWave } from '../shared/SectionWave';
import { PsHero } from './PsHero';
import { PsAspects } from './PsAspects';
import { PsDaily } from './PsDaily';
import { PsAi } from './PsAi';
import { PsParents } from './PsParents';
import { PsSecurity } from './PsSecurity';
import { PsSupport } from './PsSupport';
import { PsTestimonials } from './PsTestimonials';
import { PsCta } from './PsCta';
import { PS_TRUST } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './preschool.css';

export function PreschoolExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page ps-page">
        <LandingHeader />

        <main className="ps-main">
          <PsHero />

          <section className="ps-band ps-band-trust">
            <div className="ps-wrap">
              <LogoMarquee
                label={PS_TRUST.label}
                items={[...PS_TRUST.items]}
                speed={40}
              />
            </div>
          </section>

          <SectionWave
            id="ps-t"
            variant="softS"
            from="#ffffff"
            to="#f7fcff"
            accent="rgba(56, 189, 248, 0.28)"
          />

          <section className="ps-band ps-band-aspects">
            <div className="ps-wrap">
              <PsAspects />
            </div>
          </section>

          <SectionWave
            id="ps-a"
            variant="valley"
            from="#f7fcff"
            to="#e9fcff"
            accent="rgba(93, 95, 239, 0.22)"
          />

          <section className="ps-band ps-band-daily">
            <div className="ps-wrap">
              <PsDaily />
            </div>
          </section>

          <SectionWave
            id="ps-d"
            variant="asymmetric"
            from="#e9fcff"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.28)"
          />

          <section className="ps-band ps-band-ai">
            <div className="ps-wrap">
              <PsAi />
            </div>
          </section>

          <SectionWave
            id="ps-ai"
            variant="ribbon"
            from="#ffffff"
            to="#eafbff"
            accent="rgba(56, 189, 248, 0.3)"
          />

          <section className="ps-band ps-band-parents">
            <div className="ps-wrap">
              <PsParents />
            </div>
          </section>

          <SectionWave
            id="ps-p"
            variant="crest"
            from="#eafbff"
            to="#ffffff"
            accent="rgba(124, 58, 237, 0.22)"
          />

          <section className="ps-band ps-band-security">
            <div className="ps-wrap">
              <PsSecurity />
            </div>
          </section>

          <SectionWave
            id="ps-s"
            variant="softS"
            from="#ffffff"
            to="#e9fcff"
            accent="rgba(56, 189, 248, 0.26)"
          />

          <section className="ps-band ps-band-support">
            <div className="ps-wrap">
              <PsSupport />
            </div>
          </section>

          <SectionWave
            id="ps-su"
            variant="valley"
            from="#e9fcff"
            to="#fff8eb"
            accent="rgba(251, 191, 36, 0.35)"
          />

          <section className="ps-band ps-band-testimonials">
            <div className="ps-wrap">
              <PsTestimonials />
            </div>
          </section>

          <SectionWave
            id="ps-te"
            variant="asymmetric"
            from="#fff8eb"
            to="#eafbff"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="ps-band ps-band-cta">
            <div className="ps-wrap">
              <PsCta />
            </div>
          </section>

          <SectionWave
            id="ps-f"
            variant="softS"
            from="#eafbff"
            to="#f5ebff"
            accent="rgba(167, 139, 250, 0.3)"
          />
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
