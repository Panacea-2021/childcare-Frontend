'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

const FIELDS = [
  { label: 'Child Name', value: 'Mia Thompson' },
  { label: 'Preferred Name', value: 'Mia' },
  { label: 'Gender', value: 'Female' },
  { label: 'Allergies', value: 'None' },
  { label: 'Emergency Contact', value: 'Jordan Thompson' },
];

export function RegistrationMockup() {
  const [filled, setFilled] = useState(0);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    setFilled(0);
    setPaid(false);
    const timers = [
      window.setTimeout(() => setFilled(1), 500),
      window.setTimeout(() => setFilled(2), 1100),
      window.setTimeout(() => setFilled(3), 1600),
      window.setTimeout(() => setFilled(4), 2100),
      window.setTimeout(() => setFilled(5), 2600),
      window.setTimeout(() => setPaid(true), 3400),
    ];
    const loop = window.setInterval(() => {
      setFilled(0);
      setPaid(false);
      window.setTimeout(() => setFilled(1), 400);
      window.setTimeout(() => setFilled(2), 900);
      window.setTimeout(() => setFilled(3), 1400);
      window.setTimeout(() => setFilled(4), 1900);
      window.setTimeout(() => setFilled(5), 2400);
      window.setTimeout(() => setPaid(true), 3200);
    }, 7000);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(loop);
    };
  }, []);

  return (
    <div className="en-mock en-reg">
      <div className="en-mockHeader">
        <strong>Registration</strong>
        <span className="en-pill en-pill-mint">
          <ShieldCheck size={12} /> Secure Payments
        </span>
      </div>
      <div className="en-regGrid">
        <div className="en-regFields">
          {FIELDS.map((field, i) => (
            <label key={field.label} className="en-regField">
              <span>{field.label}</span>
              <input
                className="ui-input"
                readOnly
                value={filled > i ? field.value : ''}
                placeholder="—"
              />
            </label>
          ))}
        </div>
        <div className="en-regSummary">
          <p>Order Summary</p>
          <div className="en-regLine">
            <span>Registration Fee</span>
            <strong>$25.00</strong>
          </div>
          <div className="en-regTotal">
            <span>Total</span>
            <strong>$25.00</strong>
          </div>
          <button type="button" className={`en-payBtn${paid ? ' is-done' : ''}`}>
            {paid ? (
              <>
                <CheckCircle2 size={16} /> Registration completed
              </>
            ) : (
              'Pay Now'
            )}
          </button>
          {paid ? (
            <motion.p
              className="en-successNote"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Deposit collected · forms validated · workflow started
            </motion.p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
