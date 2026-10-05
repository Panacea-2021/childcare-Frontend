'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FLOATERS = [
  { id: 's1', kind: 'star', x: '6%', y: '10%', size: 10, delay: 0, dur: 14 },
  { id: 's2', kind: 'star', x: '82%', y: '16%', size: 8, delay: 1.2, dur: 16 },
  { id: 's3', kind: 'star', x: '48%', y: '68%', size: 7, delay: 2.4, dur: 13 },
  { id: 'b1', kind: 'bubble', x: '90%', y: '42%', size: 14, delay: 0.6, dur: 18 },
  { id: 'b2', kind: 'bubble', x: '14%', y: '52%', size: 11, delay: 2.1, dur: 17 },
  { id: 'c1', kind: 'cloud', x: '64%', y: '6%', size: 22, delay: 0.4, dur: 22 },
  { id: 'c2', kind: 'cloud', x: '24%', y: '84%', size: 18, delay: 2, dur: 24 },
  { id: 'o1', kind: 'orb', x: '54%', y: '26%', size: 28, delay: 0, dur: 20 },
  { id: 'o2', kind: 'orb', x: '10%', y: '72%', size: 22, delay: 1.5, dur: 19 },
  { id: 'sp1', kind: 'spark', x: '36%', y: '20%', size: 6, delay: 0.6, dur: 12 },
  { id: 'sp2', kind: 'spark', x: '72%', y: '62%', size: 5, delay: 1.8, dur: 11 },
  { id: 'l1', kind: 'leaf', x: '86%', y: '80%', size: 10, delay: 3.2, dur: 28 },
  { id: 'd1', kind: 'dot', x: '40%', y: '88%', size: 6, delay: 1, dur: 15 },
] as const;

function Glyph({ kind, size }: { kind: (typeof FLOATERS)[number]['kind']; size: number }) {
  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.5l2.4 6.6H21l-5.2 4 2 6.7L12 16.4 6.2 19.8l2-6.7L3 9.1h6.6L12 2.5z" />
      </svg>
    );
  }
  if (kind === 'bubble') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M4 4h12a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H11l-5 4v-4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z" />
      </svg>
    );
  }
  if (kind === 'cloud') {
    return (
      <svg width={size} height={size * 0.65} viewBox="0 0 48 28" fill="currentColor" aria-hidden>
        <path d="M14 24h24a8 8 0 0 0 1-15.9A10 10 0 0 0 20 6a9 9 0 0 0-8.7 7A7 7 0 0 0 14 24Z" />
      </svg>
    );
  }
  if (kind === 'spark') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }
  if (kind === 'leaf') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M5 19C5 10 12 4 20 4 20 12 14 19 5 19Z" />
      </svg>
    );
  }
  if (kind === 'dot') {
    return <span className="wa-floater-dot" style={{ width: size, height: size }} />;
  }
  return <span className="wa-floater-orb" style={{ width: size, height: size }} />;
}

export function WhatsAppDecor() {
  const reduce = useReducedMotion();
  const [traveler, setTraveler] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let timeout: ReturnType<typeof setTimeout>;
    const loop = () => {
      timeout = setTimeout(() => {
        setTraveler(true);
        setTimeout(() => setTraveler(false), 2200);
        loop();
      }, 6500 + Math.random() * 2000);
    };
    loop();
    return () => clearTimeout(timeout);
  }, [reduce]);

  return (
    <div className="wa-board-decor" aria-hidden>
      {FLOATERS.map((f) => (
        <motion.span
          key={f.id}
          className={`wa-floater wa-floater--${f.kind}`}
          style={{ left: f.x, top: f.y }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -8, 0, 6, 0],
                  x: [0, 4, 0, -3, 0],
                  opacity: [0.05, 0.14, 0.08, 0.12, 0.05],
                  rotate:
                    f.kind === 'star' || f.kind === 'leaf'
                      ? [0, 12, -8, 0]
                      : [0, 4, -3, 0],
                }
          }
          transition={{
            duration: f.dur,
            delay: f.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Glyph kind={f.kind} size={f.size} />
        </motion.span>
      ))}

      {!reduce && traveler ? (
        <motion.span
          className="wa-traveler"
          initial={{ left: '-4%', top: '28%', opacity: 0 }}
          animate={{ left: '104%', top: '46%', opacity: [0, 0.4, 0.4, 0] }}
          transition={{ duration: 2.1, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      ) : null}
    </div>
  );
}
