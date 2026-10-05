'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SC_PARENT_APP } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function ScParentApp() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 18, reduced ? 0 : -18]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.28);

  return (
    <div ref={ref} className="sc-split sc-parentApp">
      <motion.div
        className="sc-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="sc-eyebrow" variants={fadeUp}>
          {SC_PARENT_APP.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{SC_PARENT_APP.title}</motion.h2>
        <motion.p className="sc-sectionLead" variants={fadeUp}>
          {SC_PARENT_APP.lead}
        </motion.p>
        <ul className="sc-checkList">
          {SC_PARENT_APP.points.map((p) => (
            <motion.li key={p.title} variants={slideFromLeft}>
              <span className="sc-check" aria-hidden>
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
        className="sc-splitVisual"
        variants={slideFromRight}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div
          className="sc-parentStage"
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
          <motion.div className="sc-parentPhoto" style={{ y }}>
            <Image
              src={SC_PARENT_APP.image}
              alt="Parent using the Panacea mobile experience"
              fill
              sizes="(max-width: 900px) 90vw, 420px"
              className="sc-cover"
            />
          </motion.div>
          <motion.div
            className="sc-parentBadge"
            {...(reduced ? {} : floatAnim(6, 5.6, 0.35))}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SC_PARENT_APP.profile.avatar}
              alt=""
              width={40}
              height={40}
            />
            <div>
              <strong>{SC_PARENT_APP.profile.name}</strong>
              <em>{SC_PARENT_APP.profile.meta}</em>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
