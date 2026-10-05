'use client';

import Image from 'next/image';
import { Check, Headphones } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { DC_SUPPORT } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function DcSupport() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 18, reduced ? 0 : -18]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.28);

  return (
    <div ref={ref} className="dc-split dc-support is-reverse">
      <motion.div
        className="dc-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div
          className="dc-supportStage"
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
          <div className="dc-supportBlob" aria-hidden />
          <motion.div className="dc-supportPhoto" style={{ y }}>
            <Image
              src={DC_SUPPORT.image}
              alt="Panacea support specialist ready to help"
              fill
              sizes="(max-width: 900px) 90vw, 380px"
              className="dc-cover"
            />
          </motion.div>
          <motion.div
            className="dc-supportChat"
            {...(reduced ? {} : floatAnim(6, 5.5, 0.3))}
          >
            <div className="dc-supportChatHead">
              <span aria-hidden>
                <Headphones size={14} />
              </span>
              <div>
                <strong>Panacea Support</strong>
                <em>Online now</em>
              </div>
            </div>
            <p>Hi there! How can we help your daycare today?</p>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="dc-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="dc-eyebrow" variants={fadeUp}>
          {DC_SUPPORT.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{DC_SUPPORT.title}</motion.h2>
        <motion.p className="dc-sectionLead" variants={fadeUp}>
          {DC_SUPPORT.lead}
        </motion.p>
        <ul className="dc-checkList">
          {DC_SUPPORT.points.map((p) => (
            <motion.li key={p.title} variants={slideFromRight}>
              <span className="dc-check" aria-hidden>
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
    </div>
  );
}
