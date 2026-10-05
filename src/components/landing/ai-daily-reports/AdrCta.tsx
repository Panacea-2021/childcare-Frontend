'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AdrReveal } from './AdrReveal';
import { fadeUp, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AdrCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="adr-cta">
      <div className="adr-ctaSplit">
        <AdrReveal className="adr-ctaPhoto" variants={slideFromLeft} amount={0.3}>
          <img
            src="/images/parent-communication/activity.jpg"
            alt="Educator engaging with children during classroom play"
            width={720}
            height={520}
            loading="lazy"
          />
          <span className="adr-ctaPhotoShade" aria-hidden />
        </AdrReveal>

        <AdrReveal className="adr-ctaPanel" variants={slideFromRight} amount={0.3}>
          <motion.div
            className="adr-ctaInner"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
          >
            <motion.h2 variants={fadeUp}>
              Come build the future of early education with us.
            </motion.h2>
            <motion.div className="adr-ctaActions" variants={fadeUp}>
              <Link href="/book-demo" className="adr-btnLight">
                Join The Movement
              </Link>
              <Link href="/features/ai" className="adr-btnGhost">
                Learn More
                <ArrowRight size={15} aria-hidden />
              </Link>
            </motion.div>
          </motion.div>
        </AdrReveal>
      </div>
    </div>
  );
}
