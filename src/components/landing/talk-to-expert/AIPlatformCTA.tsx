'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TTE_PLATFORM_CTA } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AIPlatformCTA() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="tte-platform" aria-labelledby="tte-platform-title">
      <div className="tte-wrap">
        <motion.div
          className="tte-platformGrid"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tte-platformMedia">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TTE_PLATFORM_CTA.imageUrl}
              alt=""
              width={900}
              height={700}
              loading="lazy"
            />
          </div>
          <div className="tte-platformPanel">
            <h2 id="tte-platform-title">{TTE_PLATFORM_CTA.title}</h2>
            <p>{TTE_PLATFORM_CTA.body}</p>
            <Link href={TTE_PLATFORM_CTA.ctaHref} className="tte-platformCta">
              {TTE_PLATFORM_CTA.ctaLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
