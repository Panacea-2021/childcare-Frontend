'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import type { WebinarEvent } from './data';
import { ErHero } from './ErHero';
import { ErRegistrationCard } from './ErRegistrationCard';
import { ErFAQ } from './ErFAQ';
import { ErStickyCta } from './ErStickyCta';
import { ErTestimonials } from './ErTestimonials';
import { ErCertificateCard } from './ErCertificateCard';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './event-registration.css';

type Props = {
  event: WebinarEvent | null;
};

export function EventRegistrationExperience({ event }: Props) {
  const router = useRouter();

  if (!event) {
    return (
      <CenterScopeProvider>
        <div className="lp-page er-page">
          <LandingHeader />
          <main className="er-main">
            <section className="er-empty">
              <div className="er-wrap">
                <h1>Event Not Found</h1>
                <p>We couldn&apos;t find this webinar. It may have moved or ended.</p>
                <Link href="/resources/events-webinars" className="ui-btn ui-btn-primary">
                  Back to Events
                </Link>
              </div>
            </section>
          </main>
          <EnrollmentFooter />
          <ChatWidget />
        </div>
      </CenterScopeProvider>
    );
  }

  return (
    <CenterScopeProvider>
      <div className="lp-page er-page">
        <LandingHeader />
        <main className="er-main">
          <ErHero event={event} />
          <SectionWave
            id="er-h"
            variant="softS"
            from="#eef2ff"
            to="#ffffff"
            accent="rgba(167, 139, 250, 0.25)"
          />

          <section className="er-body">
            <div className="er-wrap er-bodyGrid">
              <div className="er-colMain">
                <div className="er-panel">
                  <h2>{event.learningHeading}</h2>
                  <ul className="er-checks">
                    {event.learningPoints.map((p) => (
                      <li key={p}>
                        <CheckCircle2 size={18} aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="er-panel er-panel--audience">
                  <h2>{event.audienceHeading}</h2>
                  <ul className="er-checks">
                    {event.audiencePoints.map((p) => (
                      <li key={p}>
                        <CheckCircle2 size={18} aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ErCertificateCard certificate={event.certificate} />
              </div>

              <div className="er-colSide">
                <ErRegistrationCard
                  event={event}
                  onSuccess={() => {
                    router.push(`/resources/events/${event.slug}/confirmation`);
                  }}
                />
              </div>
            </div>
          </section>

          {event.testimonials?.length ? (
            <ErTestimonials items={event.testimonials} />
          ) : null}

          {event.stats?.length ? (
            <section className="er-stats">
              <div className="er-wrap er-statsGrid">
                {event.stats.map((s) => (
                  <div key={s.label}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <SectionWave
            id="er-f"
            variant="ribbon"
            from="#ffffff"
            to="#f5f3ff"
            accent="rgba(167, 139, 250, 0.22)"
          />
          <ErFAQ faqs={event.faqs} />
          <SectionWave
            id="er-ff"
            variant="softS"
            from="#f5f3ff"
            to="#f5ebff"
            accent="rgba(167, 139, 250, 0.28)"
          />
        </main>
        <EnrollmentFooter />
        <ChatWidget />
        <ErStickyCta event={event} />
      </div>
    </CenterScopeProvider>
  );
}
