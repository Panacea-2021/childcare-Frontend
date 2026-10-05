'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PcReveal } from './PcReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PcCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <PcReveal className="pc-cta" variants={fadeUp}>
      <div className="pc-ctaGlow" aria-hidden />
      <div className="pc-ctaOrb a" aria-hidden />
      <div className="pc-ctaOrb b" aria-hidden />
      <motion.div
        className="pc-ctaInner"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.p className="pc-eyebrow" variants={fadeUp}>
          <Sparkles size={13} aria-hidden /> Start with Panacea
        </motion.p>
        <motion.h2 variants={fadeUp}>
          Happier Parents. Effortless Communication. Just a Click Away.
        </motion.h2>
        <motion.p className="pc-ctaLead" variants={fadeUp}>
          See how Panacea helps childcare centers create stronger connections with families.
        </motion.p>
        <motion.div className="pc-ctaActions" variants={fadeUp}>
          <Link href="/book-demo" className="ui-btn ui-btn-primary pc-btnPrimary">
            Book a Demo
            <ArrowRight size={16} aria-hidden />
          </Link>
        </motion.div>
      </motion.div>
    </PcReveal>
  );
}
