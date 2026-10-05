'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Point = { title: string; detail: string };

export function PcFeatureList({ points }: { points: readonly Point[] }) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.ul
      className="pc-featureList"
      variants={staggerContainer}
      initial={reduced ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {points.map((point) => (
        <motion.li key={point.title} variants={fadeUp}>
          <span className="pc-featureIcon" aria-hidden>
            <Check size={14} strokeWidth={2.6} />
          </span>
          <div>
            <strong>{point.title}</strong>
            <p>{point.detail}</p>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}
