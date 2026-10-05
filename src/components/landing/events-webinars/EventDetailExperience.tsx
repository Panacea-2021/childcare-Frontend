'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CalendarDays, MapPin, Video } from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import { SectionWave } from '../shared/SectionWave';
import type { ResourceEvent } from './data';
import { EventImage } from './EventImage';
import { EwSubscribe } from './EwSubscribe';
import { VideoModal } from './VideoModal';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './events-webinars.css';

type Props = {
  event: ResourceEvent | null;
};

export function EventDetailExperience({ event }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!event) {
    return (
      <CenterScopeProvider>
        <div className="lp-page ew-page">
          <LandingHeader />
          <main className="ew-main">
            <section className="ew-error">
              <div className="ew-wrap">
                <h1>Event unavailable</h1>
                <p>We couldn&apos;t find this event. It may have moved or ended.</p>
                <Link href="/resources/events-webinars" className="ui-btn ui-btn-primary">
                  Back to Events &amp; Webinars
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

  const isPast = event.status === 'PAST';
  const canRegister = Boolean(event.registrationUrl);
  const canWatch = Boolean(event.recordingUrl);

  return (
    <CenterScopeProvider>
      <div className="lp-page ew-page">
        <LandingHeader />
        <main className="ew-main">
          <section className="ew-detailHero">
            <div className="ew-wrap ew-detailGrid">
              <div>
                <Link href="/resources/events-webinars" className="ew-back">
                  <ArrowLeft size={14} aria-hidden />
                  Events &amp; Webinars
                </Link>
                <p className="ew-type">{event.type}</p>
                <h1>{event.title}</h1>
                <p className="ew-meta">
                  <CalendarDays size={15} aria-hidden />
                  {event.date} | {event.day}
                </p>
                <p className="ew-meta">
                  {event.location.toLowerCase().includes('zoom') ||
                  event.location.toLowerCase().includes('live') ? (
                    <Video size={15} aria-hidden />
                  ) : (
                    <MapPin size={15} aria-hidden />
                  )}
                  {event.location}
                </p>
                {event.excerpt ? <p className="ew-detailLead">{event.excerpt}</p> : null}
                {isPast && canWatch ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-primary"
                    onClick={() => setModalOpen(true)}
                  >
                    Watch Recording
                  </button>
                ) : canRegister && event.registrationUrl ? (
                  <Link href={event.registrationUrl} className="ui-btn ui-btn-primary">
                    Register Now
                  </Link>
                ) : (
                  <span className="ew-action is-disabled">Details coming soon</span>
                )}
              </div>
              <div className="ew-detailMedia">
                <EventImage
                  imageUrl={event.imageUrl}
                  alt={event.title}
                  loading="eager"
                  fetchPriority="high"
                  width={960}
                  height={540}
                />
              </div>
            </div>
          </section>
          <SectionWave
            id="ew-d"
            variant="softS"
            from="#fff5f8"
            to="#fce7f3"
            accent="rgba(244, 114, 182, 0.22)"
          />
          <EwSubscribe />
          <SectionWave
            id="ew-df"
            variant="softS"
            from="#fce7f3"
            to="#f5ebff"
            accent="rgba(167, 139, 250, 0.28)"
          />
        </main>
        <EnrollmentFooter />
        <ChatWidget />
        <VideoModal
          open={modalOpen}
          title={event.title}
          videoUrl={event.recordingUrl ?? ''}
          onClose={() => setModalOpen(false)}
        />
      </div>
    </CenterScopeProvider>
  );
}
