'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { RcReveal } from './RcReveal';
import { floatAnim, scaleIn } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function ResourceCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="rc-cta">
      <motion.span
        className="rc-ctaFloat rc-ctaFloat--a"
        aria-hidden
        {...(reduced ? {} : floatAnim(7, 6.5, 0.2))}
      >
        <Sparkles size={16} />
      </motion.span>
      <motion.span
        className="rc-ctaFloat rc-ctaFloat--b"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 7.2, 0.9))}
      >
        <Star size={14} fill="currentColor" strokeWidth={0} />
      </motion.span>

      <RcReveal className="rc-wrap rc-ctaInner" variants={scaleIn}>
        <h2>Try Our AI-Powered Childcare Platform</h2>
        <p>Revolutionize Your Childcare Operations with AI Powered Solutions.</p>
        <div className="rc-ctaActions">
          <Link href="/book-demo" className="ui-btn ui-btn-primary rc-ctaPrimary">
            Get a Free Demo
          </Link>
          <Link href="/contact" className="ui-btn ui-btn-outline rc-ctaSecondary">
            Contact Us
          </Link>
        </div>
        <p className="rc-ctaNote">
          Become part of a network of childcare centers benefiting from our easy-to-use financial
          tools.{' '}
          <Link href="/contact" className="rc-inlineLink">
            Join Our Community
          </Link>
        </p>
      </RcReveal>
    </section>
  );
}
