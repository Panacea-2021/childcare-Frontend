'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const OPTIONS = ['Monthly', 'Bi-weekly', 'Quarterly', 'Yearly', 'Custom'] as const;

export function FlexibleBillingMockup({ reduced }: { reduced: boolean }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof OPTIONS)[number]>('Bi-weekly');

  useEffect(() => {
    if (reduced) {
      setOpen(true);
      return;
    }
    const t1 = window.setTimeout(() => setOpen(true), 400);
    const t2 = window.setTimeout(() => setSelected('Bi-weekly'), 900);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  return (
    <div className="bl-mock bl-mock-freq">
      <div className="bl-mockCard">
        <div className="bl-mockHead">Billing Frequency</div>
        <div className="bl-mockBody">
          <label className="bl-mockLabel">Choose your billing frequency</label>
          <button
            type="button"
            className="bl-mockSelect"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {selected}
            <span aria-hidden>▾</span>
          </button>
          <motion.ul
            className={`bl-mockMenu${open ? ' is-open' : ''}`}
            initial={false}
            animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.28 }}
          >
            {OPTIONS.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  className={opt === selected ? 'is-on' : undefined}
                  onClick={() => {
                    setSelected(opt);
                    setOpen(true);
                  }}
                >
                  {opt}
                </button>
              </li>
            ))}
          </motion.ul>
          <div className="bl-mockAction is-static">Create tuition plan</div>
        </div>
      </div>
    </div>
  );
}
