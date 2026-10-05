'use client';

import { motion } from 'framer-motion';
import { Baby, BookOpen, Building2, School, Sparkles } from 'lucide-react';
import { PC_TRUST } from './data';
import { PcReveal } from './PcReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = [School, Building2, BookOpen, Baby, Sparkles];

export function PcTrust() {
  const reduced = usePrefersReducedMotion();

  return (
    <PcReveal className="pc-trust">
      <p className="pc-trustLabel">Trusted by modern childcare centers</p>
      <motion.ul
        className="pc-trustRow"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {PC_TRUST.map((item, i) => {
          const Icon = ICONS[i] ?? School;
          return (
            <motion.li key={item.label} variants={fadeUp}>
              <Icon size={16} aria-hidden />
              <div>
                <strong>{item.label}</strong>
                <em>{item.hint}</em>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </PcReveal>
  );
}
