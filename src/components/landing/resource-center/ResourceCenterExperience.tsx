'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { ResourceHero } from './ResourceHero';
import { LatestResources } from './LatestResources';
import { ResourceCta } from './ResourceCta';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './resource-center.css';

export function ResourceCenterExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page rc-page">
        <LandingHeader />
        <main className="rc-main">
          <ResourceHero />
          <SectionWave
            id="rc-h"
            variant="softS"
            from="#dff7fc"
            to="#ffffff"
            accent="rgba(56, 189, 248, 0.3)"
          />
          <LatestResources />
          <SectionWave
            id="rc-l"
            variant="ribbon"
            from="#ffffff"
            to="#f7eef8"
            accent="rgba(236, 72, 153, 0.22)"
          />
          <ResourceCta />
          <SectionWave
            id="rc-f"
            variant="softS"
            from="#f7eef8"
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
