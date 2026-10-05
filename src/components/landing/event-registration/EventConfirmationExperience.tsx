'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Globe,
  Link2,
  Mail,
  Video,
} from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from '../enrollments/EnrollmentFooter';
import type { WebinarEvent } from './data';
import {
  buildGoogleCalendarUrl,
  buildOutlookCalendarUrl,
  detectBrowserTimeZone,
  downloadIcs,
  formatEventWhen,
} from './calendar';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import '../landing.css';
import '../features/features-mega-menu.css';
import '../enrollments/enrollments.css';
import './event-registration.css';

function LinkedInIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.24 8.25h4.52V24H.24V8.25zM8.34 8.25h4.33v2.14h.06c.6-1.14 2.08-2.34 4.28-2.34 4.58 0 5.42 3.01 5.42 6.93V24h-4.52v-7.79c0-1.86-.03-4.25-2.59-4.25-2.59 0-2.99 2.02-2.99 4.11V24H8.34V8.25z" />
    </svg>
  );
}

type Props = {
  event: WebinarEvent | null;
};

const TZ_OPTIONS = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'UTC',
];

export function EventConfirmationExperience({ event }: Props) {
  const reduced = usePrefersReducedMotion();
  const detected = useMemo(() => detectBrowserTimeZone(), []);
  const [tz, setTz] = useState(detected);
  const [copiedJoin, setCopiedJoin] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);

  useEffect(() => {
    setTz(detected);
  }, [detected]);

  if (!event) {
    return (
      <CenterScopeProvider>
        <div className="lp-page er-page">
          <LandingHeader />
          <main className="er-main">
            <section className="er-empty">
              <div className="er-wrap">
                <h1>Confirmation unavailable</h1>
                <p>We couldn&apos;t find this event confirmation.</p>
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

  const when = formatEventWhen(event.startDateTime, event.endDateTime, tz);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/resources/events/${event.slug}`
      : `/resources/events/${event.slug}`;
  const desc = event.confirmation.descriptionTemplate.replace('{title}', event.title);

  const copy = async (text: string, kind: 'join' | 'share') => {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'join') {
        setCopiedJoin(true);
        window.setTimeout(() => setCopiedJoin(false), 2000);
      } else {
        setCopiedShare(true);
        window.setTimeout(() => setCopiedShare(false), 2000);
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <CenterScopeProvider>
      <div className="lp-page er-page">
        <LandingHeader />
        <main className="er-main">
          <section className="er-confirm">
            <div className="er-confirmInner">
              <motion.div
                className="er-check"
                initial={reduced ? false : { scale: 0 }}
                animate={{ scale: [0, 1.05, 1] }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                aria-hidden
              >
                <Check size={28} strokeWidth={3} />
              </motion.div>
              <h1>{event.confirmation.title}</h1>
              <p className="er-confirmLead">
                {desc.split(event.title).map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <strong>{event.title}</strong>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  ),
                )}
              </p>

              {event.confirmation.calendarEnabled ? (
                <div className="er-calCard">
                  <p className="er-calLabel">Add to calendar</p>
                  <a
                    className="er-calRow"
                    href={buildGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Google Calendar</span>
                    <span aria-hidden>→</span>
                  </a>
                  <a
                    className="er-calRow"
                    href={buildOutlookCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Outlook</span>
                    <span aria-hidden>→</span>
                  </a>
                  <button type="button" className="er-calRow" onClick={() => downloadIcs(event)}>
                    <span>Apple Calendar · .ics</span>
                    <span aria-hidden>→</span>
                  </button>
                  <p className="er-calHint">Takes 2 seconds — pick the calendar you actually use.</p>
                </div>
              ) : null}

              <div className="er-whenCard">
                <p>
                  <CalendarDays size={16} aria-hidden />
                  {when.dateLine}
                </p>
                <p>
                  <Clock size={16} aria-hidden />
                  {when.timeLine}
                </p>
                <div className="er-tzRow">
                  <button
                    type="button"
                    className="er-tzBtn"
                    aria-expanded={tzOpen}
                    onClick={() => setTzOpen((o) => !o)}
                  >
                    <Globe size={16} aria-hidden />
                    <span>
                      {tz}
                      {tz === detected ? ' (detected)' : ''}
                    </span>
                    <ChevronDown size={15} aria-hidden />
                  </button>
                  {tzOpen ? (
                    <ul className="er-tzMenu" role="listbox">
                      {[detected, ...TZ_OPTIONS.filter((t) => t !== detected)].map((t) => (
                        <li key={t}>
                          <button
                            type="button"
                            onClick={() => {
                              setTz(t);
                              setTzOpen(false);
                            }}
                          >
                            {t}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>

              {event.confirmation.joinLink ? (
                <div className="er-joinBar">
                  <Video size={18} aria-hidden />
                  <div>
                    <em>Join link</em>
                    <p>{event.confirmation.joinLink}</p>
                  </div>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline er-copyBtn"
                    onClick={() => copy(event.confirmation.joinLink!, 'join')}
                  >
                    {copiedJoin ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <p className="er-joinSoon">
                  Your join link will be emailed before the event.
                </p>
              )}

              <div className="er-invite">
                <p className="er-calLabel">Invite a friend</p>
                <div className="er-inviteRow">
                  <a
                    className="er-social"
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on LinkedIn"
                  >
                    <LinkedInIcon size={16} />
                  </a>
                  <a
                    className="er-social"
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Share on X"
                  >
                    𝕏
                  </a>
                  <a
                    className="er-social"
                    href={`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(shareUrl)}`}
                    aria-label="Share by email"
                  >
                    <Mail size={16} />
                  </a>
                  <button
                    type="button"
                    className="er-copyLink"
                    onClick={() => copy(shareUrl, 'share')}
                  >
                    <Link2 size={14} />
                    {copiedShare ? 'Copied' : 'Copy link'}
                  </button>
                </div>
              </div>

              <p className="er-inboxHint">Check your inbox (and spam) for the join link.</p>
              <Link href="/resources/events-webinars" className="er-backEvents">
                ← Back to Events &amp; Webinars
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
