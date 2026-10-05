'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { LogoMarquee } from '../shared/LogoMarquee';
import { SectionWave } from '../shared/SectionWave';
import { ScHero } from './ScHero';
import { ScDiscover } from './ScDiscover';
import { ScSolution } from './ScSolution';
import { ScParentApp } from './ScParentApp';
import { ScSecureDay } from './ScSecureDay';
import { ScReliable } from './ScReliable';
import { ScTestimonials } from './ScTestimonials';
import { ScCta } from './ScCta';
import { SC_TRUST } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './single-center.css';

export function SingleCenterExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page sc-page">
        <LandingHeader />

        <main className="sc-main">
          <ScHero />

          <section className="sc-band sc-band-trust">
            <div className="sc-wrap">
              <LogoMarquee
                label={SC_TRUST.label}
                items={[...SC_TRUST.items]}
                speed={40}
              />
            </div>
          </section>

          <SectionWave
            id="sc-t"
            variant="softS"
            from="#ffffff"
            to="#f4fbf8"
            accent="rgba(52, 211, 153, 0.3)"
          />

          <section className="sc-band sc-band-discover">
            <div className="sc-wrap">
              <ScDiscover />
            </div>
          </section>

          <SectionWave
            id="sc-d"
            variant="valley"
            from="#f4fbf8"
            to="#e8faf4"
            accent="rgba(45, 212, 191, 0.28)"
          />

          <section className="sc-band sc-band-solution">
            <div className="sc-wrap">
              <ScSolution />
            </div>
          </section>

          <SectionWave
            id="sc-s"
            variant="asymmetric"
            from="#e8faf4"
            to="#ffffff"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="sc-band sc-band-parent">
            <div className="sc-wrap">
              <ScParentApp />
            </div>
          </section>

          <SectionWave
            id="sc-p"
            variant="ribbon"
            from="#ffffff"
            to="#eaf8f4"
            accent="rgba(52, 211, 153, 0.28)"
          />

          <section className="sc-band sc-band-secure">
            <div className="sc-wrap">
              <ScSecureDay />
            </div>
          </section>

          <SectionWave
            id="sc-se"
            variant="crest"
            from="#eaf8f4"
            to="#ffffff"
            accent="rgba(124, 58, 237, 0.2)"
          />

          <section className="sc-band sc-band-reliable">
            <div className="sc-wrap">
              <ScReliable />
            </div>
          </section>

          <SectionWave
            id="sc-r"
            variant="softS"
            from="#ffffff"
            to="#fff8eb"
            accent="rgba(251, 191, 36, 0.32)"
          />

          <section className="sc-band sc-band-testimonials">
            <div className="sc-wrap">
              <ScTestimonials />
            </div>
          </section>

          <SectionWave
            id="sc-te"
            variant="asymmetric"
            from="#fff8eb"
            to="#eafbff"
            accent="rgba(93, 95, 239, 0.18)"
          />

          <section className="sc-band sc-band-cta">
            <div className="sc-wrap">
              <ScCta />
            </div>
          </section>

          <SectionWave
            id="sc-f"
            variant="softS"
            from="#eafbff"
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
