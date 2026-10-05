'use client';

import { useEffect, useState } from 'react';
import { LazyMotion, domAnimation, m, useReducedMotion, MotionConfig } from 'framer-motion';

type Floater = {
  id: string;
  kind:
    | 'cloud'
    | 'mountain'
    | 'palm'
    | 'island'
    | 'bird'
    | 'balloon'
    | 'rainbow'
    | 'sun'
    | 'star'
    | 'butterfly';
  x: string;
  y: string;
  size: number;
  delay: number;
  dur: number;
};

const FLOATERS: Floater[] = [
  { id: 'c1', kind: 'cloud', x: '6%', y: '10%', size: 28, delay: 0, dur: 28 },
  { id: 'c2', kind: 'cloud', x: '72%', y: '6%', size: 22, delay: 2, dur: 32 },
  { id: 'c3', kind: 'cloud', x: '40%', y: '78%', size: 20, delay: 4, dur: 30 },
  { id: 'm1', kind: 'mountain', x: '88%', y: '68%', size: 34, delay: 1, dur: 22 },
  { id: 'm2', kind: 'mountain', x: '4%', y: '62%', size: 26, delay: 3, dur: 24 },
  { id: 'p1', kind: 'palm', x: '14%', y: '84%', size: 22, delay: 0.5, dur: 6 },
  { id: 'p2', kind: 'palm', x: '82%', y: '86%', size: 18, delay: 1.2, dur: 7 },
  { id: 'i1', kind: 'island', x: '58%', y: '88%', size: 36, delay: 2, dur: 20 },
  { id: 'b1', kind: 'bird', x: '28%', y: '18%', size: 12, delay: 0, dur: 14 },
  { id: 'b2', kind: 'bird', x: '64%', y: '24%', size: 10, delay: 3, dur: 16 },
  { id: 'bl1', kind: 'balloon', x: '92%', y: '28%', size: 14, delay: 1, dur: 18 },
  { id: 'bl2', kind: 'balloon', x: '18%', y: '36%', size: 11, delay: 4, dur: 20 },
  { id: 'r1', kind: 'rainbow', x: '48%', y: '4%', size: 40, delay: 0, dur: 26 },
  { id: 'su1', kind: 'sun', x: '90%', y: '8%', size: 28, delay: 0, dur: 16 },
  { id: 'st1', kind: 'star', x: '34%', y: '42%', size: 8, delay: 0.4, dur: 12 },
  { id: 'st2', kind: 'star', x: '76%', y: '48%', size: 7, delay: 1.6, dur: 11 },
  { id: 'st3', kind: 'star', x: '10%', y: '28%', size: 6, delay: 2.8, dur: 13 },
  { id: 'bf1', kind: 'butterfly', x: '42%', y: '14%', size: 12, delay: 1, dur: 20 },
  { id: 'bf2', kind: 'butterfly', x: '68%', y: '58%', size: 10, delay: 5, dur: 22 },
];

function Glyph({ kind, size }: { kind: Floater['kind']; size: number }) {
  if (kind === 'cloud') {
    return (
      <svg width={size} height={size * 0.6} viewBox="0 0 48 28" fill="currentColor" aria-hidden>
        <path d="M14 24h24a8 8 0 0 0 1-15.9A10 10 0 0 0 20 6a9 9 0 0 0-8.7 7A7 7 0 0 0 14 24Z" />
      </svg>
    );
  }
  if (kind === 'mountain') {
    return (
      <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="currentColor" aria-hidden>
        <path d="M8 26 18 8l6 10 4-6 8 14H8Z" opacity="0.85" />
        <path d="M18 8l3 5h-6l3-5Z" fill="#fff" opacity="0.45" />
      </svg>
    );
  }
  if (kind === 'palm') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 32" fill="currentColor" aria-hidden>
        <path d="M12 14v16" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M12 14C6 8 2 10 4 14c4 0 6-2 8 0 2-2 4 0 8 0 2-4-2-6-8 0Z" />
      </svg>
    );
  }
  if (kind === 'island') {
    return (
      <svg width={size} height={size * 0.55} viewBox="0 0 48 26" fill="currentColor" aria-hidden>
        <ellipse cx="24" cy="20" rx="20" ry="5" opacity="0.5" />
        <path d="M24 4c-2 4-2 8 0 10 2-2 2-6 0-10Z" />
        <path d="M18 14c4-6 10-6 14 0-4 2-10 2-14 0Z" opacity="0.7" />
      </svg>
    );
  }
  if (kind === 'bird') {
    return (
      <svg width={size} height={size * 0.6} viewBox="0 0 24 14" fill="none" aria-hidden>
        <path d="M2 10c4-6 8-6 10-2 2-4 6-4 10 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'balloon') {
    return (
      <svg width={size} height={size * 1.35} viewBox="0 0 16 22" fill="currentColor" aria-hidden>
        <ellipse cx="8" cy="8" rx="6" ry="7.5" />
        <path d="M8 15.5 7 21h2l-1-5.5Z" opacity="0.7" />
      </svg>
    );
  }
  if (kind === 'rainbow') {
    return (
      <svg width={size} height={size * 0.55} viewBox="0 0 48 26" fill="none" aria-hidden>
        <path d="M4 22a20 20 0 0 1 40 0" stroke="#f9a8d4" strokeWidth="2" opacity="0.7" />
        <path d="M8 22a16 16 0 0 1 32 0" stroke="#fcd34d" strokeWidth="2" opacity="0.65" />
        <path d="M12 22a12 12 0 0 1 24 0" stroke="#93c5fd" strokeWidth="2" opacity="0.65" />
      </svg>
    );
  }
  if (kind === 'sun') {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden>
        <circle cx="16" cy="16" r="7" />
        <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
          <path d="M16 3v3M16 26v3M3 16h3M26 16h3M6.5 6.5l2 2M23.5 23.5l2 2M6.5 25.5l2-2M23.5 8.5l2-2" />
        </g>
        <circle cx="13.5" cy="15" r="1" fill="#fff" />
        <circle cx="18.5" cy="15" r="1" fill="#fff" />
        <path d="M13.5 19c1.2 1.2 3.8 1.2 5 0" stroke="#fff" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.5l2.4 6.6H21l-5.2 4 2 6.7L12 16.4 6.2 19.8l2-6.7L3 9.1h6.6L12 2.5z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4v16M12 12C8 6 3 7 4 12s5 4 8 0c3 4 7 3 8 0s-4-6-8 0Z" opacity="0.9" />
    </svg>
  );
}

export function HolidaysDecor() {
  const reduce = useReducedMotion();
  const [plane, setPlane] = useState(false);

  useEffect(() => {
    if (reduce) return;
    let timeout: ReturnType<typeof setTimeout>;
    const loop = () => {
      timeout = setTimeout(() => {
        setPlane(true);
        setTimeout(() => setPlane(false), 4800);
        loop();
      }, 30000);
    };
    const first = setTimeout(() => {
      setPlane(true);
      setTimeout(() => setPlane(false), 4800);
      loop();
    }, 8000);
    return () => {
      clearTimeout(timeout);
      clearTimeout(first);
    };
  }, [reduce]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="sh-decor" aria-hidden>
          {FLOATERS.map((f) => (
            <m.span
              key={f.id}
              className={`sh-floater sh-floater--${f.kind}`}
              style={{ left: f.x, top: f.y }}
              animate={
                reduce
                  ? undefined
                  : f.kind === 'cloud'
                    ? { x: [0, 18, 0], opacity: [0.08, 0.14, 0.08] }
                    : f.kind === 'palm'
                      ? { rotate: [-3, 3, -3], opacity: [0.1, 0.16, 0.1] }
                      : f.kind === 'bird'
                        ? { x: [0, 12, 0], y: [0, -8, 0], opacity: [0.08, 0.16, 0.08] }
                        : f.kind === 'star'
                          ? { opacity: [0.06, 0.2, 0.06], scale: [0.9, 1.1, 0.9] }
                          : f.kind === 'butterfly'
                            ? { x: [0, 10, -4, 0], y: [0, -10, -4, 0], rotate: [0, 12, -8, 0], opacity: [0.1, 0.2, 0.1] }
                            : f.kind === 'sun'
                              ? { rotate: [0, 8, 0], opacity: [0.12, 0.2, 0.12] }
                              : { y: [0, -6, 0], opacity: [0.07, 0.14, 0.07] }
              }
              transition={{ duration: f.dur, delay: f.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Glyph kind={f.kind} size={f.size} />
            </m.span>
          ))}

          {!reduce && plane ? (
            <m.span
              className="sh-plane"
              initial={{ left: '-6%', top: '22%', opacity: 0 }}
              animate={{ left: '106%', top: '18%', opacity: [0, 0.35, 0.35, 0] }}
              transition={{ duration: 4.6, ease: 'linear' }}
            >
              <svg width="22" height="14" viewBox="0 0 28 16" fill="currentColor" aria-hidden>
                <path d="M1 9h14l10-6v3L16 11l8 2v2l-10-1-4 3H8l3-3H1V9Z" />
              </svg>
            </m.span>
          ) : null}
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
