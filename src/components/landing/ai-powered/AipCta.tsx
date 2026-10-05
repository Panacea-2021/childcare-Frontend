'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, orbPulse, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AipCta() {
  const reduced = usePrefersReducedMotion();
  const live = !reduced;

  return (
    <div className="aip-ctaBlock">
      <motion.div
        className="aip-orb aip-orb-cta-a"
        aria-hidden
        {...(live ? orbPulse(15) : {})}
      />
      <motion.div
        className="aip-orb aip-orb-cta-b"
        aria-hidden
        {...(live ? orbPulse(17) : {})}
      />

      <motion.div
        className="aip-cta"
        initial={reduced ? false : { opacity: 0, y: 28, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="aip-ctaInner"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h2 variants={fadeUp}>
            Ready to take the next step with #1 AI Powered Childcare Software?
          </motion.h2>
          <motion.p className="aip-ctaLead" variants={fadeUp}>
            One platform for all your AI
          </motion.p>
          <motion.div className="aip-ctaActions" variants={fadeUp}>
            <Link href="/book-demo" className="aip-btnGold">
              Book a Demo
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
