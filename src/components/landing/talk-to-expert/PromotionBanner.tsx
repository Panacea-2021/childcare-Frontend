'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { TTE_PROMO } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PromotionBanner() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="tte-promo" aria-labelledby="tte-promo-title">
      <div className="tte-wrap">
        <motion.div
          className="tte-promoCard"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tte-promoMedia">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={TTE_PROMO.imageUrl}
              alt=""
              width={720}
              height={480}
              loading="lazy"
              className="tte-promoImg"
            />
            <span className="tte-promoFloat" aria-hidden />
          </div>
          <div className="tte-promoCopy">
            <h2 id="tte-promo-title">{TTE_PROMO.title}</h2>
            <p>{TTE_PROMO.body}</p>
            <Link href={TTE_PROMO.ctaHref} className="tte-promoCta">
              {TTE_PROMO.ctaLabel}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
