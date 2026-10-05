'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { LnReveal } from './LnReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function LnCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <LnReveal className="ln-cta" variants={fadeUp}>
      <div className="ln-ctaGlow" aria-hidden />
      <div className="ln-ctaOrb a" aria-hidden />
      <div className="ln-ctaOrb b" aria-hidden />
      <motion.div
        className="ln-ctaInner"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.p className="ln-eyebrow" variants={fadeUp}>
          <Sparkles size={13} aria-hidden /> Start with Panacea
        </motion.p>
        <motion.h2 variants={fadeUp}>
          Unlock the Future of Childcare with AI-Powered Learning.
        </motion.h2>
        <motion.p className="ln-ctaLead" variants={fadeUp}>
          See how Panacea helps educators plan faster, observe smarter, and support every
          child’s next steps.
        </motion.p>
        <motion.div className="ln-ctaActions" variants={fadeUp}>
          <Link href="/book-demo" className="ui-btn ui-btn-primary ln-btnPrimary">
            Book a Demo
            <ArrowRight size={16} aria-hidden />
          </Link>
        </motion.div>
      </motion.div>
    </LnReveal>
  );
}
