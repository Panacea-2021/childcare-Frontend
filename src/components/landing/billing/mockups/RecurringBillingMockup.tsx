'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CATEGORIES = ['Recurring', 'One-Time', 'Refundable'] as const;

export function RecurringBillingMockup({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('One-Time');

  useEffect(() => {
    if (reduced) {
      setOpen(true);
      return;
    }
    const t1 = window.setTimeout(() => setOpen(true), 280);
    const t2 = window.setTimeout(() => setCategory('One-Time'), 700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  return (
    <div className="bl-mock bl-mock-plan">
      <motion.div
        className="bl-mockCard"
        initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bl-mockHead">Create Tuition Plan</div>
        <div className="bl-mockBody">
          <div className="bl-mockField">
            <span className="bl-mockLabel">Name</span>
            <strong className="bl-mockValue">Spring Toddlers</strong>
            <div className="bl-mockPlaceholders" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="bl-mockField">
            <span className="bl-mockLabel">Category</span>
            <button
              type="button"
              className="bl-mockSelect"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {category}
              <span aria-hidden>▾</span>
            </button>
            <motion.ul
              className={`bl-mockMenu${open ? ' is-open' : ''}`}
              initial={false}
              animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
              transition={{ duration: 0.24 }}
            >
              {CATEGORIES.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    className={opt === category ? 'is-on' : undefined}
                    onClick={() => setCategory(opt)}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </motion.ul>
          </div>
          <div className="bl-mockFoot is-static">
            <span>Cancel</span>
            <em>+ Add charge</em>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
