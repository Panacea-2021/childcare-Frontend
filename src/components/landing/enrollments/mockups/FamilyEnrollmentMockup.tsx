'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const STEPS = ['Interested', 'Accepted', 'Create Student', 'Active'] as const;

export function FamilyEnrollmentMockup() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="en-mock en-family">
      <div className="en-mockHeader">
        <strong>Student Profile</strong>
      </div>
      <div className="en-familyBody">
        <div className="en-avatar" aria-hidden="true">
          JA
        </div>
        <div>
          <h4>Jacob Anderson</h4>
          <div className="en-statusTrail">
            {STEPS.map((label, i) => (
              <span key={label} className={`en-statusChip${i <= step ? ' is-on' : ''}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="en-familyModal"
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.28 }}
        >
          <div className="en-familyModalTop">
            <div className="en-avatar sm" aria-hidden="true">
              JA
            </div>
            <div>
              <strong>Jacob Anderson</strong>
              <span className={`en-pill ${step === 3 ? 'en-pill-mint' : 'en-pill-accent'}`}>
                {STEPS[step]}
              </span>
            </div>
          </div>
          <div className="en-familyFields">
            <label>
              Room
              <input className="ui-input" readOnly value={step >= 2 ? 'Toddler A' : ''} placeholder="Select room" />
            </label>
            <label>
              Status
              <input className="ui-input" readOnly value={STEPS[step]} />
            </label>
          </div>
          <button type="button" className="en-payBtn">
            {step < 3 ? 'Create Student' : 'Student Active'}
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
