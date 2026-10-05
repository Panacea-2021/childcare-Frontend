import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { EnrollmentFooter } from '@/components/landing/enrollments/EnrollmentFooter';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import '@/components/landing/landing.css';
import '@/components/landing/features/features-mega-menu.css';
import '@/components/landing/enrollments/enrollments.css';

type Props = {
  title: string;
  description: string;
};

export function FeaturePlaceholder({ title, description }: Props) {
  return (
    <CenterScopeProvider>
      <div className="lp-page en-page">
        <LandingHeader />
        <main style={{ maxWidth: 720, margin: '4rem auto', padding: '0 1.5rem' }}>
          <p
            style={{
              color: 'var(--color-accent)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontSize: 12,
            }}
          >
            Features
          </p>
          <h1 style={{ letterSpacing: '-0.03em' }}>{title}</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <Link href="/features/enrollments" className="ui-btn ui-btn-primary">
              Explore Enrollments
            </Link>
            <Link href="/book-demo" className="ui-btn ui-btn-outline">
              Book a Demo
            </Link>
          </div>
        </main>
        <EnrollmentFooter />
      </div>
    </CenterScopeProvider>
  );
}

export function featureMetadata(title: string, description: string): Metadata {
  return {
    title: `${title} | Panacea Childcare Software`,
    description,
  };
}
