'use client';

import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { EntHero } from './EntHero';
import { EntTrust } from './EntTrust';
import { EntVideo } from './EntVideo';
import { EntPartners } from './EntPartners';
import { EntTeams } from './EntTeams';
import { EntGovernance } from './EntGovernance';
import { EntJourney } from './EntJourney';
import { EntSecurity } from './EntSecurity';
import { EntIntegrations } from './EntIntegrations';
import { EntCta } from './EntCta';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './enterprise.css';

export function EnterpriseExperience() {
  return (
    <CenterScopeProvider>
      <div className="lp-page en-page ent-page">
        <LandingHeader />

        <main className="en-main ent-main">
          <section className="en-band ent-band-hero">
            <div className="en-wrap ent-wrap">
              <EntHero />
            </div>
          </section>

          <section className="en-band ent-band-trust">
            <div className="en-wrap ent-wrap">
              <EntTrust />
            </div>
          </section>

          <EntVideo />

          <section className="en-band ent-band-partners">
            <div className="en-wrap ent-wrap">
              <EntPartners />
            </div>
          </section>

          <section className="en-band ent-band-teams">
            <div className="en-wrap ent-wrap">
              <EntTeams />
            </div>
          </section>

          <section className="en-band ent-band-governance">
            <div className="en-wrap ent-wrap">
              <EntGovernance />
            </div>
          </section>

          <section className="en-band ent-band-journey">
            <div className="en-wrap ent-wrap">
              <EntJourney />
            </div>
          </section>

          <section className="en-band ent-band-security">
            <div className="en-wrap ent-wrap">
              <EntSecurity />
            </div>
          </section>

          <section className="en-band ent-band-integrations">
            <div className="en-wrap ent-wrap">
              <EntIntegrations />
            </div>
          </section>

          <section className="en-band ent-band-cta">
            <div className="en-wrap ent-wrap">
              <EntCta />
            </div>
          </section>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
