'use client';

import { useEffect, useState } from 'react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { AdrHero } from './AdrHero';
import { AdrVideo } from './AdrVideo';
import { AdrSteps } from './AdrSteps';
import { AdrStats } from './AdrStats';
import { AdrSecurity } from './AdrSecurity';
import { AdrCta } from './AdrCta';
import { SeeItInActionModal } from '../enrollments/SeeItInActionModal';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './ai-daily-reports.css';

export function AiDailyReportsExperience() {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reduced]);

  return (
    <CenterScopeProvider>
      <div className="lp-page en-page adr-page">
        {!reduced ? (
          <div className="adr-progress" aria-hidden>
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        ) : null}

        <LandingHeader />

        <main className="en-main adr-main">
          <section className="en-band adr-band-hero">
            <div className="en-wrap adr-wrap">
              <AdrHero onSeeDemo={() => setDemoOpen(true)} />
            </div>
          </section>

          <SectionWave
            id="adr-h"
            variant="softS"
            from="#f8f0ff"
            to="#f8f6fc"
            accent="rgba(192, 132, 252, 0.28)"
          />

          <section className="en-band adr-band-video">
            <div className="en-wrap adr-wrap">
              <AdrVideo />
            </div>
          </section>

          <SectionWave
            id="adr-v"
            variant="ribbon"
            from="#f8f6fc"
            to="#f3effa"
            accent="rgba(232, 121, 184, 0.3)"
          />

          <section className="en-band adr-band-steps">
            <div className="en-wrap adr-wrap">
              <AdrSteps />
            </div>
          </section>

          <SectionWave
            id="adr-st"
            variant="asymmetric"
            from="#f3effa"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.32)"
          />

          <section className="en-band adr-band-stats">
            <div className="en-wrap adr-wrap">
              <AdrStats />
            </div>
          </section>

          <SectionWave
            id="adr-sec"
            variant="valley"
            from="#ffffff"
            to="#f3eef9"
            accent="rgba(192, 132, 252, 0.28)"
          />

          <section className="en-band adr-band-security">
            <div className="en-wrap adr-wrap">
              <AdrSecurity />
            </div>
          </section>

          <SectionWave
            id="adr-c"
            variant="crest"
            from="#f3eef9"
            to="#f7f4fc"
            accent="rgba(167, 139, 250, 0.25)"
          />

          <section className="en-band adr-band-cta">
            <div className="en-wrap adr-wrap">
              <AdrCta />
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
        <SeeItInActionModal open={demoOpen} onClose={() => setDemoOpen(false)} />
      </div>
    </CenterScopeProvider>
  );
}
