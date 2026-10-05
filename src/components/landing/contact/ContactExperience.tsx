'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { ContactSection } from './ContactSection';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './contact.css';

function ContactCurve() {
  return (
    <div className="ct-curve" aria-hidden>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 40C220 18 380 96 560 88C780 78 920 18 1120 28C1280 36 1360 58 1440 48V120H0V40Z"
          fill="rgba(237, 208, 228, 0.35)"
        />
        <path
          d="M0 56C240 28 400 108 620 98C840 88 980 24 1180 36C1300 44 1380 68 1440 60V120H0V56Z"
          fill="rgba(237, 208, 228, 0.55)"
        />
        <path
          d="M0 72C260 42 440 118 680 106C920 94 1040 36 1220 48C1320 56 1390 78 1440 72V120H0V72Z"
          fill="rgba(237, 208, 228, 0.42)"
        />
      </svg>
    </div>
  );
}

export function ContactExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page ct-page">
        <LandingHeader />

        <main className="ct-main">
          <ContactSection />
          <ContactCurve />
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
