'use client';

import { motion } from 'framer-motion';
import { LN_FRAMEWORKS } from './data';
import { LnReveal } from './LnReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function LnFrameworks() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="ln-frameworks">
      <LnReveal className="ln-sectionHead ln-center ln-fwHead">
        <p className="ln-eyebrow">Curriculum frameworks</p>
        <h2>Aligned to the frameworks you already trust</h2>
      </LnReveal>

      <motion.ul
        className="ln-fwRow"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        {LN_FRAMEWORKS.map((item) => (
          <motion.li key={item.id} className="ln-fwPill glass" variants={fadeUp}>
            <strong>{item.label}</strong>
            <em>{item.region}</em>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
