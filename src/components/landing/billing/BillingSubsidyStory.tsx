'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check } from 'lucide-react';
import { useAutoRotate } from '../enrollments/hooks/useAutoRotate';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const SUBSIDY_PHOTO =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80';

const SUBSIDY_STEPS = [
  {
    id: 'approved',
    title: 'Subsidy Approved',
    detail: 'Authorizations land in one queue with coverage amounts ready to apply.',
    duration: 4000,
  },
  {
    id: 'funding',
    title: 'Funding Available',
    detail: 'Available funds stay visible so directors know what can be remitted this month.',
    duration: 4000,
  },
  {
    id: 'applied',
    title: 'Payment Applied',
    detail: 'Subsidy payments post against the right family balance — no spreadsheet matching.',
    duration: 4000,
  },
  {
    id: 'balance',
    title: 'Balance Updated',
    detail: 'Parents see the updated amount due the moment funding is applied.',
    duration: 4000,
  },
] as const;

const BULLETS = [
  'Track authorizations and renewals',
  'Apply funding to the right invoices',
  'Alert before coverage expires',
  'Keep parent balances accurate',
];

function FloatCard({
  className,
  reduced,
  delay,
  from,
  floatY,
  children,
}: {
  className: string;
  reduced: boolean;
  delay: number;
  from: { x?: number; y?: number };
  floatY: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -floatY, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function BillingSubsidyStory() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const { activeId, progress, select } = useAutoRotate([...SUBSIDY_STEPS], {
    paused: paused || reduced,
    initialId: 'approved',
  });

  const active = SUBSIDY_STEPS.find((s) => s.id === activeId) ?? SUBSIDY_STEPS[0];
  const activeIndex = SUBSIDY_STEPS.findIndex((s) => s.id === activeId);

  return (
    <div className="bl-subsidyStory">
      <motion.div
        className="bl-subsidyCollage"
        initial={reduced ? false : { opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="bl-subsidyPhoto"
          style={{ backgroundImage: `url(${SUBSIDY_PHOTO})` }}
          aria-hidden="true"
        />

        <FloatCard
          className="bl-subFloat bl-subPending"
          reduced={reduced}
          delay={0.12}
          from={{ y: 20 }}
          floatY={6}
        >
          <article>
            <div className="bl-subPendingHead">
              <strong>Subsidy Pending</strong>
              <span>Apply Remittance</span>
            </div>
            <div className="bl-subTable" aria-hidden>
              <div className="bl-subTableHead">
                <span>Student</span>
                <span>Charges</span>
                <span>Balance</span>
              </div>
              <div className="bl-subTableRow">
                <span>
                  Andrew Smith
                  <em>INV-169</em>
                </span>
                <span>$900.00</span>
                <strong>$900.00</strong>
              </div>
            </div>
          </article>
        </FloatCard>

        <FloatCard
          className="bl-subFloat bl-subInvoice"
          reduced={reduced}
          delay={0.2}
          from={{ x: -22 }}
          floatY={7}
        >
          <article>
            <span className="bl-parentPayLabel">Invoice</span>
            <div className="bl-subSchool">
              <i aria-hidden />
              <strong>The Blossom Tots Pre-School</strong>
            </div>
            <ul>
              <li>
                <span>School Fee</span>
                <em>$1,200</em>
              </li>
              <li>
                <span>Discount</span>
                <em>−$100</em>
              </li>
              <li>
                <span>Subsidy</span>
                <em>−$900</em>
              </li>
              <li className="is-total">
                <span>Total</span>
                <em>$200</em>
              </li>
            </ul>
          </article>
        </FloatCard>

        <FloatCard
          className="bl-subFloat bl-subAlert is-expired"
          reduced={reduced}
          delay={0.26}
          from={{ x: 18 }}
          floatY={5}
        >
          <div className="bl-subAlertInner">
            <div>
              <strong>Head Start</strong>
              <span>Maria Garcia</span>
            </div>
            <em>Expired</em>
          </div>
        </FloatCard>

        <FloatCard
          className="bl-subFloat bl-subAlert is-soon"
          reduced={reduced}
          delay={0.32}
          from={{ x: 18 }}
          floatY={4}
        >
          <div className="bl-subAlertInner">
            <AlertTriangle size={14} aria-hidden />
            <div>
              <strong>Childcare Aware</strong>
              <span>Alexis Doty</span>
            </div>
            <em>Expires Soon</em>
          </div>
        </FloatCard>

        <div className="bl-subSteps" role="tablist" aria-label="Subsidy workflow">
          {SUBSIDY_STEPS.map((step, index) => {
            const isActive = step.id === activeId;
            const isDone = index < activeIndex;
            return (
              <button
                key={step.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`bl-subStep${isActive ? ' is-active' : ''}${isDone ? ' is-done' : ''}`}
                onClick={() => select(step.id)}
              >
                <span className="bl-subStepIndex" aria-hidden>
                  {isActive || isDone ? <Check size={12} /> : String(index + 1).padStart(2, '0')}
                </span>
                <strong>{step.title}</strong>
                {isActive ? (
                  <span className="bl-subStepProgress" aria-hidden>
                    <i style={{ transform: `scaleX(${progress})` }} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        className="bl-sectionCopy"
        initial={reduced ? false : { opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45 }}
      >
        <h2>Subsidy collection without the paperwork</h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={active.id}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            {active.detail}
          </motion.p>
        </AnimatePresence>
        <ul className="bl-bulletList">
          {BULLETS.map((b, i) => (
            <motion.li
              key={b}
              initial={reduced ? false : { opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.05 }}
            >
              <span className="bl-bulletIcon" aria-hidden>
                <Check size={14} strokeWidth={2.6} />
              </span>
              {b}
            </motion.li>
          ))}
        </ul>
        <Link href="/book-demo" className="ui-btn ui-btn-primary">
          Book a Demo
        </Link>
      </motion.div>
    </div>
  );
}
