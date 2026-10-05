'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Check, Users, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { SC_HERO } from './data';
import { fadeUp, floatAnim, scaleIn, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function ScHero() {
  const reduced = usePrefersReducedMotion();
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.32);

  return (
    <section className="sc-hero">
      <div className="sc-heroBlob a" aria-hidden />
      <div className="sc-heroBlob b" aria-hidden />

      <div className="sc-wrap sc-heroInner">
        <motion.div
          className="sc-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="sc-eyebrow" variants={fadeUp}>
            {SC_HERO.eyebrow}
          </motion.p>
          <motion.h1 variants={fadeUp}>
            {SC_HERO.titleLine1}
            <br />
            {SC_HERO.titleLine2}
          </motion.h1>
          <motion.p className="sc-lead" variants={fadeUp}>
            {SC_HERO.lead}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href={SC_HERO.ctaHref} className="ui-btn ui-btn-primary sc-btn">
              {SC_HERO.ctaLabel}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="sc-heroVisual"
          variants={scaleIn}
          initial={reduced ? false : 'hidden'}
          animate="show"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <div
            ref={tiltRef}
            className="sc-heroStage"
            style={{
              transform: reduced
                ? undefined
                : `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            <motion.article
              className="sc-floatCard sc-cardMeal"
              {...(reduced ? {} : floatAnim(7, 6.2, 0.1))}
            >
              <div className="sc-cardMealMedia">
                <Image
                  src={SC_HERO.mealImage}
                  alt="Child enjoying a meal at the center"
                  fill
                  sizes="180px"
                  className="sc-cover"
                  priority
                />
              </div>
              <strong>Meal Update</strong>
              <em>Shared · 10:42 AM</em>
            </motion.article>

            <motion.article
              className="sc-floatCard sc-cardLeave"
              {...(reduced ? {} : floatAnim(-5, 5.6, 0.5))}
            >
              <strong>Leave request</strong>
              <p>Maya Chen · Tomorrow</p>
              <div className="sc-leaveActions">
                <span className="is-yes">
                  <Check size={12} strokeWidth={3} /> Approve
                </span>
                <span className="is-no">
                  <X size={12} strokeWidth={3} /> Decline
                </span>
              </div>
            </motion.article>

            <motion.article
              className="sc-floatCard sc-cardPay"
              {...(reduced ? {} : floatAnim(6, 6.8, 0.9))}
            >
              <em>Registration Fee</em>
              <strong>$550.00</strong>
              <span className="sc-payCta">Proceed to pay</span>
            </motion.article>

            <motion.article
              className="sc-floatCard sc-cardAtt"
              {...(reduced ? {} : floatAnim(5, 5.4, 0.3))}
            >
              <strong>Today&apos;s Attendance</strong>
              <div className="sc-attRow">
                <span>
                  <Users size={14} aria-hidden />
                  <b>18</b> Children
                </span>
                <span>
                  <b>04</b> Staff
                </span>
              </div>
            </motion.article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
