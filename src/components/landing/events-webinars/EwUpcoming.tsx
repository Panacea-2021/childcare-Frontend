'use client';

import Link from 'next/link';
import { CalendarDays, MapPin, Video } from 'lucide-react';
import type { ResourceEvent } from './data';
import { getUpcomingEvents } from './data';
import { getWebinarBySlug } from '../event-registration/data';
import { EventImage } from './EventImage';
import { EwCarousel } from './EwCarousel';
import { EwReveal } from './EwReveal';
import { fadeUp, staggerContainer } from './motion';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function UpcomingCard({ event }: { event: ResourceEvent }) {
  const webinar = getWebinarBySlug(event.slug);
  const registerHref = webinar ? `/resources/events/${event.slug}` : null;
  const canRegister = Boolean(registerHref);

  return (
    <article className="ew-upCard">
      <Link
        href={registerHref ?? `/resources/events-webinars/${event.slug}`}
        className="ew-upMedia"
      >
        <EventImage imageUrl={event.imageUrl} alt={event.title} width={900} height={560} />
      </Link>
      <div className="ew-upBody">
        <p className="ew-type">{event.type}</p>
        <h3>
          <Link href={registerHref ?? `/resources/events-webinars/${event.slug}`}>
            {event.title}
          </Link>
        </h3>
        <p className="ew-meta">
          <CalendarDays size={14} aria-hidden />
          <span>
            {event.date} | {event.day}
          </span>
        </p>
        <p className="ew-meta">
          {event.location.toLowerCase().includes('zoom') ||
          event.location.toLowerCase().includes('live') ? (
            <Video size={14} aria-hidden />
          ) : (
            <MapPin size={14} aria-hidden />
          )}
          <span>{event.location}</span>
        </p>
        {canRegister && registerHref ? (
          <Link
            href={registerHref}
            className="ew-action"
            target="_blank"
            rel="noopener noreferrer"
          >
            Register Now <span aria-hidden>→</span>
          </Link>
        ) : (
          <span className="ew-action is-disabled">Registration coming soon</span>
        )}
      </div>
    </article>
  );
}

export function EwUpcoming() {
  const reduced = usePrefersReducedMotion();
  const events = getUpcomingEvents();

  return (
    <section className="ew-upcoming" aria-labelledby="ew-upcoming-title">
      <div className="ew-wrap">
        <EwReveal className="ew-sectionHead">
          <h2 id="ew-upcoming-title">Upcoming Events &amp; Webinars</h2>
        </EwReveal>

        {events.length === 0 ? (
          <div className="ew-empty">
            <p>No upcoming events yet.</p>
            <p>Check back soon for new early-years events and webinars.</p>
          </div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
          >
            <EwCarousel label="Upcoming events" autoplayMs={6500}>
              {events.map((event) => (
                <motion.div key={event.id} className="ew-upSlide" variants={fadeUp}>
                  <UpcomingCard event={event} />
                </motion.div>
              ))}
            </EwCarousel>
          </motion.div>
        )}
      </div>
    </section>
  );
}
