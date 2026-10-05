'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Heart,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { CONTACT_INFO } from '../blogs/data';
import { CallGrid, OfficeGrid } from './ContactInfoGrids';
import { fadeUp, floatAnim, scaleIn, staggerContainer } from '../blogs/motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import {
  DIAL_COUNTRIES,
  clampPhoneDigits,
  findDialCountry,
  isValidPhoneForCountry,
} from '../enrollments/countryDialData';

type FormState = {
  firstName: string;
  email: string;
  company: string;
  phone: string;
  countryIso: string;
  description: string;
};

const INITIAL: FormState = {
  firstName: '',
  email: '',
  company: '',
  phone: '',
  countryIso: 'US',
  description: '',
};

export function ContactSection() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const { ref: formTiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.28);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const orbLeftY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);
  const orbRightY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -28]);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [dialOpen, setDialOpen] = useState(false);
  const [dialQuery, setDialQuery] = useState('');

  const country = useMemo(() => findDialCountry(form.countryIso), [form.countryIso]);

  const filteredDial = useMemo(() => {
    const q = dialQuery.trim().toLowerCase();
    if (!q) return DIAL_COUNTRIES;
    return DIAL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.code.includes(q),
    );
  }, [dialQuery]);

  useEffect(() => {
    if (!dialOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!dialRef.current?.contains(e.target as Node)) setDialOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [dialOpen]);

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email';
    }
    if (!form.company.trim()) next.company = 'Company name is required';
    if (!isValidPhoneForCountry(form.phone, country)) {
      next.phone = 'Enter a valid phone number';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      // UI-only submission (no API wired on marketing contact yet)
      setSuccess(true);
    }, 800);
  };

  return (
    <section ref={sectionRef} className="ct-section">
      <div className="ct-ambient" aria-hidden>
        <motion.div className="ct-orb ct-orb--lavender" style={{ y: orbLeftY }} />
        <motion.div className="ct-orb ct-orb--cyan" style={{ y: orbRightY }} />
        <div className="ct-orb ct-orb--cream" />
        <div className="ct-orb ct-orb--bottom" />

        <motion.span
          className="ct-float ct-float--star"
          {...(reduced ? {} : floatAnim(7, 6.5, 0.2))}
        >
          <Star size={14} fill="currentColor" strokeWidth={0} />
        </motion.span>
        <motion.span
          className="ct-float ct-float--spark"
          {...(reduced ? {} : floatAnim(6, 7.2, 0.9))}
        >
          <Sparkles size={16} strokeWidth={1.8} />
        </motion.span>
        <motion.span
          className="ct-float ct-float--heart"
          {...(reduced ? {} : floatAnim(8, 8, 1.3))}
        >
          <Heart size={14} fill="currentColor" strokeWidth={0} />
        </motion.span>
        <motion.span
          className="ct-float ct-float--block"
          {...(reduced ? {} : floatAnim(5, 5.8, 0.5))}
        />
        <motion.span
          className="ct-float ct-float--block2"
          {...(reduced ? {} : floatAnim(6, 6.8, 1.1))}
        />
      </div>

      <div className="ct-wrap ct-layout">
        <motion.div
          className="ct-info"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="ct-kicker" variants={fadeUp}>
            <Sparkles size={13} aria-hidden /> We&apos;re here to help
          </motion.p>
          <motion.h1 variants={fadeUp}>{CONTACT_INFO.heading}</motion.h1>
          <motion.p className="ct-intro" variants={fadeUp}>
            {CONTACT_INFO.intro}
          </motion.p>

          <motion.div className="ct-block" variants={fadeUp}>
            <h2>
              <Mail size={16} aria-hidden /> Email Us
            </h2>
            <div className="ct-emailCards">
              {CONTACT_INFO.emails.map((item, i) => (
                <motion.a
                  key={item.value}
                  href={`mailto:${item.value}`}
                  className="ct-emailCard"
                  variants={fadeUp}
                  custom={i}
                  whileHover={reduced ? undefined : { y: -3 }}
                >
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div className="ct-block" variants={fadeUp}>
            <h2>
              <Building2 size={16} aria-hidden /> Our Offices
            </h2>
            <OfficeGrid />
          </motion.div>

          <motion.div className="ct-block" variants={fadeUp}>
            <h2>
              <Phone size={16} aria-hidden /> Call Us
            </h2>
            <CallGrid />
          </motion.div>

          <motion.div
            className="ct-illus"
            aria-hidden
            {...(reduced ? {} : floatAnim(7, 6.8, 0.35))}
          >
            <span className="ct-illusBubble">
              <MessageCircle size={22} strokeWidth={1.7} />
            </span>
            <span className="ct-illusDot" />
            <span className="ct-illusDot ct-illusDot--b" />
          </motion.div>
        </motion.div>

        <div className="ct-formCol">
          <div className="ct-formOrbs" aria-hidden>
            <span className="ct-formOrb ct-formOrb--a" />
            <span className="ct-formOrb ct-formOrb--b" />
            <span className="ct-formOrb ct-formOrb--c" />
          </div>

          <motion.div
            className="ct-formShell"
            variants={scaleIn}
            initial={reduced ? false : 'hidden'}
            animate="show"
          >
            <motion.div
              ref={formTiltRef}
              className="ct-formTilt"
              onMouseMove={(e) => {
                if (window.innerWidth < 900) return;
                onMove(e);
              }}
              onMouseLeave={onLeave}
              style={{
                rotateX: reduced ? 0 : `${tilt.rx}deg`,
                rotateY: reduced ? 0 : `${tilt.ry}deg`,
                transformStyle: 'preserve-3d',
                perspective: 1200,
              }}
            >
              {success ? (
                <div className="ct-success">
                  <span className="ct-successIcon" aria-hidden>
                    <CheckCircle2 size={40} strokeWidth={1.55} />
                  </span>
                  <h2>Thanks for reaching out!</h2>
                  <p>
                    We&apos;ve received your message and our team will get back to you shortly.
                  </p>
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline"
                    onClick={() => {
                      setSuccess(false);
                      setForm(INITIAL);
                      setErrors({});
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="ct-form" onSubmit={onSubmit} noValidate>
                  <div className="ct-formHead">
                    <h2>Tell us more about you</h2>
                    <p>Share a few details and we&apos;ll follow up within one business day.</p>
                  </div>

                  <div className="ct-fields">
                    <div className="ct-field">
                      <label htmlFor="ct-firstName">First name *</label>
                      <input
                        id="ct-firstName"
                        value={form.firstName}
                        onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                        autoComplete="given-name"
                        placeholder="Alex"
                        className={errors.firstName ? 'is-error' : ''}
                      />
                      {errors.firstName ? <em>{errors.firstName}</em> : null}
                    </div>

                    <div className="ct-field">
                      <label htmlFor="ct-email">Email *</label>
                      <input
                        id="ct-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        autoComplete="email"
                        placeholder="you@center.com"
                        className={errors.email ? 'is-error' : ''}
                      />
                      {errors.email ? <em>{errors.email}</em> : null}
                    </div>

                    <div className="ct-field">
                      <label htmlFor="ct-company">Company name *</label>
                      <input
                        id="ct-company"
                        value={form.company}
                        onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                        autoComplete="organization"
                        placeholder="Sunshine Daycare"
                        className={errors.company ? 'is-error' : ''}
                      />
                      {errors.company ? <em>{errors.company}</em> : null}
                    </div>

                    <div className="ct-field">
                      <label htmlFor="ct-phone">Phone number *</label>
                      <div className={`ct-phone${errors.phone ? ' is-error' : ''}`} ref={dialRef}>
                        <button
                          type="button"
                          className="ct-dialBtn"
                          aria-expanded={dialOpen}
                          aria-haspopup="listbox"
                          onClick={() => setDialOpen((v) => !v)}
                        >
                          <span aria-hidden>{country.flag}</span>
                          <em>{country.code}</em>
                          <ChevronDown size={14} aria-hidden />
                        </button>
                        <input
                          id="ct-phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              phone: clampPhoneDigits(e.target.value, country.maxDigits),
                            }))
                          }
                          autoComplete="tel-national"
                          placeholder="555 000 0000"
                        />
                        {dialOpen ? (
                          <div className="ct-dialMenu" role="listbox">
                            <div className="ct-dialSearch">
                              <Search size={14} aria-hidden />
                              <input
                                value={dialQuery}
                                onChange={(e) => setDialQuery(e.target.value)}
                                placeholder="Search country"
                                aria-label="Search country"
                              />
                            </div>
                            <ul>
                              {filteredDial.map((c) => (
                                <li key={c.iso}>
                                  <button
                                    type="button"
                                    role="option"
                                    aria-selected={c.iso === form.countryIso}
                                    onClick={() => {
                                      setForm((f) => ({
                                        ...f,
                                        countryIso: c.iso,
                                        phone: clampPhoneDigits(f.phone, c.maxDigits),
                                      }));
                                      setDialOpen(false);
                                      setDialQuery('');
                                    }}
                                  >
                                    <span aria-hidden>{c.flag}</span>
                                    <strong>{c.name}</strong>
                                    <em>{c.code}</em>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                      {errors.phone ? <em>{errors.phone}</em> : null}
                    </div>

                    <div className="ct-field ct-full">
                      <label htmlFor="ct-description">Description</label>
                      <textarea
                        id="ct-description"
                        rows={5}
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, description: e.target.value }))
                        }
                        placeholder="Tell us about your center, timeline, or questions…"
                      />
                    </div>
                  </div>

                  {submitError ? <p className="ct-submitError">{submitError}</p> : null}

                  <button type="submit" className="ct-submit" disabled={submitting}>
                    <span>{submitting ? 'Sending…' : 'Submit'}</span>
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
