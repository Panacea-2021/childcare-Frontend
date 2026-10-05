'use client';

import { useEffect, useState } from 'react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { AttendanceHero } from './AttendanceHero';
import { AttendanceBenefits } from './AttendanceBenefits';
import { AttendanceCheckIn } from './AttendanceCheckIn';
import { AttendanceBilling } from './AttendanceBilling';
import { AttendanceSafety } from './AttendanceSafety';
import { AttendanceTestimonials } from './AttendanceTestimonials';
import { AttendanceFaq } from './AttendanceFaq';
import { AttendanceCta } from './AttendanceCta';
import { SectionWave } from '../shared/SectionWave';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './attendance.css';

export function AttendanceExperience() {
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
      <div className="lp-page en-page att-page">
        {!reduced ? (
          <div className="att-progress" aria-hidden>
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        ) : null}

        <LandingHeader />

        <main className="en-main att-main">
          <section className="en-band att-band-hero">
            <AttendanceHero />
          </section>

          <SectionWave
            id="att-h"
            variant="softS"
            from="#f7f8fc"
            to="#f1ebf7"
            accent="rgba(167, 139, 250, 0.3)"
          />

          <section className="en-band att-band-benefits">
            <div className="en-wrap att-wrap">
              <AttendanceBenefits />
            </div>
          </section>

          <SectionWave
            id="att-b"
            variant="valley"
            from="#f1ebf7"
            to="#ffffff"
            accent="rgba(124, 58, 237, 0.25)"
          />

          <section className="en-band att-band-checkin">
            <div className="en-wrap att-wrap">
              <AttendanceCheckIn />
            </div>
          </section>

          <SectionWave
            id="att-c"
            variant="ribbon"
            from="#ffffff"
            to="#f3faf6"
            accent="rgba(52, 211, 153, 0.3)"
          />

          <section className="en-band att-band-billing">
            <div className="en-wrap att-wrap">
              <AttendanceBilling />
            </div>
          </section>

          <SectionWave
            id="att-bi"
            variant="asymmetric"
            from="#f3faf6"
            to="#ffffff"
            accent="rgba(16, 185, 129, 0.25)"
          />

          <section className="en-band att-band-safety">
            <div className="en-wrap att-wrap">
              <AttendanceSafety />
            </div>
          </section>

          <SectionWave
            id="att-s"
            variant="crest"
            from="#ffffff"
            to="#f4f6fb"
            accent="rgba(93, 95, 239, 0.2)"
          />

          <section className="en-band att-band-testimonials">
            <div className="en-wrap att-wrap">
              <AttendanceTestimonials />
            </div>
          </section>

          <section className="en-band att-band-cta">
            <div className="en-wrap att-wrap">
              <AttendanceCta />
            </div>
          </section>

          <SectionWave
            id="att-f"
            variant="softS"
            from="#f7f8fc"
            to="#f2fbfd"
            accent="rgba(93, 95, 239, 0.18)"
          />

          <section className="en-band att-band-faq">
            <div className="en-wrap att-wrap">
              <AttendanceFaq />
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
