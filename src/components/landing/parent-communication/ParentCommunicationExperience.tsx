'use client';

import { useEffect, useState } from 'react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { PcHero } from './PcHero';
import { PcTrust } from './PcTrust';
import { PcRealtime } from './PcRealtime';
import { PcSafety } from './PcSafety';
import { PcEngagement } from './PcEngagement';
import { PcAi } from './PcAi';
import { PcTestimonials } from './PcTestimonials';
import { PcCompare } from './PcCompare';
import { PcCta } from './PcCta';
import { PcFaq } from './PcFaq';
import { SectionWave } from '../shared/SectionWave';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './parent-communication.css';

export function ParentCommunicationExperience() {
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
      <div className="lp-page en-page pc-page">
        {!reduced ? (
          <div className="pc-progress" aria-hidden>
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        ) : null}

        <LandingHeader />

        <main className="en-main pc-main">
          <section className="en-band pc-band-hero">
            <div className="en-wrap pc-wrap">
              <PcHero />
            </div>
          </section>

          <section className="en-band pc-band-trust">
            <div className="en-wrap pc-wrap">
              <PcTrust />
            </div>
          </section>

          <section className="en-band pc-band-realtime">
            <div className="en-wrap pc-wrap">
              <PcRealtime />
            </div>
          </section>

          <section className="en-band pc-band-safety">
            <div className="en-wrap pc-wrap">
              <PcSafety />
            </div>
          </section>

          <section className="en-band pc-band-engage">
            <div className="en-wrap pc-wrap">
              <PcEngagement />
            </div>
          </section>

          <SectionWave
            id="pc-e"
            variant="valley"
            from="#ffffff"
            to="#f7f3ff"
            accent="rgba(167, 139, 250, 0.3)"
          />

          <section className="en-band pc-band-ai">
            <div className="en-wrap pc-wrap">
              <PcAi />
            </div>
          </section>

          <SectionWave
            id="pc-a"
            variant="softS"
            from="#f8f5ff"
            to="#eef7f3"
            accent="rgba(52, 211, 153, 0.3)"
          />

          <section className="en-band pc-band-testimonials">
            <div className="en-wrap pc-wrap">
              <PcTestimonials />
            </div>
          </section>

          <SectionWave
            id="pc-t"
            variant="asymmetric"
            from="#eef7f3"
            to="#f5f3fb"
            accent="rgba(124, 58, 237, 0.25)"
          />

          <section className="en-band pc-band-compare">
            <div className="en-wrap pc-wrap">
              <PcCompare />
            </div>
          </section>

          <SectionWave
            id="pc-c"
            variant="ribbon"
            from="#f5f3fb"
            to="#f7f8fc"
            accent="rgba(93, 95, 239, 0.22)"
          />

          <section className="en-band pc-band-cta">
            <div className="en-wrap pc-wrap">
              <PcCta />
            </div>
          </section>

          <SectionWave
            id="pc-f"
            variant="crest"
            from="#f7f8fc"
            to="#f2fbfd"
            accent="rgba(45, 212, 191, 0.22)"
          />

          <section className="en-band att-band-faq pc-band-faq">
            <div className="en-wrap pc-wrap">
              <PcFaq />
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
