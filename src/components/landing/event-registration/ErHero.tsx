'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import type { WebinarEvent } from './data';
import { formatEventWhen } from './calendar';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function LinkedInIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V24H.24V8.25zM8.34 8.25h4.33v2.14h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.01 5.42 6.93V24h-4.52v-7.79c0-1.86-.03-4.25-2.59-4.25-2.59 0-2.99 2.02-2.99 4.11V24H8.34V8.25z" />
    </svg>
  );
}

type Props = {
  event: WebinarEvent;
};

export function ErHero({ event }: Props) {
  const reduced = usePrefersReducedMotion();
  const { dateLine, timeLine } = formatEventWhen(
    event.startDateTime,
    event.endDateTime,
    event.timezone,
  );

  const titleNode = (() => {
    if (!event.titleHighlight || !event.title.includes(event.titleHighlight)) {
      return <span>{event.title}</span>;
    }
    const [before, ...rest] = event.title.split(event.titleHighlight);
    const after = rest.join(event.titleHighlight);
    return (
      <>
        {before}
        <span className="er-titleGlow">{event.titleHighlight}</span>
        {after}
      </>
    );
  })();

  const ctaLabel =
    event.status === 'LIVE'
      ? 'Join Live Event'
      : event.status === 'ENDED'
        ? 'Event Ended'
        : event.status === 'REGISTRATION_CLOSED'
          ? 'Registration Closed'
          : 'Save My Free Seat';

  const ctaEnabled = event.status === 'UPCOMING' || event.status === 'LIVE';

  return (
    <section className="er-hero">
      <div className="er-heroWash" aria-hidden />
      <div className="er-wrap er-heroGrid">
        <motion.div
          className="er-heroCopy"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="er-badge">
            <CalendarDays size={13} aria-hidden />
            {event.badge}
          </span>
          <h1>{titleNode}</h1>
          <p className="er-heroDesc">{event.description}</p>
          <p className="er-metaLine">
            <CalendarDays size={15} aria-hidden />
            <span>
              {dateLine} · {timeLine}
            </span>
          </p>
          <p className="er-metaLine">
            <Clock size={15} aria-hidden />
            <span>{event.durationLabel}</span>
          </p>
          {ctaEnabled ? (
            <a href="#er-register" className="ui-btn ui-btn-primary er-heroCta">
              {ctaLabel}
              <ArrowRight size={16} aria-hidden />
            </a>
          ) : (
            <span className="ui-btn ui-btn-outline er-heroCta is-disabled">{ctaLabel}</span>
          )}
        </motion.div>

        <motion.div
          className="er-speakers"
          initial={reduced ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <h2>Your Workshop Leaders</h2>
          <div className="er-speakerGrid">
            {event.speakers.map((s) => (
              <article key={s.name} className="er-speakerCard">
                <div className="er-speakerTop">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.imageUrl} alt="" width={72} height={72} />
                  {s.linkedin ? (
                    <Link
                      href={s.linkedin}
                      className="er-li"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${s.name} on LinkedIn`}
                    >
                      <LinkedInIcon size={14} />
                    </Link>
                  ) : null}
                </div>
                <strong>{s.name}</strong>
                <em>
                  {s.role}
                  {s.company ? `, ${s.company}` : ''}
                </em>
              </article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
