'use client';

import Image from 'next/image';
import { Check, Headphones } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { PS_SUPPORT } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function PsSupport() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 20, reduced ? 0 : -20]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.3);

  return (
    <div ref={ref} className="ps-split ps-support">
      <motion.div
        className="ps-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="ps-eyebrow" variants={fadeUp}>
          {PS_SUPPORT.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{PS_SUPPORT.title}</motion.h2>
        <motion.p className="ps-sectionLead" variants={fadeUp}>
          {PS_SUPPORT.lead}
        </motion.p>
        <ul className="ps-checkList">
          {PS_SUPPORT.points.map((p) => (
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
          className="ps-supportStage"
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
          <motion.div className="ps-supportPhoto" style={{ y }}>
            <Image
              src={PS_SUPPORT.image}
              alt="Panacea support specialist ready to help"
              fill
              sizes="(max-width: 900px) 90vw, 380px"
              className="ps-coverImg"
            />
          </motion.div>

          <motion.div
            className="ps-supportChat"
            style={{ transform: 'translateZ(34px)' }}
            {...(reduced ? {} : floatAnim(6, 5.5, 0.35))}
          >
            <div className="ps-supportChatHead">
              <span className="ps-supportAvatar" aria-hidden>
                <Headphones size={14} />
              </span>
              <div>
                <strong>Sarah from Panacea</strong>
                <em>Online now</em>
              </div>
            </div>
            <p>Welcome back! How can I help you today?</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
