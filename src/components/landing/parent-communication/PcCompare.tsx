'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { PC_COMPARE_NEW, PC_COMPARE_OLD } from './data';
import { PcReveal } from './PcReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PcCompare() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="pc-compare">
      <PcReveal className="pc-sectionHead pc-center">
        <p className="pc-eyebrow">Clearer than the old way</p>
        <h2>One Platform. Better Parent Communication.</h2>
        <p>Replace scattered messages with a calm, connected family experience.</p>
      </PcReveal>

      <motion.div
        className="pc-compareGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        <motion.div className="pc-compareCol is-old" variants={fadeUp}>
          <h3>Traditional communication</h3>
          <ul>
            {PC_COMPARE_OLD.map((item) => (
              <li key={item}>
                <X size={15} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div className="pc-compareCol is-new" variants={fadeUp}>
          <h3>Panacea</h3>
          <ul>
            {PC_COMPARE_NEW.map((item) => (
              <li key={item}>
                <Check size={15} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </div>
  );
}
