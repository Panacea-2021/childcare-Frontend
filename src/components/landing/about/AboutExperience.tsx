'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { LogoMarquee } from '../shared/LogoMarquee';
import { SectionWave } from '../shared/SectionWave';
import { AuHero } from './AuHero';
import { AuVision } from './AuVision';
import { AuWhy } from './AuWhy';
import { AuTestimonials } from './AuTestimonials';
import { AuMission } from './AuMission';
import { AuReveal } from './AuReveal';
import { AU_TRUST } from './data';
import { scaleIn } from './motion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './about.css';

export function AboutExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page au-page">
        <LandingHeader />

        <main className="au-main">
          <AuHero />

          <SectionWave
            id="au-h"
            variant="softS"
            from="#f6f0ff"
            to="#efe6ff"
            accent="rgba(167, 139, 250, 0.35)"
          />

          <AuVision />

          <SectionWave
            id="au-v"
            variant="valley"
            from="#efe6ff"
            to="#ffffff"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="au-band au-band-trust">
            <div className="au-wrap">
              <AuReveal variants={scaleIn}>
                <LogoMarquee
                  label={AU_TRUST.label}
                  items={[...AU_TRUST.items]}
                  speed={42}
                />
              </AuReveal>
            </div>
          </section>

          <SectionWave
            id="au-t"
            variant="asymmetric"
            from="#ffffff"
            to="#ffffff"
            accent="rgba(125, 211, 252, 0.25)"
          />

          <section className="au-band au-band-why">
            <div className="au-wrap">
              <AuWhy />
            </div>
          </section>

          <SectionWave
            id="au-w"
            variant="crest"
            from="#ffffff"
            to="#e8f8fb"
            accent="rgba(56, 189, 248, 0.28)"
          />

          <section className="au-band au-band-testimonials">
            <div className="au-wrap au-wrap--wide">
              <AuTestimonials />
            </div>
          </section>

          <SectionWave
            id="au-te"
            variant="ribbon"
            from="#e8f8fb"
            to="#f3ebff"
            accent="rgba(167, 139, 250, 0.3)"
          />

          <section className="au-band au-band-mission">
            <div className="au-wrap">
              <AuMission />
            </div>
          </section>

          <SectionWave
            id="au-f"
            variant="softS"
            from="#f3ebff"
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
