'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentHero } from './EnrollmentHero';
import { EnrollmentGrowth } from './EnrollmentGrowth';
import { FollowUpFlow } from './FollowUpFlow';
import { MultiSiteEnrollment } from './MultiSiteEnrollment';
import { EnrollmentFaq } from './EnrollmentFaq';
import { EnrollmentFooter } from './EnrollmentFooter';
import { SeeItInActionModal } from './SeeItInActionModal';
import { SectionWave } from '../shared/SectionWave';
import type { HeroExperienceId } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import './enrollments.css';

export function EnrollmentExperience() {
  const [experienceId, setExperienceId] = useState<HeroExperienceId>('ai');
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <CenterScopeProvider>
      <div className="lp-page en-page">
        <div className="en-atmosphere" aria-hidden="true">
          <span className="en-orb en-orb-a" />
          <span className="en-orb en-orb-b" />
          <span className="en-orb en-orb-c" />
          <span className="en-orb en-orb-d" />
          <span className="en-gridFade" />
        </div>

        <LandingHeader />

        <main className="en-main">
          <section className="en-band en-band-hero">
            <div className="en-wrap">
              <EnrollmentHero
                experienceId={experienceId}
                onExperienceChange={setExperienceId}
                onSeeInAction={() => setDemoOpen(true)}
              />
            </div>
          </section>

          <section className="en-band en-band-growth">
            <div className="en-wrap">
              <EnrollmentGrowth />
            </div>
          </section>

          <section className="en-band en-band-follow">
            <div className="en-wrap">
              <FollowUpFlow onSeeInAction={() => setDemoOpen(true)} />
            </div>
          </section>

          <section className="en-band en-band-network">
            <div className="en-wrap">
              <MultiSiteEnrollment />
            </div>
          </section>

          <SectionWave
            id="en-n"
            variant="valley"
            from="#fafaf7"
            to="#f2fbfd"
            accent="rgba(93, 95, 239, 0.22)"
          />

          <section className="en-band en-band-faq">
            <div className="en-wrap">
              <EnrollmentFaq />
            </div>
          </section>

          <SectionWave
            id="en-f"
            variant="asymmetric"
            from="#f2fbfd"
            to="#eef1ff"
            accent="rgba(93, 95, 239, 0.28)"
          />

          <section className="en-band en-band-cta" aria-labelledby="en-final-title">
            <div className="en-finalSplit">
              <div className="en-finalVisual" aria-hidden="true">
                <div className="en-finalPhoto">
                  <span>Warm classrooms</span>
                  <strong>Families → enrolled children</strong>
                </div>
              </div>
              <div className="en-finalCopy">
                <h2 id="en-final-title">
                  The Childcare Enrollment Software Built to Help You Grow
                </h2>
                <p>
                  Unify inquiries, tours, waitlists and registrations in one intelligent
                  Panacea workspace.
                </p>
                <Link href="/book-demo" className="ui-btn ui-btn-primary en-finalBtn">
                  Book a Demo
                </Link>
              </div>
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
