'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STEPS = [
  {
    id: 'r1',
    title: '1st fee reminder sent',
    meta: 'April 6, 2026 · 9:00 AM',
    tag: 'Email + SMS',
    tone: 'ok' as const,
  },
  {
    id: 'r2',
    title: '2nd fee reminder sent',
    meta: 'April 10, 2026 · 9:00 AM',
    tag: 'Email + SMS',
    tone: 'ok' as const,
  },
  {
    id: 'late',
    title: 'Late fees applied',
    meta: 'April 15, 2026 · Auto-applied',
    tag: '+$25.00 added',
    tone: 'warn' as const,
  },
];

export function ReminderMockup({ reduced }: { reduced: boolean }) {
  return (
    <div className="bl-mock bl-mock-remind">
      <div className="bl-mockCard">
        <div className="bl-mockHead">Automated invoice delivery</div>
        <div className="bl-mockBody">
          <div className="bl-timeline">
            <motion.i
              className="bl-timelineLine"
              initial={reduced ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />
            {STEPS.map((step, i) => (
              <motion.div
                key={step.id}
                className={`bl-timelineStep is-${step.tone}`}
                initial={reduced ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.18 + i * 0.18 }}
              >
                <span className="bl-timelineIcon" aria-hidden>
                  {step.tone === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                </span>
                <div>
                  <strong>{step.title}</strong>
                  <em>{step.meta}</em>
                </div>
                <span className="bl-timelineTag">{step.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
