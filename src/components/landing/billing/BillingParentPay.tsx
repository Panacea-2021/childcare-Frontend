'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2, CreditCard } from 'lucide-react';
import { BILLING_PARENT_POINTS } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const PARENT_PHOTO =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80';

function Float({
  className,
  reduced,
  delay = 0,
  from,
  floatY = 6,
  children,
}: {
  className: string;
  reduced: boolean;
  delay?: number;
  from: { x?: number; y?: number; scale?: number };
  floatY?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, ...from }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 16 }}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -floatY, 0] }}
        transition={{
          duration: 3.8 + delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function BillingParentPay() {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'processing' | 'done'>('idle');
  const [depositOn, setDepositOn] = useState(true);
  const [creditOn, setCreditOn] = useState(false);

  useEffect(() => {
    if (reduced) {
      setPhase('done');
      return;
    }
    let timers: number[] = [];
    const run = () => {
      setPhase('idle');
      timers.push(window.setTimeout(() => setPhase('processing'), 1200));
      timers.push(window.setTimeout(() => setPhase('done'), 2600));
    };
    run();
    const loop = window.setInterval(() => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [];
      run();
    }, 6200);
    return () => {
      window.clearInterval(loop);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [reduced]);

  return (
    <div className="bl-parent">
      <motion.div
        className="bl-sectionCopy"
        initial={reduced ? false : { opacity: 0, x: -18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45 }}
      >
        <h2>Billing that works for parents, not against them.</h2>
        <p>
          Families see clear balances, pay in a few taps, and get receipts instantly —
          fewer calls for your front desk.
        </p>
        <ul className="bl-bulletList">
          {BILLING_PARENT_POINTS.map((point, i) => (
            <motion.li
              key={point}
              initial={reduced ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.06 }}
            >
              <span className="bl-bulletIcon" aria-hidden>
                <Check size={14} strokeWidth={2.6} />
              </span>
              {point}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="bl-parentVisual"
        initial={reduced ? false : { opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="bl-parentPhoto"
          style={{ backgroundImage: `url(${PARENT_PHOTO})` }}
          aria-hidden="true"
        >
          <div className="bl-parentPhotoShade" />
        </div>

        <Float className="bl-parentFloat bl-parentPayCard" reduced={reduced} delay={0.12} from={{ x: -28, y: 14 }} floatY={7}>
          <article>
            <header>Make Payment</header>
            <div className="bl-parentPayBody">
              <span className="bl-parentPayLabel">Pay with</span>
              <div className="bl-parentPayMethods" aria-hidden>
                <em>VISA</em>
                <em>MC</em>
                <em>Apple</em>
                <em>ACH</em>
              </div>
              <div className="bl-parentPayFields">
                <label>
                  <span>Card number</span>
                  <strong>•••• •••• •••• 4827</strong>
                </label>
                <label>
                  <span>Expiry</span>
                  <strong>08 / 27</strong>
                </label>
              </div>
            </div>
          </article>
        </Float>

        <Float className="bl-parentFloat bl-parentOverview" reduced={reduced} delay={0.2} from={{ x: 30, y: -12 }} floatY={8}>
          <article>
            <span className="bl-parentPayLabel">Account overview</span>
            <div className="bl-parentPending">
              <span>My Pending Amount</span>
              <strong>USD 600</strong>
            </div>
            <div className="bl-parentSummary">
              <span>Payment summary</span>
              <button
                type="button"
                className={`bl-parentToggle${depositOn ? ' is-on' : ''}`}
                onClick={() => setDepositOn((v) => !v)}
              >
                <em>Deposit Summary</em>
                <i />
              </button>
              <button
                type="button"
                className={`bl-parentToggle${creditOn ? ' is-on is-alt' : ' is-alt'}`}
                onClick={() => setCreditOn((v) => !v)}
              >
                <em>Credit Balance</em>
                <i />
              </button>
            </div>
          </article>
        </Float>

        <Float className="bl-parentFloat bl-parentDue" reduced={reduced} delay={0.28} from={{ y: 26 }} floatY={6}>
          <article>
            <span className="bl-parentPayLabel">Payment due</span>
            <strong className="bl-phoneName">Robert Matthews</strong>
            <div className="bl-phoneLines">
              <div>
                <span>Tuition</span>
                <em>$620</em>
              </div>
              <div>
                <span>Activity Fee</span>
                <em>$50</em>
              </div>
              <div className="is-total">
                <span>Total</span>
                <em>$670</em>
              </div>
            </div>
            <div className={`bl-payBtn is-${phase}`}>
              {phase === 'idle' && 'Pay $670'}
              {phase === 'processing' && 'Processing…'}
              {phase === 'done' && (
                <>
                  <CheckCircle2 size={16} aria-hidden /> Payment Successful
                </>
              )}
            </div>
          </article>
        </Float>

        <Float className="bl-parentFloat bl-parentTax" reduced={reduced} delay={0.34} from={{ y: 18 }} floatY={5}>
          <div className="bl-parentTaxInner">
            <span className="bl-parentTaxIcon" aria-hidden>
              <Check size={12} strokeWidth={2.8} />
            </span>
            <p>
              Tax statement <strong>shared with the parent</strong>
            </p>
          </div>
        </Float>

        <Float className="bl-parentFloat bl-parentSaved" reduced={reduced} delay={0.16} from={{ scale: 0.92 }} floatY={4}>
          <div className="bl-parentSavedInner">
            <CreditCard size={15} aria-hidden />
            <div>
              <strong>Visa ···· 4242</strong>
              <span>Saved payment method</span>
            </div>
          </div>
        </Float>
      </motion.div>
    </div>
  );
}
