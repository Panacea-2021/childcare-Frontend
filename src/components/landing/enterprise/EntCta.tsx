'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ENT_CTA } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, slideLeft, slideRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function EntCta() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="ent-cta" aria-labelledby="ent-cta-heading">
      <div className="ent-ctaSplit">
        <EntReveal className="ent-ctaPhoto" variants={slideLeft} amount={0.3}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ENT_CTA.image}
            alt="Children engaged in classroom activities"
            width={720}
            height={520}
            loading="lazy"
          />
          <span className="ent-ctaPhotoShade" aria-hidden />
        </EntReveal>

        <EntReveal className="ent-ctaPanel" variants={slideRight} amount={0.3}>
          <motion.div
            className="ent-ctaInner"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.45 }}
          >
            <motion.h2 id="ent-cta-heading" variants={fadeUp}>
              {ENT_CTA.title}
            </motion.h2>
            <motion.div className="ent-ctaActions" variants={fadeUp}>
              <Link href={ENT_CTA.primaryHref} className="ent-btnLight">
                {ENT_CTA.primaryLabel}
              </Link>
              <Link href={ENT_CTA.secondaryHref} className="ent-btnGhost">
                {ENT_CTA.secondaryLabel}
              </Link>
            </motion.div>
          </motion.div>
        </EntReveal>
      </div>
    </section>
  );
}
