'use client';

import { useEffect, useState } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion } from 'framer-motion';

const FOODS = [
  { id: 'f1', emoji: '🍕', x: '8%', y: '12%', dur: 26, delay: 0 },
  { id: 'f2', emoji: '🍎', x: '78%', y: '8%', dur: 30, delay: 1.2 },
  { id: 'f3', emoji: '🥕', x: '22%', y: '72%', dur: 28, delay: 2 },
  { id: 'f4', emoji: '🥦', x: '88%', y: '58%', dur: 24, delay: 0.8 },
  { id: 'f5', emoji: '🥛', x: '48%', y: '84%', dur: 32, delay: 1.5 },
  { id: 'f6', emoji: '🍞', x: '62%', y: '28%', dur: 27, delay: 3 },
  { id: 'f7', emoji: '🥪', x: '12%', y: '42%', dur: 29, delay: 2.4 },
  { id: 'f8', emoji: '🍉', x: '70%', y: '70%', dur: 25, delay: 0.4 },
];

export function MealsDecor() {
  const reduce = useReducedMotion();
  const [butterfly, setButterfly] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let timeout: ReturnType<typeof setTimeout>;
    const loop = () => {
      timeout = setTimeout(() => {
        setButterfly(true);
        setTimeout(() => setButterfly(false), 5200);
        loop();
      }, 22000);
    };
    const first = setTimeout(() => {
      setButterfly(true);
      setTimeout(() => setButterfly(false), 5200);
      loop();
    }, 7000);
    return () => {
      clearTimeout(timeout);
      clearTimeout(first);
    };
  }, [reduce]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mp-decor" aria-hidden>
          {FOODS.map((f) => (
            <m.span
              key={f.id}
              className="mp-floater mp-floater--emoji"
              style={{ left: f.x, top: f.y }}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -10, 4, 0],
                      x: [0, 8, -4, 0],
                      rotate: [0, 6, -4, 0],
                      opacity: [0.1, 0.18, 0.1],
                    }
              }
              transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              {f.emoji}
            </m.span>
          ))}

          {!reduce && butterfly ? (
            <m.span
              className="mp-butterfly"
              initial={{ left: '-4%', top: '30%', opacity: 0 }}
              animate={{
                left: ['-4%', '35%', '70%', '106%'],
                top: ['30%', '18%', '28%', '14%'],
                opacity: [0, 0.4, 0.4, 0],
                rotate: [0, 12, -8, 6],
              }}
              transition={{ duration: 5, ease: 'easeInOut' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4v16M12 12C8 6 3 7 4 12s5 4 8 0c3 4 7 3 8 0s-4-6-8 0Z" opacity="0.9" />
              </svg>
            </m.span>
          ) : null}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
