'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, Lock } from 'lucide-react';
import type { RegistrationPayload, WebinarEvent } from './data';
import { getSeatBadge, submitEventRegistration } from './data';
import { ErCountdown } from './ErCountdown';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

const COUNTRIES = [
  { code: 'IN', dial: '+91', label: 'IN +91' },
  { code: 'US', dial: '+1', label: 'US +1' },
  { code: 'AE', dial: '+971', label: 'AE +971' },
  { code: 'GB', dial: '+44', label: 'GB +44' },
  { code: 'SG', dial: '+65', label: 'SG +65' },
] as const;

type Props = {
  event: WebinarEvent;
  onSuccess: (registrationId: string) => void;
};

type Step = 1 | 2;

export function ErRegistrationCard({ event, onSuccess }: Props) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.25);
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleOpen, setRoleOpen] = useState(false);
  const roleListId = useId();
  const roleRef = useRef<HTMLDivElement | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    email: '',
    organization: '',
    phone: '',
    countryCode: 'IN',
    role: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`er-form-${event.id}`);
      if (raw) setForm((f) => ({ ...f, ...JSON.parse(raw) }));
    } catch {
      /* ignore */
    }
  }, [event.id]);

  useEffect(() => {
    try {
      sessionStorage.setItem(`er-form-${event.id}`, JSON.stringify(form));
    } catch {
      /* ignore */
    }
  }, [event.id, form]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!roleRef.current?.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (!event.registration.enabled || event.status === 'REGISTRATION_CLOSED') {
    return (
      <aside className="er-regCard er-regCard--closed">
        <h3>Registration Closed</h3>
        <p>This event is no longer accepting new registrations.</p>
      </aside>
    );
  }

  if (event.status === 'ENDED') {
    return (
      <aside className="er-regCard er-regCard--closed">
        <h3>Event Ended</h3>
        <p>This webinar has concluded. Check Past Events for the recording.</p>
      </aside>
    );
  }

  const dial = COUNTRIES.find((c) => c.code === form.countryCode)?.dial ?? '+91';

  const validateStep1 = () => {
    const next: Record<string, string> = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required.';
    if (!form.email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (!form.organization.trim()) next.organization = 'Organization is required.';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 7) {
      next.phone = 'Enter a valid phone number.';
    }
    if (!form.role) next.role = 'Please select your role.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onComplete = async () => {
    if (!validateStep2()) return;
    setSubmitting(true);
    setError(null);
    const payload: RegistrationPayload = {
      firstName: form.firstName.trim(),
      email: form.email.trim(),
      organization: form.organization.trim(),
      phone: `${dial} ${form.phone.trim()}`,
      countryCode: form.countryCode,
      role: form.role,
    };
    const res = await submitEventRegistration(event.id, payload);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    try {
      sessionStorage.removeItem(`er-form-${event.id}`);
      sessionStorage.setItem(
        `er-reg-${event.slug}`,
        JSON.stringify({ registrationId: res.registrationId, ...payload }),
      );
    } catch {
      /* ignore */
    }
    onSuccess(res.registrationId);
  };

  return (
    <aside
      ref={ref}
      id="er-register"
      className={`er-regCard${roleOpen ? ' is-roleOpen' : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduced
          ? undefined
          : {
              transform: `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }
      }
    >
      <div className="er-regGlow" aria-hidden />
      <span className="er-seatPill">
        <span className="er-seatDot" aria-hidden />
        {getSeatBadge(event)}
      </span>
      <h3>Claim Your Free Seat</h3>
      <div className="er-trustRow" aria-label="Security certifications">
        <span className="er-trustBadge er-trustBadge--gdpr">GDPR</span>
        <span className="er-trustBadge er-trustBadge--soc">SOC</span>
        <span className="er-trustBadge er-trustBadge--coppa">COPPA</span>
      </div>

      {event.countdownEnabled ? (
        <ErCountdown startDateTime={event.startDateTime} endDateTime={event.endDateTime} />
      ) : null}

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="s1"
            className="er-step"
            initial={reduced ? false : { opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -25 }}
            transition={{ duration: 0.4 }}
          >
            <p className="er-stepTitle">Let&apos;s Start With Your Details</p>
            <label className="er-field">
              <span className="ui-label">First Name *</span>
              <input
                className="ui-input er-input"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                placeholder="First Name *"
                autoComplete="given-name"
              />
              {fieldErrors.firstName ? <em className="er-err">{fieldErrors.firstName}</em> : null}
            </label>
            <label className="er-field">
              <span className="ui-label">Email Address *</span>
              <input
                className="ui-input er-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email Address *"
                autoComplete="email"
              />
              {fieldErrors.email ? <em className="er-err">{fieldErrors.email}</em> : null}
            </label>
            <button
              type="button"
              className="ui-btn ui-btn-primary er-regBtn"
              onClick={() => {
                if (validateStep1()) setStep(2);
              }}
            >
              Get started
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="s2"
            className="er-step"
            initial={reduced ? false : { opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -25 }}
            transition={{ duration: 0.4 }}
          >
            <p className="er-stepTitle">Almost Done. One Final Step</p>
            <label className="er-field">
              <span className="ui-label">Organization Name *</span>
              <input
                className="ui-input er-input"
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                placeholder="Organization Name *"
                autoComplete="organization"
              />
              {fieldErrors.organization ? (
                <em className="er-err">{fieldErrors.organization}</em>
              ) : null}
            </label>
            <div className="er-phoneRow">
              <label className="er-field er-field--dial">
                <span className="ui-label">Code</span>
                <select
                  className="ui-select er-input"
                  value={form.countryCode}
                  onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
                  aria-label="Country code"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="er-field er-field--phone">
                <span className="ui-label">Phone Number *</span>
                <input
                  className="ui-input er-input"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="Phone Number *"
                  autoComplete="tel-national"
                  inputMode="tel"
                />
                {fieldErrors.phone ? <em className="er-err">{fieldErrors.phone}</em> : null}
              </label>
            </div>

            <div className="er-field" ref={roleRef}>
              <span className="ui-label" id={`${roleListId}-label`}>
                Select Your Role *
              </span>
              <button
                type="button"
                className={`er-roleTrigger${roleOpen ? ' is-open' : ''}`}
                aria-haspopup="listbox"
                aria-expanded={roleOpen}
                aria-labelledby={`${roleListId}-label`}
                onClick={() => setRoleOpen((o) => !o)}
              >
                <span>{form.role || 'Select Your Role *'}</span>
                <ChevronDown size={16} aria-hidden />
              </button>
              {roleOpen ? (
                <ul className="er-roleMenu" role="listbox" id={roleListId}>
                  {event.registration.roles.map((role) => (
                    <li key={role} role="option" aria-selected={form.role === role}>
                      <button
                        type="button"
                        className={form.role === role ? 'is-selected' : undefined}
                        onClick={() => {
                          setForm((f) => ({ ...f, role }));
                          setRoleOpen(false);
                        }}
                      >
                        {form.role === role ? <Check size={14} aria-hidden /> : null}
                        {role}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {fieldErrors.role ? <em className="er-err">{fieldErrors.role}</em> : null}
            </div>

            {error ? <p className="er-formError">{error}</p> : null}

            <div className="er-stepActions">
              <button
                type="button"
                className="ui-btn ui-btn-outline er-backBtn"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <ArrowLeft size={15} aria-hidden />
                Back
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-primary er-regBtn"
                onClick={onComplete}
                disabled={submitting}
              >
                {submitting ? 'Registering…' : 'Complete Registration'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="er-secure">
        <Lock size={13} aria-hidden />
        Your information is secure · No spam
      </p>
    </aside>
  );
}
