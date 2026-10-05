'use client';

import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';

type Floater = {
  id: string;
  emoji: string;
  x: string;
  y: string;
  size: number;
  delay: number;
  dur: number;
};

const FLOATERS: Floater[] = [
  { id: 'fb', emoji: '⚽', x: '5%', y: '12%', size: 18, delay: 0, dur: 18 },
  { id: 'vb', emoji: '🏐', x: '88%', y: '18%', size: 16, delay: 1.2, dur: 20 },
  { id: 'cr', emoji: '🏏', x: '14%', y: '68%', size: 15, delay: 2, dur: 16 },
  { id: 'bus', emoji: '🚌', x: '78%', y: '72%', size: 17, delay: 0.8, dur: 22 },
  { id: 'bk', emoji: '📚', x: '42%', y: '8%', size: 14, delay: 1.5, dur: 15 },
  { id: 'cap', emoji: '🎓', x: '62%', y: '78%', size: 15, delay: 2.4, dur: 17 },
  { id: 'bell', emoji: '🔔', x: '92%', y: '48%', size: 13, delay: 0.5, dur: 14 },
  { id: 'bl', emoji: '🎈', x: '28%', y: '82%', size: 14, delay: 1.8, dur: 19 },
  { id: 'cf', emoji: '🎊', x: '70%', y: '10%', size: 13, delay: 2.8, dur: 16 },
  { id: 'tr', emoji: '🏆', x: '8%', y: '42%', size: 14, delay: 1.1, dur: 18 },
  { id: 'sch', emoji: '🏫', x: '52%', y: '88%', size: 16, delay: 0.3, dur: 24 },
  { id: 'cal', emoji: '📅', x: '34%', y: '28%', size: 12, delay: 2.2, dur: 15 },
  { id: 'st1', emoji: '⭐', x: '58%', y: '36%', size: 11, delay: 0.7, dur: 12 },
  { id: 'st2', emoji: '✨', x: '22%', y: '48%', size: 10, delay: 1.6, dur: 13 },
  { id: 'bf', emoji: '🦋', x: '84%', y: '32%', size: 13, delay: 2.6, dur: 14 },
  { id: 'lf', emoji: '🍃', x: '46%', y: '58%', size: 12, delay: 3.2, dur: 20 },
];

export function SchoolDecor() {
  const reduce = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="sc-decor" aria-hidden>
          {FLOATERS.map((f) => (
            <m.span
              key={f.id}
              className="sc-floater"
              style={{ left: f.x, top: f.y, fontSize: f.size }}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -10, 0],
                      x: [0, 5, -3, 0],
                      opacity: [0.1, 0.28, 0.1],
                      rotate: [0, 6, -5, 0],
                    }
              }
              transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              {f.emoji}
            </m.span>
          ))}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
