'use client';

import Image from 'next/image';
import { Bath, Check, Cookie, Moon } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { PS_PARENTS } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function PsParents() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 18, reduced ? 0 : -18]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.28);

  return (
    <div ref={ref} className="ps-split ps-parents">
      <motion.div
        className="ps-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="ps-eyebrow" variants={fadeUp}>
          {PS_PARENTS.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{PS_PARENTS.title}</motion.h2>
        <motion.p className="ps-sectionLead" variants={fadeUp}>
          {PS_PARENTS.lead}
        </motion.p>
        <ul className="ps-checkList">
          {PS_PARENTS.points.map((p) => (
            <motion.li key={p.title} variants={slideFromLeft}>
              <span className="ps-check is-accent" aria-hidden>
                <Check size={14} strokeWidth={2.8} />
              </span>
              <div>
                <strong>{p.title}</strong>
                <em>{p.detail}</em>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="ps-splitVisual"
        variants={slideFromRight}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div
          className="ps-parentStage"
          ref={tiltRef}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{
            transform: reduced
              ? undefined
              : `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <motion.div className="ps-parentPhone" style={{ y, transform: 'translateZ(10px)' }}>
            <div className="ps-parentPhoneHead">
              <strong>Child&apos;s Daily Report</strong>
              <em>Maya · Room A</em>
            </div>
            <div className="ps-parentMedia">
              <Image
                src={PS_PARENTS.image}
                alt="Preschool activity shared with parents"
                fill
                sizes="280px"
                className="ps-coverImg"
              />
            </div>
            <p className="ps-parentNote">
              Built a tall tower with blocks and invited a friend to help — great teamwork today.
            </p>
            <div className="ps-parentStats">
              <span>
                <Cookie size={14} aria-hidden /> Food
              </span>
              <span>
                <Moon size={14} aria-hidden /> Nap
              </span>
              <span>
                <Bath size={14} aria-hidden /> Bathroom
              </span>
            </div>
          </motion.div>

          <motion.div
            className="ps-parentNotif"
            {...(reduced ? {} : floatAnim(7, 5.6, 0.4))}
            style={{ transform: 'translateZ(32px)' }}
          >
            <strong>New update</strong>
            <em>Photo shared · 2m ago</em>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
