'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { CsReveal } from './CsReveal';
import { floatAnim, scaleIn } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function CsCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="cs-cta">
      <motion.span
        className="cs-ctaFloat cs-ctaFloat--a"
        aria-hidden
        {...(reduced ? {} : floatAnim(7, 6.5, 0.2))}
      >
        <Sparkles size={16} />
      </motion.span>
      <motion.span
        className="cs-ctaFloat cs-ctaFloat--b"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 7.2, 0.9))}
      >
        <Star size={14} fill="currentColor" strokeWidth={0} />
      </motion.span>

      <CsReveal className="cs-wrap cs-ctaInner" variants={scaleIn}>
        <h2>
          Excited to Try Our AI-Powered
          <br />
          Childcare Platform?
        </h2>
        <p>
          Experience the future of childcare management with Panacea AI—empowering educators to
          craft lesson plans and communicate precisely in every parent&apos;s language.
        </p>
        <div className="cs-ctaActions">
          <Link href="/book-demo" className="ui-btn ui-btn-primary cs-ctaPrimary">
            Book a Demo
          </Link>
        </div>
      </CsReveal>
    </section>
  );
}
