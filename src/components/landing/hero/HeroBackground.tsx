'use client';

import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  size: 2 + (i % 4),
  delay: (i % 8) * 0.45,
  duration: 8 + (i % 6),
}));

const ORBITS = [
  { size: 180, duration: 28, opacity: 0.18 },
  { size: 260, duration: 38, opacity: 0.12 },
  { size: 340, duration: 48, opacity: 0.08 },
];

export function HeroBackground() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="ph-bg" aria-hidden="true">
      <div className="ph-bgAurora" />
      <div className="ph-bgMesh" />
      <div className="ph-bgWave" />
      <div className="ph-bgNoise" />
      <div className="ph-bgRays" />
      <div className="ph-bgBloom" />

      <span className="ph-blob ph-blobA" />
      <span className="ph-blob ph-blobB" />
      <span className="ph-blob ph-blobC" />
      <span className="ph-blob ph-blobD" />

      <span className="ph-sphere ph-sphereA" />
      <span className="ph-sphere ph-sphereB" />
      <span className="ph-sphere ph-sphereC" />

      <span className="ph-ribbon ph-ribbonA" />
      <span className="ph-ribbon ph-ribbonB" />

      <div className="ph-orbitWrap">
        {ORBITS.map((o) => (
          <motion.span
            key={o.size}
            className="ph-orbit"
            style={{
              width: o.size,
              height: o.size,
              opacity: o.opacity,
            }}
            animate={reduced ? undefined : { rotate: 360 }}
            transition={
              reduced
                ? undefined
                : { duration: o.duration, repeat: Infinity, ease: 'linear' }
            }
          />
        ))}
      </div>

      <div className="ph-particles">
        {PARTICLES.map((p) => (
          <motion.span
            key={p.id}
            className="ph-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
            }}
            animate={
              reduced
                ? undefined
                : {
                    y: [0, -18, 0],
                    opacity: [0.15, 0.7, 0.15],
                    scale: [1, 1.4, 1],
                  }
            }
            transition={
              reduced
                ? undefined
                : {
                    duration: p.duration,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        ))}
      </div>

      <div className="ph-stars">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="ph-star"
            style={{
              left: `${8 + ((i * 17) % 84)}%`,
              top: `${10 + ((i * 23) % 70)}%`,
            }}
            animate={
              reduced
                ? undefined
                : { opacity: [0.1, 0.55, 0.1], scale: [0.8, 1.2, 0.8] }
            }
            transition={
              reduced
                ? undefined
                : {
                    duration: 3.5 + (i % 4),
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
            }
          />
        ))}
      </div>

      <motion.span
        className="ph-butterfly ph-butterflyA"
        animate={
          reduced
            ? undefined
            : { y: [0, -10, 0], x: [0, 8, 0], rotate: [0, 8, -4, 0] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
          <path d="M15.2 16.2C11.2 14.4 7.4 11.2 6.2 7.8c-.6-1.7.4-3.2 2-3.1 2.8.2 5.6 3.2 7 6.8-.2 1.6-.1 3.1 0 4.7Z" fill="#d0d5ed" />
          <path d="M16.8 16.2c4-1.8 7.8-5 9-8.4.6-1.7-.4-3.2-2-3.1-2.8.2-5.6 3.2-7 6.8.2 1.6.1 3.1 0 4.7Z" fill="#d0edda" />
          <path d="M16 8.5v14" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </motion.span>
      <motion.span
        className="ph-butterfly ph-butterflyB"
        animate={
          reduced
            ? undefined
            : { y: [0, -8, 0], x: [0, -6, 0], rotate: [0, -6, 4, 0] }
        }
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
      >
        <svg viewBox="0 0 32 32" width="18" height="18" fill="none" aria-hidden="true">
          <path d="M15.2 16.2C11.2 14.4 7.4 11.2 6.2 7.8c-.6-1.7.4-3.2 2-3.1 2.8.2 5.6 3.2 7 6.8-.2 1.6-.1 3.1 0 4.7Z" fill="#edd0e4" />
          <path d="M16.8 16.2c4-1.8 7.8-5 9-8.4.6-1.7-.4-3.2-2-3.1-2.8.2-5.6 3.2-7 6.8.2 1.6.1 3.1 0 4.7Z" fill="#ede8d0" />
          <path d="M16 8.5v14" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </motion.span>
    </div>
  );
}
