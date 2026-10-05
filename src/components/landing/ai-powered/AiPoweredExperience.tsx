'use client';

import { useEffect, useState } from 'react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { AipHero } from './AipHero';
import { AipStats } from './AipStats';
import { AipFeatureEngage } from './AipFeatureEngage';
import { AipFeatureLessons } from './AipFeatureLessons';
import { AipFeatureAnalytics } from './AipFeatureAnalytics';
import { AipCompare } from './AipCompare';
import { AipCta } from './AipCta';
import { AipTrust } from './AipTrust';
import { AipPromo } from './AipPromo';
import { SectionWave } from '../shared/SectionWave';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './ai-powered.css';

export function AiPoweredExperience() {
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
      <div className="lp-page en-page aip-page">
        {!reduced ? (
          <div className="aip-progress" aria-hidden>
            <i style={{ transform: `scaleX(${progress})` }} />
          </div>
        ) : null}

        <LandingHeader />

        <main className="en-main aip-main">
          <section className="en-band aip-band-hero">
            <div className="en-wrap aip-wrap">
              <AipHero />
            </div>
          </section>

          <SectionWave
            id="aip-h"
            variant="valley"
            from="#1a0030"
            to="#f7f8fc"
            accent="rgba(192, 132, 252, 0.35)"
          />

          <section className="en-band aip-band-stats">
            <div className="en-wrap aip-wrap">
              <AipStats />
            </div>
          </section>

          <SectionWave
            id="aip-s"
            variant="softS"
            from="#f7f8fc"
            to="#eef1f8"
            accent="rgba(93, 95, 239, 0.22)"
          />

          <section className="en-band aip-band-features">
            <div className="en-wrap aip-wrap aip-featuresStack">
              <AipFeatureEngage />
              <AipFeatureLessons />
              <AipFeatureAnalytics />
            </div>
          </section>

          <SectionWave
            id="aip-f"
            variant="ribbon"
            from="#eef1f8"
            to="#ffffff"
            accent="rgba(124, 58, 237, 0.2)"
          />

          <section className="en-band aip-band-compare">
            <div className="en-wrap aip-wrap">
              <AipCompare />
            </div>
          </section>

          <SectionWave
            id="aip-c"
            variant="asymmetric"
            from="#ffffff"
            to="#0c0014"
            accent="rgba(192, 132, 252, 0.4)"
          />

          <section className="en-band aip-band-cta">
            <div className="en-wrap aip-wrap">
              <AipCta />
              <AipTrust />
            </div>
          </section>

          <SectionWave
            id="aip-p"
            variant="crest"
            from="#140022"
            to="#f5f3fb"
            accent="rgba(167, 139, 250, 0.35)"
          />

          <section className="en-band aip-band-promo">
            <div className="en-wrap aip-wrap">
              <AipPromo />
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
