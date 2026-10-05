'use client';

import { motion } from 'framer-motion';
import { IdCard, Printer, ScanLine } from 'lucide-react';

const steps = [
  { icon: Printer, title: 'Print QR', desc: 'Download and print the card' },
  { icon: IdCard, title: 'Attach to ID Card', desc: 'Stick it on the student badge' },
  { icon: ScanLine, title: 'Teacher scans at Check-in', desc: 'Instant kiosk check-in' },
] as const;

export function InstructionTimeline() {
  return (
    <section className="slq-steps" aria-label="How it works">
      <header className="slq-steps-head">
        <span className="slq-steps-icon" aria-hidden="true">
          <ScanLine size={15} />
        </span>
        <div>
          <h4>How it works</h4>
          <p>Three quick steps to kiosk-ready check-in</p>
        </div>
      </header>
      <ol className="slq-steps-list">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const showArrow = i < steps.length - 1;
          return (
            <li key={step.title}>
              <motion.span
                className="slq-step-icon"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.08 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.08, rotate: -4 }}
              >
                <Icon size={16} />
              </motion.span>
              <div>
                <strong>
                  {i + 1}. {step.title}
                </strong>
                <span>{step.desc}</span>
              </div>
              {showArrow ? <span className="slq-step-arrow" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
