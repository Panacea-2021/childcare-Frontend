'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarRange,
  Percent,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAutoRotate } from '../enrollments/hooks/useAutoRotate';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ACCURACY_STEPS = [
  {
    id: 'plans',
    title: 'Flexible Billing Plans',
    detail: 'Weekly, monthly, or attendance-based schedules that match how your rooms operate.',
    duration: 4200,
    icon: CalendarRange,
  },
  {
    id: 'prorate',
    title: 'Pro-rated Invoices',
    detail: 'When a child starts mid-cycle, Panacea recalculates tuition automatically.',
    duration: 4200,
    icon: Percent,
  },
  {
    id: 'status',
    title: 'Status Change Sync',
    detail: 'Transfers, withdrawals, and room moves update balances without spreadsheet work.',
    duration: 4200,
    icon: RefreshCw,
  },
  {
    id: 'addons',
    title: 'Last-minute Add-ons',
    detail: 'Extra days, activities, and fees apply cleanly — families always see the latest total.',
    duration: 4200,
    icon: Sparkles,
  },
] as const;

export function BillingAccuracy() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const { activeId, progress, select } = useAutoRotate([...ACCURACY_STEPS], {
    paused: paused || reduced,
    initialId: 'plans',
  });

  const activeIndex = ACCURACY_STEPS.findIndex((s) => s.id === activeId);
  const active = ACCURACY_STEPS[activeIndex >= 0 ? activeIndex : 0] ?? ACCURACY_STEPS[0];
  const ActiveIcon = active.icon;
  const fillPct =
    ((Math.max(0, activeIndex) + progress) / Math.max(1, ACCURACY_STEPS.length - 1)) * 100;

  return (
    <section className="bl-accuracy" aria-labelledby="bl-accuracy-title">
      <motion.div
        className="bl-accuracyInner"
        initial={reduced ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bl-accuracyTop">
          <div>
            <h2 id="bl-accuracy-title">When enrollments change, billing stays accurate.</h2>
            <p>
              Panacea keeps tuition, adjustments, and family balances in sync — even when
              schedules shift overnight.
            </p>
          </div>
          <Link href="/book-demo" className="bl-accuracyCta">
            Unlock predictable revenue
            <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <div
          className="bl-accuracyTrack"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="bl-accuracyLine" aria-hidden="true">
            <motion.i
              animate={{ width: `${Math.min(100, Math.max(0, fillPct))}%` }}
              transition={reduced ? { duration: 0 } : { type: 'tween', ease: 'linear', duration: 0.08 }}
            />
          </div>

          <div className="bl-accuracySteps" role="tablist" aria-label="Billing accuracy features">
            {ACCURACY_STEPS.map((step, index) => {
              const isActive = step.id === activeId;
              const isDone = index < activeIndex;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={[
                    'bl-accuracyStep',
                    isActive ? 'is-active' : '',
                    isDone ? 'is-done' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => select(step.id)}
                >
                  <span className="bl-accuracyNode" aria-hidden>
                    {isActive && !reduced ? (
                      <motion.span
                        className="bl-accuracyPulse"
                        initial={{ scale: 0.7, opacity: 0.55 }}
                        animate={{ scale: 1.55, opacity: 0 }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                      />
                    ) : null}
                    <span className="bl-accuracyDot">
                      <Icon size={14} strokeWidth={2.2} />
                    </span>
                  </span>

                  <strong>{step.title}</strong>

                  {isActive ? (
                    <span className="bl-accuracyProgress" aria-hidden>
                      <i style={{ transform: `scaleX(${progress})` }} />
                    </span>
                  ) : (
                    <span className="bl-accuracyProgress is-idle" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>

          <div className="bl-accuracyDetailWrap">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="bl-accuracyDetail"
                initial={reduced ? false : { opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={reduced ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="bl-accuracyDetailIcon" aria-hidden>
                  <ActiveIcon size={18} strokeWidth={2} />
                </span>
                <p>{active.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
