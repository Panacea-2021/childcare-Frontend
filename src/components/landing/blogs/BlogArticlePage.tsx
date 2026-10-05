'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import { BlogArticleExperience } from './BlogArticleExperience';
import type { BlogArticle } from './data';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './blogs.css';

type Props = {
  article: BlogArticle;
};

export function BlogArticlePage({ article }: Props) {
  return (
    <CenterScopeProvider>
      <div className="lp-page bl-page">
        <LandingHeader />
        <main className="bl-main">
          <BlogArticleExperience article={article} />
          <SectionWave
            id="bl-af"
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
