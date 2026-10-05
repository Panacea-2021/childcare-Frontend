'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type PanaceaAICoreProps = {
  active?: boolean;
  level?: number;
};

const WAVE_COUNT = 36;

export function PanaceaAICore({ active = false, level = 0 }: PanaceaAICoreProps) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showMotion = mounted && !reduced;
  const pulse = 1 + (active ? level * 0.16 : 0.04);
  const glow = active ? 0.4 + level * 0.45 : 0.35;

  return (
    <div
      className={`pai-core${active ? ' is-active' : ''}${showMotion ? ' is-live' : ''}`}
      aria-hidden="true"
    >
      <div className="pai-stage">
        <div className="pai-aura" />
        <div
          className="pai-orbit pai-orbit-a"
          style={showMotion ? { transform: `scale(${pulse.toFixed(3)})` } : undefined}
        />
        <div className="pai-orbit pai-orbit-b" />
        <div className="pai-orbit pai-orbit-c" />

        {showMotion
          ? Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className="pai-particle" style={{ ['--i' as string]: String(i) }} />
            ))
          : null}

        <motion.div
          className="pai-sphere"
          animate={
            showMotion
              ? {
                  scale: [pulse, pulse * 1.035, pulse],
                  boxShadow: [
                    `0 0 40px rgba(93,95,239,${glow.toFixed(2)}), 0 0 80px rgba(237,208,228,0.4)`,
                    `0 0 58px rgba(93,95,239,${Math.min(0.9, glow + 0.18).toFixed(2)}), 0 0 100px rgba(237,208,228,0.55)`,
                    `0 0 40px rgba(93,95,239,${glow.toFixed(2)}), 0 0 80px rgba(237,208,228,0.4)`,
                  ],
                }
              : undefined
          }
          transition={
            showMotion
              ? { duration: active ? 1.35 : 3.1, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
        >
          <span className="pai-sphereSheen" />
          <span className="pai-sphereCore" />
          <span className="pai-sphereRing" />
        </motion.div>
      </div>

      <div className={`pai-wave${active ? ' is-hot' : ''}${showMotion ? ' is-dancing' : ''}`}>
        {Array.from({ length: WAVE_COUNT }).map((_, i) => {
          const mid = (WAVE_COUNT - 1) / 2;
          const dist = Math.abs(i - mid) / mid;
          const base = Math.round(14 + (1 - dist) * 22);
          return (
            <span
              key={i}
              style={{
                ['--i' as string]: String(i),
                ['--base' as string]: `${base}px`,
                ['--boost' as string]: active ? String(0.7 + level * 1.1) : '0.55',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
