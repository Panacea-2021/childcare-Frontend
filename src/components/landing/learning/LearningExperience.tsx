'use client';

import { useEffect, useState } from 'react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { LnHero } from './LnHero';
import { LnCycle } from './LnCycle';
import { LnFrameworks } from './LnFrameworks';
import { LnObserve } from './LnObserve';
import { LnLessonAi } from './LnLessonAi';
import { LnObservationAi } from './LnObservationAi';
import { LnGoals } from './LnGoals';
import { LnTestimonials } from './LnTestimonials';
import { LnCta } from './LnCta';
import { LnFaq } from './LnFaq';
import { SectionWave } from '../shared/SectionWave';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './learning.css';

export function LearningExperience() {
  const reduced = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);

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
      <div className="lp-page en-page ln-page">
        {!reduced ? (
          <div className="ln-progress" aria-hidden>
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        ) : null}

        <LandingHeader />

        <main className="en-main ln-main">
          <section className="en-band ln-band-hero">
            <div className="en-wrap ln-wrap">
              <LnHero />
            </div>
          </section>

          <section className="en-band ln-band-cycle">
            <div className="en-wrap ln-wrap">
              <LnCycle />
            </div>
          </section>

          <section className="en-band ln-band-frameworks">
            <div className="en-wrap ln-wrap">
              <LnFrameworks />
            </div>
          </section>

          <section className="en-band ln-band-observe">
            <div className="en-wrap ln-wrap">
              <LnObserve />
            </div>
          </section>

          <SectionWave
            id="ln-o"
            variant="valley"
            from="#ffffff"
            to="#f7f3ff"
            accent="rgba(167, 139, 250, 0.3)"
          />

          <section className="en-band ln-band-lesson">
            <div className="en-wrap ln-wrap">
              <LnLessonAi />
            </div>
          </section>

          <SectionWave
            id="ln-l"
            variant="softS"
            from="#f8f5ff"
            to="#eef7f8"
            accent="rgba(45, 212, 191, 0.35)"
          />

          <section className="en-band ln-band-obs-ai">
            <div className="en-wrap ln-wrap">
              <LnObservationAi />
            </div>
          </section>

          <SectionWave
            id="ln-a"
            variant="ribbon"
            from="#f0fafc"
            to="#f4faf7"
            accent="rgba(52, 211, 153, 0.28)"
          />

          <section className="en-band ln-band-goals">
            <div className="en-wrap ln-wrap">
              <LnGoals />
            </div>
          </section>

          <section className="en-band ln-band-testimonials">
            <div className="en-wrap ln-wrap">
              <LnTestimonials />
            </div>
          </section>

          <SectionWave
            id="ln-t"
            variant="asymmetric"
            from="#eef7f3"
            to="#f7f8fc"
            accent="rgba(16, 185, 129, 0.25)"
          />

          <section className="en-band ln-band-cta">
            <div className="en-wrap ln-wrap">
              <LnCta />
            </div>
          </section>

          <SectionWave
            id="ln-c"
            variant="crest"
            from="#f7f8fc"
            to="#f2fbfd"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="en-band att-band-faq ln-band-faq">
            <div className="en-wrap ln-wrap">
              <LnFaq />
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
