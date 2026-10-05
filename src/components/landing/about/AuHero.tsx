'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Pencil, Rocket, Smile, Star } from 'lucide-react';
import { useRef } from 'react';
import { AU_HERO } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

function Stars() {
  return (
    <span className="au-stars" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  );
}

export function AuHero() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const decorY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 28]);
  const leftY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -18]);
  const rightY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -22]);

  const leftTilt = useParallaxTilt(0.28);
  const rightTilt = useParallaxTilt(0.28);

  return (
    <section ref={sectionRef} className="au-hero">
      <motion.div className="au-heroGlow" style={{ y: decorY }} aria-hidden />
      <motion.div
        className="au-heroBlob au-heroBlob--lilac"
        style={{ y: decorY }}
        aria-hidden
        {...(reduced ? {} : floatAnim(10, 9, 0.2))}
      />
      <motion.div
        className="au-heroBlob au-heroBlob--peach"
        aria-hidden
        {...(reduced ? {} : floatAnim(8, 7.5, 1.1))}
      />

      <div className="au-wrap au-heroInner">
        <motion.div
          className="au-heroVisual au-heroVisual--left"
          variants={slideFromLeft}
          initial={reduced ? false : 'hidden'}
          animate="show"
          onMouseMove={leftTilt.onMove}
          onMouseLeave={leftTilt.onLeave}
        >
          <motion.div
            ref={leftTilt.ref}
            className="au-heroFrame au-heroFrame--circle"
            style={{
              y: leftY,
              rotateY: reduced ? 0 : `${leftTilt.tilt.ry - 2}deg`,
              rotateX: reduced ? 0 : `${leftTilt.tilt.rx}deg`,
              transformStyle: 'preserve-3d',
              perspective: 1200,
            }}
          >
            <div className="au-heroPhoto">
              <Image
                src={AU_HERO.leftImage}
                alt={AU_HERO.leftAlt}
                fill
                priority
                sizes="(max-width: 900px) 70vw, 260px"
                className="au-heroImg"
              />
            </div>
          </motion.div>
          <motion.span
            className="au-floatChip au-floatChip--rocket"
            aria-hidden
            {...(reduced ? {} : floatAnim(7, 5.8, 0.3))}
          >
            <Rocket size={16} strokeWidth={2.2} />
          </motion.span>
          <motion.span
            className="au-floatChip au-floatChip--pencil"
            aria-hidden
            {...(reduced ? {} : floatAnim(6, 6.4, 0.8))}
          >
            <Pencil size={15} strokeWidth={2.2} />
          </motion.span>
        </motion.div>

        <motion.div
          className="au-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.h1 variants={fadeUp}>{AU_HERO.title}</motion.h1>
          <motion.p className="au-lead" variants={fadeUp}>
            {AU_HERO.lead}
          </motion.p>
          <motion.div className="au-socialProof" variants={fadeUp}>
            <div className="au-avatars" aria-hidden>
              {AU_HERO.avatars.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" width={40} height={40} />
              ))}
            </div>
            <div className="au-rating">
              <Stars />
              <span>{AU_HERO.ratingLabel}</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="au-heroVisual au-heroVisual--right"
          variants={slideFromRight}
          initial={reduced ? false : 'hidden'}
          animate="show"
          onMouseMove={rightTilt.onMove}
          onMouseLeave={rightTilt.onLeave}
        >
          <motion.div
            ref={rightTilt.ref}
            className="au-heroFrame au-heroFrame--rounded"
            style={{
              y: rightY,
              rotateY: reduced ? 0 : `${rightTilt.tilt.ry + 2}deg`,
              rotateX: reduced ? 0 : `${rightTilt.tilt.rx}deg`,
              transformStyle: 'preserve-3d',
              perspective: 1200,
            }}
          >
            <div className="au-heroPhoto">
              <Image
                src={AU_HERO.rightImage}
                alt={AU_HERO.rightAlt}
                fill
                priority
                sizes="(max-width: 900px) 70vw, 280px"
                className="au-heroImg"
              />
            </div>
          </motion.div>
          <motion.span
            className="au-floatChip au-floatChip--smile"
            aria-hidden
            {...(reduced ? {} : floatAnim(7, 6.1, 0.5))}
          >
            <Smile size={16} strokeWidth={2.2} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
