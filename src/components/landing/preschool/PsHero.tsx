'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { DollarSign, MessageCircle } from 'lucide-react';
import { useRef } from 'react';
import { PS_HERO } from './data';
import { fadeUp, floatAnim, scaleIn, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function PsHero() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -28]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 36]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.35);

  return (
    <section ref={sectionRef} className="ps-hero">
      <motion.div className="ps-heroBlob ps-heroBlob--pink" style={{ y: blobY }} aria-hidden />
      <div className="ps-heroGlow" aria-hidden />

      <div className="ps-wrap ps-heroInner">
        <motion.div
          className="ps-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="ps-eyebrow" variants={fadeUp}>
            {PS_HERO.eyebrow}
          </motion.p>
          <motion.h1 variants={fadeUp}>
            {PS_HERO.titleLine1}
            <br />
            {PS_HERO.titleLine2}
          </motion.h1>
          <motion.p className="ps-lead" variants={fadeUp}>
            {PS_HERO.lead}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href={PS_HERO.ctaHref} className="ui-btn ui-btn-primary ps-btn">
              {PS_HERO.ctaLabel}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="ps-heroVisual"
          variants={scaleIn}
          initial={reduced ? false : 'hidden'}
          animate="show"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <motion.div
            ref={tiltRef}
            className="ps-heroStage"
            style={{
              y: imageY,
              rotateX: reduced ? 0 : `${tilt.rx}deg`,
              rotateY: reduced ? 0 : `${tilt.ry}deg`,
              transformStyle: 'preserve-3d',
            }}
          >
            <div className="ps-heroShape" aria-hidden />
            <div className="ps-heroPhoto">
              <Image
                src={PS_HERO.image}
                alt={PS_HERO.imageAlt}
                fill
                priority
                sizes="(max-width: 900px) 92vw, 480px"
                className="ps-heroImg"
              />
            </div>

            <motion.span
              className="ps-floatChip ps-floatChip--chat"
              aria-hidden
              {...(reduced ? {} : floatAnim(8, 6.2, 0.2))}
            >
              <MessageCircle size={18} strokeWidth={2.2} />
            </motion.span>
            <motion.span
              className="ps-floatChip ps-floatChip--pay"
              aria-hidden
              {...(reduced ? {} : floatAnim(7, 5.4, 0.9))}
            >
              <DollarSign size={18} strokeWidth={2.2} />
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
