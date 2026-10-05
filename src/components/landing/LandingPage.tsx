import { ChatWidget } from '../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { LandingHeader } from './LandingHeader';
import { HeroSection } from './hero/HeroSection';
import './landing.css';

export function LandingPage() {
  return (
    <CenterScopeProvider>
      <div className="lp-page">
        <LandingHeader />

        <div className="lp-banner">
          <span>
            Discover the Next Innovation in Childcare. Live on August 12.{' '}
            <button type="button" className="lp-registerPill">
              Register Free
            </button>
          </span>
        </div>

        <HeroSection />

        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
