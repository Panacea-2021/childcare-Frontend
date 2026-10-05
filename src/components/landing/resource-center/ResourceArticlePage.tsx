'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { ResourceArticleExperience } from './ResourceArticleExperience';
import type { ResourceItem } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './resource-center.css';

type Props = { item: ResourceItem };

export function ResourceArticlePage({ item }: Props) {
  return (
    <CenterScopeProvider>
      <div className="lp-page rc-page">
        <LandingHeader />
        <main className="rc-main">
          <ResourceArticleExperience item={item} />
          <SectionWave
            id="rc-af"
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
