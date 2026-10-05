'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { DC_PARENTS } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function DcParents() {
  const { reduced, animateProp } = useRevealFallback();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 16, reduced ? 0 : -16]);
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.28);

  return (
    <div ref={ref} className="dc-split dc-parents is-reverse">
      <motion.div
        className="dc-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div
          className="dc-parentStage"
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
          <div className="dc-parentBlob" aria-hidden />
          <motion.div className="dc-parentPhone" style={{ y }}>
            <div className="dc-parentPhoneHead">
              <strong>Recent Activity</strong>
              <em>Maya · Room A</em>
            </div>
            <div className="dc-parentMedia">
              <Image
                src={DC_PARENTS.image}
                alt="Daycare activity shared with parents"
                fill
                sizes="260px"
                className="dc-cover"
              />
            </div>
            <p>Built towers with friends during free play — great sharing today.</p>
          </motion.div>
          <motion.div
            className="dc-parentBadge"
            {...(reduced ? {} : floatAnim(6, 5.5, 0.4))}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={DC_PARENTS.profileImage} alt="" width={40} height={40} />
            <div>
              <strong>Daily Report</strong>
              <em>Ready to review</em>
            </div>
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
          {DC_PARENTS.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{DC_PARENTS.title}</motion.h2>
        <motion.p className="dc-sectionLead" variants={fadeUp}>
          {DC_PARENTS.lead}
        </motion.p>
        <ul className="dc-checkList">
          {DC_PARENTS.points.map((p) => (
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
