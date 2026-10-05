'use client';

import { Suspense } from 'react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { BlogHero } from './BlogHero';
import { BlogPopular } from './BlogPopular';
import { BlogFilterGrid } from './BlogFilterGrid';
import { BlogInteresting } from './BlogInteresting';
import { BlogCta } from './BlogCta';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './blogs.css';

export function BlogsExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page bl-page">
        <LandingHeader />

        <main className="bl-main">
          <BlogHero />

          <SectionWave
            id="bl-h"
            variant="softS"
            from="#fbf7ff"
            to="#ffffff"
            accent="rgba(196, 181, 253, 0.3)"
          />

          <section className="bl-band">
            <div className="bl-wrap">
              <BlogPopular />
            </div>
          </section>

          <SectionWave
            id="bl-p"
            variant="asymmetric"
            from="#ffffff"
            to="#ffffff"
            accent="rgba(125, 211, 252, 0.22)"
          />

          <section className="bl-band bl-band-grid">
            <div className="bl-wrap">
              <Suspense fallback={<div className="bl-filterSkeleton" />}>
                <BlogFilterGrid />
              </Suspense>
            </div>
          </section>

          <SectionWave
            id="bl-g"
            variant="valley"
            from="#ffffff"
            to="#eef4f8"
            accent="rgba(56, 189, 248, 0.25)"
          />

          <section className="bl-band bl-band-interesting">
            <div className="bl-wrap">
              <BlogInteresting />
            </div>
          </section>

          <SectionWave
            id="bl-i"
            variant="ribbon"
            from="#eef4f8"
            to="#f8eef8"
            accent="rgba(236, 72, 153, 0.22)"
          />

          <section className="bl-band bl-band-cta">
            <div className="bl-wrap">
              <BlogCta />
            </div>
          </section>

          <SectionWave
            id="bl-f"
            variant="softS"
            from="#f8eef8"
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
