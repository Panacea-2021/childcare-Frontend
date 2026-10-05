'use client';

import Link from 'next/link';
import Image from 'next/image';
import { DollarSign, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { DC_HERO } from './data';
import { fadeUp, floatAnim, scaleIn, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function DcHero() {
  const reduced = usePrefersReducedMotion();
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.32);

  return (
    <section className="dc-hero">
      <div className="dc-heroBlob a" aria-hidden />
      <div className="dc-heroBlob b" aria-hidden />
      <div className="dc-heroGlow" aria-hidden />

      <div className="dc-wrap dc-heroInner">
        <motion.div
          className="dc-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="dc-eyebrow" variants={fadeUp}>
            {DC_HERO.eyebrow}
          </motion.p>
          <motion.h1 variants={fadeUp}>
            {DC_HERO.titleLine1}
            <br />
            {DC_HERO.titleLine2}
          </motion.h1>
          <motion.p className="dc-lead" variants={fadeUp}>
            {DC_HERO.lead}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href={DC_HERO.ctaHref} className="ui-btn ui-btn-primary dc-btn">
              {DC_HERO.ctaLabel}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="dc-heroVisual"
          variants={scaleIn}
          initial={reduced ? false : 'hidden'}
          animate="show"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <div
            ref={tiltRef}
            className="dc-heroStage"
            style={{
              transform: reduced
                ? undefined
                : `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="dc-heroShape" aria-hidden />
            <div className="dc-heroPhoto">
              <Image
                src={DC_HERO.image}
                alt={DC_HERO.imageAlt}
                fill
                priority
                sizes="(max-width: 900px) 92vw, 480px"
                className="dc-cover"
              />
            </div>
            <motion.span
              className="dc-floatChip dc-floatChip--pay"
              aria-hidden
              {...(reduced ? {} : floatAnim(7, 6.2, 0.2))}
            >
              <DollarSign size={18} strokeWidth={2.2} />
            </motion.span>
            <motion.span
              className="dc-floatChip dc-floatChip--chat"
              aria-hidden
              {...(reduced ? {} : floatAnim(6, 5.5, 0.8))}
            >
              <MessageCircle size={18} strokeWidth={2.2} />
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
