'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, Play, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { useCountUp } from './useCountUp';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const HEADING_WORDS = [
  { text: 'AI-powered', accent: true },
  { text: 'Childcare', accent: false },
  { text: 'Software', accent: false },
  { text: 'that', accent: false },
  { text: 'Helps', accent: false },
  { text: 'Your', accent: false },
  { text: 'Center', accent: false },
  { text: 'Grow', accent: false },
];

const AVATARS = ['E', 'M', 'S', 'A', 'J', 'L'];
const LOGOS = [
  'BrightNest',
  'LittleOaks',
  'SunshineCare',
  'KinderHub',
  'PlayPath',
  'TinySteps',
  'BloomKids',
  'CareSphere',
];

const METRICS = [
  { value: 99.9, suffix: '%', label: 'Platform Uptime', decimals: 1 },
  { value: 98, suffix: '%', label: 'Parent Satisfaction', decimals: 0 },
  { value: 250, suffix: 'K+', label: 'Families Connected', decimals: 0 },
  { value: 50, suffix: 'M+', label: 'Attendance Logged', decimals: 0 },
  { value: 24, suffix: '/7', label: 'AI Assistant', decimals: 0 },
];

const FEATURE_CHIPS = [
  'AI Attendance',
  'AI Billing',
  'AI Reports',
  'AI Communication',
  'AI Analytics',
  'Meal Planner',
  'Staff Management',
  'Student Timeline',
  'Smart Insights',
  'Voice Assistant',
];

function MagneticButton({
  children,
  className,
  href,
}: {
  children: ReactNode;
  className: string;
  href: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 18 });
  const springY = useSpring(y, { stiffness: 220, damping: 18 });
  const reduced = usePrefersReducedMotion();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>(
    [],
  );
  const [confetti, setConfetti] = useState(false);

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    x.set(dx * 0.22);
    y.set(dy * 0.22);
    if (!confetti) setConfetti(true);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
    setConfetti(false);
  };

  const onClick = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
    ]);
    window.setTimeout(() => {
      setRipples((r) => r.filter((item) => item.id !== id));
    }, 700);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      whileHover={reduced ? undefined : { scale: 1.03 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
    >
      <span className="ph-ctaShine" aria-hidden="true" />
      <span className="ph-ctaGlow" aria-hidden="true" />
      {confetti ? (
        <span className="ph-ctaConfetti" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </span>
      ) : null}
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ph-ctaRipple"
          style={{ left: r.x, top: r.y }}
          aria-hidden="true"
        />
      ))}
    </motion.a>
  );
}

function MetricCard({
  value,
  suffix,
  label,
  decimals,
  delay,
  active,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals: number;
  delay: number;
  active: boolean;
}) {
  const n = useCountUp(value, active, 1400 + delay * 120, decimals);
  const reduced = usePrefersReducedMotion();

  return (
    <motion.div
      className="ph-metric"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.06 }}
      whileHover={reduced ? undefined : { y: -4, scale: 1.02 }}
    >
      <strong>
        {decimals > 0 ? n.toFixed(decimals) : Math.round(n)}
        {suffix}
      </strong>
      <span>{label}</span>
    </motion.div>
  );
}

export function HeroCopy({ ready }: { ready: boolean }) {
  const reduced = usePrefersReducedMotion();
  const [sparkle, setSparkle] = useState(false);

  useEffect(() => {
    if (!ready || reduced) return;
    const id = window.setInterval(() => setSparkle((s) => !s), 2800);
    return () => window.clearInterval(id);
  }, [ready, reduced]);

  return (
    <div className="ph-copy">
      <motion.p
        className="ph-eyebrow"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
      >
        Top Childcare Management Software
      </motion.p>

      <h1 className="ph-heading">
        <span className="ph-headingStroke" aria-hidden="true" />
        {HEADING_WORDS.map((word, i) => (
          <motion.span
            key={`${word.text}-${i}`}
            className={`ph-word${word.accent ? ' is-accent' : ''}`}
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
          >
            {word.accent ? (
              <span className="ph-aiWord">
                {word.text}
                <motion.span
                  className="ph-aiSparkle"
                  animate={
                    reduced
                      ? undefined
                      : {
                          y: [0, -5, 0],
                          rotate: [0, 12, 0],
                          opacity: sparkle ? [0.5, 1, 0.5] : 0.75,
                        }
                  }
                  transition={{ duration: 2.4, repeat: Infinity }}
                  aria-hidden="true"
                >
                  <Sparkles size={14} strokeWidth={2} />
                </motion.span>
              </span>
            ) : (
              word.text
            )}
            {i < HEADING_WORDS.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
        <motion.span
          className="ph-underline"
          initial={false}
          animate={{ scaleX: 1, opacity: 1 }}
          aria-hidden="true"
        />
        <span className="ph-headingShine" aria-hidden="true" />
      </h1>

      <motion.p className="ph-lead" initial={false} animate={{ opacity: 1, y: 0 }}>
        From attendance and observations to parent communication, enrollment,
        and tuition collection — Panacea can handle it all.
      </motion.p>

      <motion.div className="ph-ctaRow" initial={false} animate={{ opacity: 1, y: 0 }}>
        <MagneticButton className="ph-ctaPrimary" href="/book-demo">
          <span>Book a Free Demo</span>
          <ArrowRight className="ph-ctaArrow" size={18} aria-hidden="true" />
        </MagneticButton>

        <motion.button
          type="button"
          className="ph-ctaSecondary"
          whileHover={reduced ? undefined : { y: -2 }}
          whileTap={reduced ? undefined : { scale: 0.98 }}
        >
          <span className="ph-playIcon" aria-hidden="true">
            <Play size={14} fill="currentColor" />
          </span>
          Watch Interactive Demo
        </motion.button>
      </motion.div>

      <motion.div className="ph-trust" initial={false} animate={{ opacity: 1, y: 0 }}>
        <div className="ph-trustTop">
          <div className="ph-starsRow" aria-label="5 star rating">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" aria-hidden="true" />
            ))}
          </div>
          <p className="ph-trustCopy">
            Trusted by <strong>12,000+</strong> Childcare Centres Worldwide
          </p>
        </div>

        <div className="ph-avatars" aria-hidden="true">
          {AVATARS.map((a, i) => (
            <span key={a} className="ph-avatar" style={{ zIndex: AVATARS.length - i }}>
              {a}
            </span>
          ))}
          <span className="ph-avatarMore">+</span>
        </div>

        <div className="ph-badges">
          <span className="ph-badge">
            <ShieldCheck size={12} aria-hidden="true" /> Verified
          </span>
          <span className="ph-badge is-ai">
            <Sparkles size={12} aria-hidden="true" /> AI Powered
          </span>
          <span className="ph-badge">SOC2</span>
          <span className="ph-badge">GDPR</span>
          <span className="ph-badge">ISO</span>
        </div>
      </motion.div>

      <div className="ph-marquee" aria-label="Customer logos">
        <div className="ph-marqueeTrack">
          {[...LOGOS, ...LOGOS].map((name, i) => (
            <span key={`${name}-${i}`} className="ph-logoChip">
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="ph-metrics" aria-label="Platform metrics">
        {METRICS.map((m, i) => (
          <MetricCard key={m.label} {...m} delay={i} active={ready} />
        ))}
      </div>

      <div className="ph-featureChips" aria-hidden="true">
        {FEATURE_CHIPS.map((chip, i) => (
          <motion.span
            key={chip}
            className="ph-featureChip"
            style={{ ['--chip-i' as string]: i }}
            initial={false}
            animate={{
              opacity: 1,
              scale: 1,
              y: reduced ? 0 : [0, -6, 0],
            }}
            transition={{
              y: {
                delay: 0.4 + i * 0.1,
                duration: 4 + (i % 3),
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            whileHover={reduced ? undefined : { scale: 1.06 }}
          >
            {chip}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

