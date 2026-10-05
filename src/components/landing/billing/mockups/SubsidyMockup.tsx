'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';

export function SubsidyMockup({ reduced }: { reduced: boolean }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => `$${Math.round(v).toLocaleString()}`);
  const [shown, setShown] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      count.set(7000);
      setShown(true);
      return;
    }
    const controls = animate(count, 7000, { duration: 1.15, ease: [0.22, 1, 0.36, 1] });
    const t = window.setTimeout(() => setShown(true), 500);
    return () => {
      controls.stop();
      window.clearTimeout(t);
    };
  }, [count, reduced]);

  return (
    <div className="bl-mock bl-mock-subsidy">
      <div className="bl-mockCard">
        <div className="bl-mockHead">Childcare Subsidy</div>
        <div className="bl-mockBody">
          <div className="bl-fundBox">
            <span>Available Funds</span>
            <motion.span>{display}</motion.span>
          </div>
          <ul className="bl-subsidyList">
            <motion.li
              initial={reduced ? false : { opacity: 0, x: 8 }}
              animate={shown ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.1 }}
            >
              <span className="bl-avatar is-ok" />
              <div>
                <strong>Robert Matthews</strong>
                <em>Authorization active</em>
              </div>
              <span className="bl-status is-ok">
                <CheckCircle2 size={12} /> Remitted
              </span>
            </motion.li>
            <motion.li
              initial={reduced ? false : { opacity: 0, x: 8 }}
              animate={shown ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.22 }}
            >
              <span className="bl-avatar" />
              <div>
                <strong>Emma Wilson</strong>
                <em>Awaiting remittance</em>
              </div>
              <span className="bl-status is-pending">
                <Clock3 size={12} /> Pending
              </span>
            </motion.li>
            <motion.li
              initial={reduced ? false : { opacity: 0, x: 8 }}
              animate={shown ? { opacity: 1, x: 0 } : undefined}
              transition={{ delay: 0.34 }}
            >
              <span className="bl-avatar" />
              <div>
                <strong>Noah Patel</strong>
                <em>Renewal in 12 days</em>
              </div>
              <span className="bl-status is-warn">
                <AlertTriangle size={12} /> Soon
              </span>
            </motion.li>
          </ul>
        </div>
      </div>
    </div>
  );
}
