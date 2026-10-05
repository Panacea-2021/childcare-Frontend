'use client';

import { motion } from 'framer-motion';
import { PRICING_HERO } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PricingHero() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="px-hero" aria-labelledby="px-hero-title">
      <div className="px-heroDecor" aria-hidden>
        <span className="px-blob px-blob--a" />
        <span className="px-blob px-blob--b" />
        <span className="px-blob px-blob--c" />
        <span className="px-star px-star--1" />
        <span className="px-star px-star--2" />
        <span className="px-star px-star--3" />
        <span className="px-particle px-particle--1" />
        <span className="px-particle px-particle--2" />
        <span className="px-particle px-particle--3" />
        <span className="px-particle px-particle--4" />
      </div>

      <div className="px-wrap px-heroInner">
        <motion.h1
          id="px-hero-title"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {PRICING_HERO.headline}
        </motion.h1>
        <motion.p
          className="px-heroSub"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {PRICING_HERO.subtitle}
        </motion.p>
      </div>
    </section>
  );
}
