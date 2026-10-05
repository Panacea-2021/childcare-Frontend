'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { EwReveal } from './EwReveal';
import { floatAnim, scaleIn } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function EwSubscribe() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="ew-subscribe">
      <div className="ew-subBlob ew-subBlob--a" aria-hidden />
      <div className="ew-subBlob ew-subBlob--b" aria-hidden />
      <motion.span
        className="ew-ctaFloat ew-ctaFloat--a"
        aria-hidden
        {...(reduced ? {} : floatAnim(7, 7, 0.2))}
      >
        <Sparkles size={15} />
      </motion.span>
      <motion.span
        className="ew-ctaFloat ew-ctaFloat--b"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 8, 0.8))}
      >
        <Star size={13} fill="currentColor" strokeWidth={0} />
      </motion.span>

      <EwReveal className="ew-wrap ew-subInner" variants={scaleIn}>
        <h2>Become part of an exclusive community of childcare leaders</h2>
        <p>
          Get access to curated early years content, live webinars, free workshops and more.
        </p>
        <Link href="/contact" className="ui-btn ui-btn-primary ew-subBtn">
          Subscribe now
        </Link>
      </EwReveal>
    </section>
  );
}
