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

/** Soft floating party accents — varied icons, not stacked cakes */
const FLOATERS: Floater[] = [
  { id: 'bl1', emoji: '🎈', x: '6%', y: '10%', size: 18, delay: 0, dur: 18 },
  { id: 'bl2', emoji: '🎈', x: '90%', y: '16%', size: 14, delay: 1.4, dur: 20 },
  { id: 'bl3', emoji: '🎈', x: '18%', y: '58%', size: 12, delay: 2.2, dur: 16 },
  { id: 'cp1', emoji: '🧁', x: '12%', y: '78%', size: 16, delay: 0.6, dur: 15 },
  { id: 'gf1', emoji: '🎁', x: '86%', y: '62%', size: 15, delay: 1, dur: 17 },
  { id: 'gf2', emoji: '🎁', x: '72%', y: '8%', size: 12, delay: 2.8, dur: 14 },
  { id: 'st1', emoji: '⭐', x: '34%', y: '22%', size: 11, delay: 0.4, dur: 11 },
  { id: 'st2', emoji: '✨', x: '58%', y: '14%', size: 10, delay: 1.6, dur: 12 },
  { id: 'st3', emoji: '⭐', x: '48%', y: '84%', size: 9, delay: 2.4, dur: 13 },
  { id: 'pp1', emoji: '🎉', x: '78%', y: '38%', size: 14, delay: 0.9, dur: 14 },
  { id: 'cf1', emoji: '🎊', x: '28%', y: '42%', size: 13, delay: 3, dur: 15 },
  { id: 'ht1', emoji: '🥳', x: '64%', y: '72%', size: 14, delay: 1.8, dur: 16 },
  { id: 'rb1', emoji: '🌈', x: '42%', y: '6%', size: 20, delay: 0.2, dur: 22 },
  { id: 'cl1', emoji: '☁️', x: '8%', y: '32%', size: 18, delay: 1.1, dur: 24 },
  { id: 'cl2', emoji: '☁️', x: '82%', y: '78%', size: 16, delay: 2.6, dur: 26 },
  { id: 'cd1', emoji: '🕯️', x: '94%', y: '48%', size: 12, delay: 1.5, dur: 13 },
  { id: 'ck1', emoji: '🎂', x: '52%', y: '48%', size: 13, delay: 3.5, dur: 19 },
];

export function BirthdaysDecor() {
  const reduce = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="bc-decor" aria-hidden>
          {FLOATERS.map((f) => (
            <m.span
              key={f.id}
              className="bc-floater"
              style={{ left: f.x, top: f.y, fontSize: f.size }}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -12, 0],
                      x: [0, 6, -3, 0],
                      opacity: [0.12, 0.32, 0.12],
                      rotate: [0, 8, -6, 0],
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
