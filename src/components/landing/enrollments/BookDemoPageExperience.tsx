'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronDown, Search } from 'lucide-react';
import { LandingHeader } from '../LandingHeader';
import { ChatWidget } from '../../ChatWidget';
import { CenterScopeProvider } from '@/components/organization/CenterScopeContext';
import { EnrollmentFooter } from './EnrollmentFooter';
import { FancySelect } from './FancySelect';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import {
  DEMO_LEAD_STORAGE_KEY,
  DIAL_COUNTRIES,
  clampPhoneDigits,
  findDialCountry,
  isValidPhoneForCountry,
  type DemoLeadPayload,
} from './countryDialData';
import '../landing.css';
import '../features/features-mega-menu.css';
import './enrollments.css';
import './book-demo-page.css';

const SESSION_POINTS = [
  'A live walkthrough tailored to your center',
  'Time-saving tips for directors and teachers',
  'Guidance on setup, onboarding, and support',
];

const TRUST_LOGOS = ['Guidepost', 'Daisy Park', 'Bright Horizons', 'Kids Spot'];

const CENTER_OPTIONS = [
  '1-2 Centers',
  '3-10 Centers',
  '11-50 Centers',
  '50+ Centers',
  'Planning to Open',
  'Home Daycare',
];

const ROLE_OPTIONS = [
  'Center Owner',
  'Center Director',
  'Multi-site Supervisor',
  'Teacher',
  'IT/Administrator',
  'Academic Head',
  'Executive (CXO/Founder)',
  'Operations (VP/Director)',
  'Other',
];

export function BookDemoPageExperience() {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const dialRef = useRef<HTMLDivElement>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryIso, setCountryIso] = useState('IN');
  const [centers, setCenters] = useState('');
  const [role, setRole] = useState('');
  const [consent, setConsent] = useState(false);
  const [dialOpen, setDialOpen] = useState(false);
  const [dialQuery, setDialQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const country = useMemo(() => findDialCountry(countryIso), [countryIso]);

  const filteredCountries = useMemo(() => {
    const q = dialQuery.trim().toLowerCase();
    if (!q) return DIAL_COUNTRIES;
    return DIAL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [dialQuery]);

  useEffect(() => {
    if (!dialOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!dialRef.current?.contains(e.target as Node)) setDialOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [dialOpen]);

  const canSubmit =
    fullName.trim().length > 1 &&
    /\S+@\S+\.\S+/.test(email) &&
    schoolName.trim().length > 1 &&
    isValidPhoneForCountry(phone, country) &&
    Boolean(centers) &&
    Boolean(role) &&
    consent;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    const payload: DemoLeadPayload = {
      fullName: fullName.trim(),
      schoolName: schoolName.trim(),
      email: email.trim(),
      countryIso,
      countryCode: country.code,
      phone,
      centers,
      role,
    };

    try {
      sessionStorage.setItem(DEMO_LEAD_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    router.push('/features/enrollments/book-demo');
  };

  return (
    <CenterScopeProvider>
      <div className="lp-page en-page bd-page">
        <LandingHeader />

        <main className="bd-main">
          <div className="bd-atmosphere" aria-hidden>
            <span className="bd-orb bd-orb-a" />
            <span className="bd-orb bd-orb-b" />
            <span className="bd-wave" />
          </div>

          <div className="en-wrap bd-layout">
            <motion.div
              className="bd-copy"
              initial={reduced ? false : { opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1>
                Simplify Childcare with <span>Panacea</span>
              </h1>
              <p className="bd-lead">
                See how we help centers save time, go paperless, and delight parents.
              </p>

              <h2>What you&apos;ll get from this session</h2>
              <ul className="bd-points">
                {SESSION_POINTS.map((point, i) => (
                  <motion.li
                    key={point}
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.07 }}
                  >
                    <CheckCircle2 size={18} aria-hidden />
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="bd-trust">
                <p>Trusted by 3000+ Childcare Centers Globally</p>
                <div className="bd-logos" aria-label="Trusted brands">
                  {TRUST_LOGOS.map((name) => (
                    <span key={name}>{name}</span>
                  ))}
                </div>
              </div>

              <div className="bd-mascot" aria-hidden>
                <span className="bd-sun" />
              </div>
            </motion.div>

            <motion.form
              className="bd-formCard"
              onSubmit={onSubmit}
              initial={reduced ? false : { opacity: 0, y: 22, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.08, duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bd-formGrid">
                <label className="ui-field">
                  <span className="ui-label">Full Name</span>
                  <input
                    className="ui-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    autoComplete="name"
                    required
                  />
                </label>
                <label className="ui-field">
                  <span className="ui-label">Email</span>
                  <input
                    className="ui-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work Email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="ui-field">
                  <span className="ui-label">School Name</span>
                  <input
                    className="ui-input"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="School's Name"
                    autoComplete="organization"
                    required
                  />
                </label>
                <div className="ui-field">
                  <span className="ui-label">Phone Number</span>
                  <div className="bd-phoneRow">
                    <div className={`bd-dial${dialOpen ? ' is-open' : ''}`} ref={dialRef}>
                      <button
                        type="button"
                        className="bd-dialTrigger"
                        aria-expanded={dialOpen}
                        onClick={() => {
                          setDialOpen((v) => !v);
                          setDialQuery('');
                        }}
                      >
                        <span>{country.flag}</span>
                        <span>{country.code}</span>
                        <ChevronDown size={14} />
                      </button>
                      <AnimatePresence>
                        {dialOpen ? (
                          <motion.div
                            className="bd-dialMenu"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                          >
                            <div className="bd-dialSearch">
                              <Search size={14} />
                              <input
                                value={dialQuery}
                                onChange={(e) => setDialQuery(e.target.value)}
                                placeholder="Search country"
                                autoFocus
                              />
                            </div>
                            <ul>
                              {filteredCountries.map((c) => (
                                <li key={`${c.iso}-${c.code}`}>
                                  <button
                                    type="button"
                                    className={countryIso === c.iso ? 'is-active' : undefined}
                                    onClick={() => {
                                      setCountryIso(c.iso);
                                      setPhone((p) => clampPhoneDigits(p, c.maxDigits));
                                      setDialOpen(false);
                                    }}
                                  >
                                    <span>{c.flag}</span>
                                    <strong>{c.name}</strong>
                                    <em>{c.code}</em>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                    <input
                      className="ui-input"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Phone Number"
                      value={phone}
                      maxLength={country.maxDigits}
                      onChange={(e) =>
                        setPhone(clampPhoneDigits(e.target.value, country.maxDigits))
                      }
                      required
                    />
                  </div>
                </div>
                <FancySelect
                  label="No of Centers"
                  placeholder="Select No of Centers"
                  value={centers}
                  options={CENTER_OPTIONS}
                  onChange={setCenters}
                  required
                />
                <FancySelect
                  label="Role"
                  placeholder="Select your role"
                  value={role}
                  options={ROLE_OPTIONS}
                  onChange={setRole}
                  required
                />
              </div>

              <label className="bd-consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  By checking this box, I agree to receive informational and marketing calls or
                  texts from Panacea. Consent is not a condition of purchase. Msg &amp; data rates
                  may apply. Reply STOP to opt out.
                </span>
              </label>

              <button
                type="submit"
                className="ui-btn ui-btn-primary bd-submit"
                disabled={!canSubmit || submitting}
              >
                {submitting ? 'Opening scheduler…' : 'Book a Demo'}
              </button>
            </motion.form>
          </div>
        </main>

        <EnrollmentFooter />
        <ChatWidget />
      </div>
    </CenterScopeProvider>
  );
}
