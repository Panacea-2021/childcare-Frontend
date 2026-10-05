'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { fadeUp, orbPulse, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  onSeeDemo: () => void;
};

export function AdrHero({ onSeeDemo }: Props) {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;

  return (
    <div className="adr-hero">
      <motion.div
        className="adr-orb adr-orb-hero-a"
        aria-hidden
        {...(live ? orbPulse(15) : {})}
      />
      <motion.div
        className="adr-orb adr-orb-hero-b"
        aria-hidden
        {...(live ? orbPulse(18) : {})}
      />
      <motion.div
        className="adr-orb adr-orb-hero-c"
        aria-hidden
        {...(live ? orbPulse(13) : {})}
      />

      <motion.div
        className="adr-heroInner"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate="show"
      >
        <motion.h1 variants={fadeUp}>
          The World&apos;s First{' '}
          <span className="adr-heroGradient">AI Designed for Daily Reports</span>
        </motion.h1>
        <motion.p className="adr-heroSub" variants={fadeUp}>
          Because documentation shouldn&apos;t take over your day.
        </motion.p>
        <motion.div className="adr-heroCtas" variants={fadeUp}>
          <button type="button" className="adr-btnHero" onClick={onSeeDemo}>
            <Play size={16} aria-hidden />
            See the Daily Demo
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
