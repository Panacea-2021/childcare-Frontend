'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, Search, X } from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import {
  DEMO_LEAD_STORAGE_KEY,
  DIAL_COUNTRIES,
  clampPhoneDigits,
  findDialCountry,
  isValidPhoneForCountry,
  type DemoLeadPayload,
} from './countryDialData';
import './see-it-in-action-modal.css';

type Props = {
  open: boolean;
  onClose: () => void;
};

const CENTER_OPTIONS = [
  '1-2 Centers',
  '3-10 Centers',
  '11-50 Centers',
  '50+ Centers',
  'Planning to Open',
  'Home Daycare',
] as const;

const ROLE_BY_CENTER: Record<string, string[]> = {
  '1-2 Centers': [
    'Center Owner',
    'Center Director',
    'Teacher',
    'IT/Administrator',
    'Academic Head',
    'Other',
  ],
  '3-10 Centers': [
    'Center Owner',
    'Multi-site Supervisor',
    'IT/Administrator',
    'Center Manager',
    'Academic Head',
    'Other',
  ],
  '11-50 Centers': [
    'Executive (CXO/Founder)',
    'Operations (VP/Director)',
    'Regional Operations (Head/Director)',
    'IT (CIO/VP/Director)',
    'Center Director/Head of School',
    'Other',
  ],
  '50+ Centers': [
    'Executive (CXO/Founder)',
    'Operations (VP/Director)',
    'Regional Operations (Head/Director)',
    'IT (CIO/VP/Director)',
    'Center Director/Head of School',
    'Other',
  ],
  'Planning to Open': [
    'Center Owner',
    'Center Director',
    'Teacher',
    'IT/Administrator',
    'Academic Head',
    'Other',
  ],
  'Home Daycare': [
    'Center Owner',
    'Center Director',
    'Teacher',
    'IT/Administrator',
    'Academic Head',
    'Other',
  ],
};

type FormState = {
  fullName: string;
  schoolName: string;
  email: string;
  countryIso: string;
  phone: string;
  centers: string;
  role: string;
};

const INITIAL: FormState = {
  fullName: '',
  schoolName: '',
  email: '',
  countryIso: 'IN',
  phone: '',
  centers: '',
  role: '',
};

export function SeeItInActionModal({ open, onClose }: Props) {
  const router = useRouter();
  const reduced = usePrefersReducedMotion();
  const titleId = useId();
  const dialRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [openMenu, setOpenMenu] = useState<'centers' | 'role' | 'dial' | null>(null);
  const [dialQuery, setDialQuery] = useState('');

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openMenu) setOpenMenu(null);
        else onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, openMenu]);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setForm(INITIAL);
      setOpenMenu(null);
      setDialQuery('');
    }
  }, [open]);

  useEffect(() => {
    if (openMenu !== 'dial') return;
    const onDoc = (e: MouseEvent) => {
      if (!dialRef.current?.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openMenu]);

  const country = useMemo(() => findDialCountry(form.countryIso), [form.countryIso]);

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

  const roles = useMemo(() => {
    if (!form.centers) return [];
    return ROLE_BY_CENTER[form.centers] ?? ROLE_BY_CENTER['1-2 Centers'];
  }, [form.centers]);

  const firstName = form.fullName.trim().split(/\s+/)[0] || 'there';

  const canNext =
    step === 0
      ? form.fullName.trim().length > 1 && form.schoolName.trim().length > 1
      : step === 1
        ? /\S+@\S+\.\S+/.test(form.email) && isValidPhoneForCountry(form.phone, country)
        : Boolean(form.centers && form.role);

  const goNext = () => {
    if (!canNext) return;
    if (step < 2) {
      setStep((s) => s + 1);
      setOpenMenu(null);
      return;
    }

    const payload: DemoLeadPayload = {
      fullName: form.fullName.trim(),
      schoolName: form.schoolName.trim(),
      email: form.email.trim(),
      countryIso: form.countryIso,
      countryCode: country.code,
      phone: form.phone,
      centers: form.centers,
      role: form.role,
    };

    try {
      sessionStorage.setItem(DEMO_LEAD_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    onClose();
    router.push('/features/enrollments/book-demo');
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="sia-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0.12 : 0.28 }}
        >
          <button type="button" className="sia-backdrop" aria-label="Close dialog" onClick={onClose} />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="sia-panel"
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: 28, scale: 0.94, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97, filter: 'blur(6px)' }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="sia-glow" aria-hidden="true" />

            <div className="sia-top">
              {step > 0 ? (
                <button
                  type="button"
                  className="sia-iconBtn"
                  aria-label="Back"
                  onClick={() => {
                    setStep((s) => Math.max(0, s - 1));
                    setOpenMenu(null);
                  }}
                >
                  <ArrowLeft size={18} />
                </button>
              ) : (
                <span className="sia-iconSpacer" />
              )}
              <button type="button" className="sia-iconBtn" aria-label="Close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="sia-progress">
              <p>Book A 30-min Meeting</p>
              <div className="sia-steps" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i <= step ? 'is-on' : undefined} />
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                className="sia-body"
                initial={reduced ? false : { opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: -14 }}
                transition={{ duration: 0.28 }}
              >
                {step === 0 ? (
                  <>
                    <h2 id={titleId}>Hi There! Introduce Yourself</h2>
                    <label className="sia-field">
                      <span className="sia-sr">Full Name</span>
                      <input
                        className="ui-input sia-input"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                        autoComplete="name"
                      />
                    </label>
                    <label className="sia-field">
                      <span className="sia-sr">School&apos;s Name</span>
                      <input
                        className="ui-input sia-input"
                        placeholder="School's Name"
                        value={form.schoolName}
                        onChange={(e) => setForm((f) => ({ ...f, schoolName: e.target.value }))}
                        autoComplete="organization"
                      />
                    </label>
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary sia-cta"
                      disabled={!canNext}
                      onClick={goNext}
                    >
                      Next
                    </button>
                  </>
                ) : null}

                {step === 1 ? (
                  <>
                    <h2 id={titleId}>Where Should We Send The Invite Link?</h2>
                    <label className="sia-field">
                      <span className="sia-sr">Work Email</span>
                      <input
                        className="ui-input sia-input"
                        type="email"
                        placeholder="Work Email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        autoComplete="email"
                      />
                    </label>
                    <div className="sia-phoneRow">
                      <div
                        className={`sia-dial${openMenu === 'dial' ? ' is-open' : ''}`}
                        ref={dialRef}
                      >
                        <button
                          type="button"
                          className="sia-dialTrigger"
                          aria-expanded={openMenu === 'dial'}
                          aria-label="Country code"
                          onClick={() => {
                            setOpenMenu((m) => (m === 'dial' ? null : 'dial'));
                            setDialQuery('');
                          }}
                        >
                          <span className="sia-flag" aria-hidden>
                            {country.flag}
                          </span>
                          <span>{country.code}</span>
                          <ChevronDown size={14} />
                        </button>
                        <AnimatePresence>
                          {openMenu === 'dial' ? (
                            <motion.div
                              className="sia-dialMenu"
                              initial={{ opacity: 0, y: -8, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                              transition={{ duration: 0.18 }}
                            >
                              <div className="sia-dialSearch">
                                <Search size={15} aria-hidden />
                                <input
                                  value={dialQuery}
                                  onChange={(e) => setDialQuery(e.target.value)}
                                  placeholder="Search country"
                                  autoFocus
                                />
                              </div>
                              <ul className="sia-dialList" role="listbox">
                                {filteredCountries.map((c) => (
                                  <li key={`${c.iso}-${c.code}`}>
                                    <button
                                      type="button"
                                      role="option"
                                      aria-selected={form.countryIso === c.iso}
                                      className={form.countryIso === c.iso ? 'is-active' : undefined}
                                      onClick={() => {
                                        setForm((f) => ({
                                          ...f,
                                          countryIso: c.iso,
                                          phone: clampPhoneDigits(f.phone, c.maxDigits),
                                        }));
                                        setOpenMenu(null);
                                        setDialQuery('');
                                      }}
                                    >
                                      <span className="sia-flag">{c.flag}</span>
                                      <span className="sia-dialMeta">
                                        <strong>{c.name}</strong>
                                        <em>{c.code}</em>
                                      </span>
                                    </button>
                                  </li>
                                ))}
                                {filteredCountries.length === 0 ? (
                                  <li className="sia-dialEmpty">No countries found</li>
                                ) : null}
                              </ul>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                      <label className="sia-field sia-phone">
                        <span className="sia-sr">Phone Number</span>
                        <input
                          className="ui-input sia-input"
                          type="tel"
                          inputMode="numeric"
                          placeholder={`Phone Number (${country.maxDigits} digits)`}
                          value={form.phone}
                          maxLength={country.maxDigits}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              phone: clampPhoneDigits(e.target.value, country.maxDigits),
                            }))
                          }
                          autoComplete="tel-national"
                        />
                      </label>
                    </div>
                    <p className="sia-hint">
                      {country.flag} {country.name} · enter {country.minDigits ?? country.maxDigits}
                      {country.minDigits && country.minDigits !== country.maxDigits
                        ? `–${country.maxDigits}`
                        : ''}{' '}
                      digits
                    </p>
                    <button
                      type="button"
                      className="ui-btn ui-btn-primary sia-cta"
                      disabled={!canNext}
                      onClick={goNext}
                    >
                      Next
                    </button>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <h2 id={titleId}>Hey {firstName}, We&apos;ll Make A Custom Demo For Next</h2>

                    <div className={`sia-dropdown${openMenu === 'centers' ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="sia-dropTrigger"
                        aria-expanded={openMenu === 'centers'}
                        onClick={() => setOpenMenu((m) => (m === 'centers' ? null : 'centers'))}
                      >
                        <span>{form.centers || 'Select No of Centers'}</span>
                        <ChevronDown size={16} />
                      </button>
                      <AnimatePresence>
                        {openMenu === 'centers' ? (
                          <motion.ul
                            className="sia-dropList"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                          >
                            {CENTER_OPTIONS.map((opt) => (
                              <li key={opt}>
                                <button
                                  type="button"
                                  className={form.centers === opt ? 'is-active' : undefined}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, centers: opt, role: '' }));
                                    setOpenMenu(null);
                                  }}
                                >
                                  {opt}
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    <div className={`sia-dropdown${openMenu === 'role' ? ' is-open' : ''}`}>
                      <button
                        type="button"
                        className="sia-dropTrigger"
                        aria-expanded={openMenu === 'role'}
                        disabled={!form.centers}
                        onClick={() => setOpenMenu((m) => (m === 'role' ? null : 'role'))}
                      >
                        <span>{form.role || 'Select your role'}</span>
                        <ChevronDown size={16} />
                      </button>
                      <AnimatePresence>
                        {openMenu === 'role' ? (
                          <motion.ul
                            className="sia-dropList"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.18 }}
                          >
                            {roles.map((opt) => (
                              <li key={opt}>
                                <button
                                  type="button"
                                  className={form.role === opt ? 'is-active' : undefined}
                                  onClick={() => {
                                    setForm((f) => ({ ...f, role: opt }));
                                    setOpenMenu(null);
                                  }}
                                >
                                  {opt}
                                </button>
                              </li>
                            ))}
                          </motion.ul>
                        ) : null}
                      </AnimatePresence>
                    </div>

                    <button
                      type="button"
                      className="ui-btn ui-btn-primary sia-cta"
                      disabled={!canNext}
                      onClick={goNext}
                    >
                      Pick A Time & Date
                    </button>
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>

            <p className="sia-trust">
              Trusted by <strong>3000+</strong> Childcare Directors & Owners
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
