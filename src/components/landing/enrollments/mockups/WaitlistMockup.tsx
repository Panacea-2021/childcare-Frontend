'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

const ROWS = [
  { name: 'Robert Mathews', meta: 'Sibling Available', inquiry: 'Jan 12', start: 'Mar 03' },
  { name: 'Ava Chen', meta: null, inquiry: 'Jan 18', start: 'Mar 10' },
  { name: 'Noah Brooks', meta: null, inquiry: 'Feb 02', start: 'Apr 01' },
];

export function WaitlistMockup() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setPhase((p) => (p + 1) % 4), 1600);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="en-mock en-waitlist">
      <div className="en-mockHeader">
        <div>
          <span className="en-mockBrand">PANACEA</span>
          <strong>Waitlists</strong>
        </div>
        <span className="en-pill en-pill-blush">
          <Users size={12} /> 4 families waiting
        </span>
      </div>

      <div className="en-mockSub">
        <span>Spring Admissions 2026</span>
        {phase >= 1 ? (
          <motion.span
            className="en-toast"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            New opening detected
          </motion.span>
        ) : null}
      </div>

      <table className="en-miniTable">
        <thead>
          <tr>
            <th>Student</th>
            <th>Inquiry Date</th>
            <th>Desired Start</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={row.name} className={i === 0 && phase >= 2 ? 'is-highlight' : ''}>
              <td>
                <strong>{row.name}</strong>
                {row.meta ? (
                  <button type="button" className="en-linkish">
                    {row.meta}
                  </button>
                ) : (
                  <span className="en-bar" />
                )}
              </td>
              <td>{row.inquiry}</td>
              <td>{row.start}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <AnimatePresence>
        {phase >= 2 ? (
          <motion.div
            className="en-floatCard"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <strong>Sibling Information</strong>
            <div className="en-sibRow">
              <span>Noah Williams</span>
              <span className="en-pill en-pill-danger">Waitlisted</span>
            </div>
            <div className="en-sibRow">
              <span>Emma Williams</span>
              <span className="en-pill en-pill-accent">Enrolled</span>
            </div>
            {phase >= 3 ? (
              <div className="en-offer">
                <Check size={14} /> Offer generated · Family notified
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
