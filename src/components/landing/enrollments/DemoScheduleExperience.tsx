'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Video,
} from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from './EnrollmentFooter';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import {
  DEMO_LEAD_STORAGE_KEY,
  clampPhoneDigits,
  findDialCountry,
  isValidPhoneForCountry,
  type DemoLeadPayload,
} from './countryDialData';
import {
  CUSTOMER_STORIES,
  DEMO_TIME_SLOTS,
  DEMO_TIMEZONES,
} from './demoScheduleData';
import '../landing.css';
import '../features/features-mega-menu.css';
import './enrollments.css';
import './demo-schedule.css';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLongDate(d: Date) {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShowingDate(d: Date) {
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

export function DemoScheduleExperience() {
  const reduced = usePrefersReducedMotion();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [lead, setLead] = useState<DemoLeadPayload | null>(null);
  const [viewMonth, setViewMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 3);
    return startOfDay(d);
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timezoneId, setTimezoneId] = useState('asia-kolkata');
  const [tzOpen, setTzOpen] = useState(false);
  const [tzQuery, setTzQuery] = useState('');
  const [phase, setPhase] = useState<'schedule' | 'info' | 'done'>('schedule');
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryIso, setCountryIso] = useState('IN');
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DEMO_LEAD_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DemoLeadPayload;
      setLead(parsed);
      const names = splitName(parsed.fullName || '');
      setFirstName(names.first);
      setSurname(names.last);
      setEmail(parsed.email || '');
      setPhone(parsed.phone || '');
      setCountryIso(parsed.countryIso || 'IN');
    } catch {
      /* ignore */
    }
  }, []);

  const timezone = DEMO_TIMEZONES.find((t) => t.id === timezoneId) ?? DEMO_TIMEZONES[0];
  const country = findDialCountry(countryIso);

  const filteredTz = useMemo(() => {
    const q = tzQuery.trim().toLowerCase();
    if (!q) return DEMO_TIMEZONES;
    return DEMO_TIMEZONES.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.offset.toLowerCase().includes(q) ||
        t.id.includes(q),
    );
  }, [tzQuery]);

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const first = new Date(year, month, 1);
    const startPad = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date | null; disabled: boolean }> = [];
    for (let i = 0; i < startPad; i++) cells.push({ date: null, disabled: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startOfDay(new Date(year, month, day));
      cells.push({ date, disabled: date < today });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, disabled: true });
    return cells;
  }, [viewMonth, today]);

  const monthLabel = viewMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const canConfirm =
    firstName.trim().length > 0 &&
    surname.trim().length > 0 &&
    /\S+@\S+\.\S+/.test(email) &&
    isValidPhoneForCountry(phone, country) &&
    consent &&
    selectedTime;

  const goToInfo = () => {
    if (!selectedTime) return;
    setPhase('info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmBooking = () => {
    if (!canConfirm) return;
    setPhase('done');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <CenterScopeProvider>
      <div className="lp-page en-page ds-page">
        <div className="ds-atmosphere" aria-hidden="true">
          <span className="ds-orb ds-orb-a" />
          <span className="ds-orb ds-orb-b" />
        </div>
        <LandingHeader />

        <main className="ds-main">
          <div className="en-wrap">
            <AnimatePresence mode="wait">
              {phase === 'done' ? (
                <motion.section
                  key="done"
                  className="ds-thanks"
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <p className="ds-kicker">Demo confirmed</p>
                  <h1>You&apos;re booked, {firstName || 'there'}!</h1>
                  <p>
                    We sent a Zoom invite to <strong>{email}</strong> for{' '}
                    <strong>
                      {formatLongDate(selectedDate)} · {selectedTime}
                    </strong>
                    .
                  </p>
                  <Link href="/features/enrollments" className="ui-btn ui-btn-primary">
                    Back to Enrollments
                  </Link>
                </motion.section>
              ) : null}

              {phase === 'schedule' ? (
                <motion.section
                  key="schedule"
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <header className="ds-heroCopy">
                    <p className="ds-kicker">Book a 30-min Panacea demo</p>
                    <h1>Thanks for sharing the details.</h1>
                    <p>
                      Pick a time that works — we&apos;ll walk through enrollment AI, tours, and
                      waitlists tailored to {lead?.schoolName || 'your centers'}.
                    </p>
                  </header>

                  <motion.div
                    className="ds-scheduler"
                    initial={reduced ? false : { opacity: 0, scale: 0.97, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="ds-calPane">
                      <div className="ds-calHead">
                        <button
                          type="button"
                          className="ds-iconBtn"
                          aria-label="Previous month"
                          onClick={() =>
                            setViewMonth(
                              new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1),
                            )
                          }
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <strong>{monthLabel}</strong>
                        <button
                          type="button"
                          className="ds-iconBtn"
                          aria-label="Next month"
                          onClick={() =>
                            setViewMonth(
                              new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1),
                            )
                          }
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                      <div className="ds-weekdays" aria-hidden>
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                          <span key={d}>{d}</span>
                        ))}
                      </div>
                      <div className="ds-days">
                        {calendarCells.map((cell, idx) => {
                          if (!cell.date) {
                            return <span key={`e-${idx}`} className="ds-day is-empty" />;
                          }
                          const selected = sameDay(cell.date, selectedDate);
                          return (
                            <button
                              key={cell.date.toISOString()}
                              type="button"
                              disabled={cell.disabled}
                              className={`ds-day${selected ? ' is-selected' : ''}${
                                sameDay(cell.date, today) ? ' is-today' : ''
                              }`}
                              onClick={() => {
                                setSelectedDate(cell.date!);
                                setSelectedTime(null);
                              }}
                            >
                              {cell.date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="ds-timePane">
                      <div className="ds-metaRow">
                        <span>
                          <Video size={15} /> Meeting location · Zoom
                        </span>
                        <span>
                          <Clock3 size={15} /> 30 min
                        </span>
                      </div>
                      <h2>What time works best?</h2>
                      <p className="ds-showing">
                        Showing times for <strong>{formatShowingDate(selectedDate)}</strong>
                      </p>

                      <div className={`ds-tz${tzOpen ? ' is-open' : ''}`}>
                        <button
                          type="button"
                          className="ds-tzTrigger"
                          aria-expanded={tzOpen}
                          onClick={() => setTzOpen((v) => !v)}
                        >
                          <span>
                            {timezone.offset} {timezone.label}
                          </span>
                          <ChevronDown size={15} />
                        </button>
                        <AnimatePresence>
                          {tzOpen ? (
                            <motion.div
                              className="ds-tzMenu"
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -6 }}
                            >
                              <div className="ds-tzSearch">
                                <Search size={15} />
                                <input
                                  value={tzQuery}
                                  onChange={(e) => setTzQuery(e.target.value)}
                                  placeholder="Search"
                                  autoFocus
                                />
                              </div>
                              <ul>
                                {filteredTz.map((tz) => (
                                  <li key={tz.id}>
                                    <button
                                      type="button"
                                      className={tz.id === timezoneId ? 'is-active' : undefined}
                                      onClick={() => {
                                        setTimezoneId(tz.id);
                                        setTzOpen(false);
                                        setTzQuery('');
                                      }}
                                    >
                                      {tz.offset} {tz.label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>

                      <div className="ds-slots" role="listbox" aria-label="Available times">
                        {DEMO_TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            role="option"
                            aria-selected={selectedTime === slot}
                            className={selectedTime === slot ? 'is-selected' : undefined}
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="ui-btn ui-btn-primary ds-continue"
                        disabled={!selectedTime}
                        onClick={goToInfo}
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                </motion.section>
              ) : null}

              {phase === 'info' ? (
                <motion.section
                  key="info"
                  className="ds-info"
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h1>Your information</h1>
                  <div className="ds-apptSummary">
                    <p>
                      {formatLongDate(selectedDate)} {selectedTime}
                      <button type="button" className="ds-edit" onClick={() => setPhase('schedule')}>
                        Edit
                      </button>
                    </p>
                    <span>
                      <MapPin size={14} /> Zoom
                    </span>
                  </div>

                  <div className="ds-formGrid">
                    <label className="ui-field">
                      <span className="ui-label">First name *</span>
                      <input
                        className="ui-input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </label>
                    <label className="ui-field">
                      <span className="ui-label">Surname *</span>
                      <input
                        className="ui-input"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                      />
                    </label>
                    <label className="ui-field ds-span2">
                      <span className="ui-label">Your email address *</span>
                      <input
                        className="ui-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </label>
                    <label className="ui-field ds-span2">
                      <span className="ui-label">Phone number *</span>
                      <div className="ds-phoneLine">
                        <span className="ds-phoneCode">
                          {country.flag} {country.code}
                        </span>
                        <input
                          className="ui-input"
                          type="tel"
                          inputMode="numeric"
                          value={phone}
                          maxLength={country.maxDigits}
                          onChange={(e) =>
                            setPhone(clampPhoneDigits(e.target.value, country.maxDigits))
                          }
                        />
                      </div>
                    </label>
                  </div>

                  <div className="ds-privacy">
                    <h2>Data privacy</h2>
                    <div className="ds-privacyBox">
                      <p>
                        Panacea respects your privacy. Tick below to choose how we may contact you.
                      </p>
                      <label className="ds-check">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        <span>I agree to receive Email & SMS communications from Panacea.</span>
                      </label>
                    </div>
                  </div>

                  <div className="ds-infoActions">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => setPhase('schedule')}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary"
                      disabled={!canConfirm}
                      onClick={confirmBooking}
                    >
                      Confirm
                    </button>
                  </div>
                </motion.section>
              ) : null}
            </AnimatePresence>

            {phase !== 'done' ? (
              <section className="ds-stories" aria-labelledby="ds-stories-title">
                <div className="ds-storiesHead">
                  <h2 id="ds-stories-title">
                    While you wait, explore Customer Experiences That Inspire
                  </h2>
                  <Link
                    href="/features/enrollments/stories/bright-beginnings-academy"
                    className="ds-viewAll"
                  >
                    View all
                  </Link>
                </div>
                <div className="ds-storyGrid">
                  {CUSTOMER_STORIES.map((story, index) => (
                    <motion.article
                      key={story.id}
                      className={`ds-storyCard tone-${story.tone}`}
                      initial={reduced ? false : { opacity: 0, y: 22 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={reduced ? undefined : { y: -6 }}
                    >
                      <span className="ds-storyTag">{story.tag}</span>
                      <div className="ds-storyVisual" aria-hidden>
                        {story.tone === 'quote' ? (
                          <blockquote>
                            “{story.quote}”
                            <cite>{story.person}</cite>
                          </blockquote>
                        ) : (
                          <strong>{story.title.split(' ')[0]}</strong>
                        )}
                      </div>
                      <div className="ds-storyBody">
                        <h3>
                          {story.title}
                          <span>
                            {story.flag} {story.location}
                          </span>
                        </h3>
                        <div className="ds-featurePills">
                          {story.features.map((f) => (
                            <span key={f}>{f}</span>
                          ))}
                        </div>
                        <p>{story.summary}</p>
                        <Link href={`/features/enrollments/stories/${story.slug}`} className="ds-readMore">
                          Read More
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
