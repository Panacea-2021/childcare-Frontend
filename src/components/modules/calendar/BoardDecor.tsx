'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const FLOATERS = [
  { id: 's1', kind: 'star', x: '8%', y: '12%', size: 10, delay: 0, dur: 14 },
  { id: 's2', kind: 'star', x: '78%', y: '18%', size: 8, delay: 1.2, dur: 16 },
  { id: 's3', kind: 'star', x: '42%', y: '72%', size: 7, delay: 2.4, dur: 13 },
  { id: 'm1', kind: 'moon', x: '88%', y: '58%', size: 12, delay: 0.8, dur: 18 },
  { id: 'm2', kind: 'moon', x: '18%', y: '48%', size: 9, delay: 3, dur: 17 },
  { id: 'c1', kind: 'cloud', x: '62%', y: '8%', size: 22, delay: 0.4, dur: 22 },
  { id: 'c2', kind: 'cloud', x: '28%', y: '82%', size: 18, delay: 2, dur: 24 },
  { id: 'p1', kind: 'orb', x: '52%', y: '28%', size: 28, delay: 0, dur: 20 },
  { id: 'p2', kind: 'orb', x: '12%', y: '68%', size: 22, delay: 1.5, dur: 19 },
  { id: 'sp1', kind: 'spark', x: '35%', y: '22%', size: 6, delay: 0.6, dur: 12 },
  { id: 'sp2', kind: 'spark', x: '70%', y: '64%', size: 5, delay: 1.8, dur: 11 },
  { id: 'b1', kind: 'butterfly', x: '55%', y: '78%', size: 11, delay: 1, dur: 26 },
  { id: 'l1', kind: 'leaf', x: '84%', y: '82%', size: 10, delay: 4, dur: 28 },
] as const;

function Glyph({ kind, size }: { kind: (typeof FLOATERS)[number]['kind']; size: number }) {
  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.5l2.4 6.6H21l-5.2 4 2 6.7L12 16.4 6.2 19.8l2-6.7L3 9.1h6.6L12 2.5z" />
      </svg>
    );
  }
  if (kind === 'moon') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.5 14.2A7.4 7.4 0 0 1 9.8 5.5 7.6 7.6 0 1 0 18.5 14.2Z" />
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
        <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (kind === 'butterfly') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 4v16M12 12C8 6 3 7 4 12s5 4 8 0c3 4 7 3 8 0s-4-6-8 0Z" opacity="0.9" />
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
  return <span className="cal-board-orb" style={{ width: size, height: size }} />;
}

export function BoardDecor({ scrollX = 0 }: { scrollX?: number }) {
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

  const parallax = reduce ? 0 : scrollX * 0.04;

  return (
    <div className="cal-board-decor" aria-hidden style={{ transform: `translate3d(${-parallax}px, 0, 0)` }}>
      {FLOATERS.map((f) => (
        <motion.span
          key={f.id}
          className={`cal-board-floater cal-board-floater--${f.kind}`}
          style={{ left: f.x, top: f.y }}
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -8, 0, 6, 0],
                  x: [0, 4, 0, -3, 0],
                  opacity: [0.05, 0.12, 0.07, 0.1, 0.05],
                  rotate: f.kind === 'star' || f.kind === 'leaf' ? [0, 12, -8, 0] : [0, 4, -3, 0],
                }
          }
          transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Glyph kind={f.kind} size={f.size} />
        </motion.span>
      ))}

      {!reduce && traveler ? (
        <motion.span
          className="cal-board-traveler"
          initial={{ left: '-4%', top: '30%', opacity: 0 }}
          animate={{ left: '104%', top: '48%', opacity: [0, 0.35, 0.35, 0] }}
          transition={{ duration: 2.1, ease: 'easeInOut' }}
        >
          ✦
        </motion.span>
      ) : null}
    </div>
  );
}
