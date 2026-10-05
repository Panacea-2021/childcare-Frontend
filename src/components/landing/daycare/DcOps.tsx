'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { DC_OPS } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function DcOps() {
  const { reduced, animateProp } = useRevealFallback();
  const { ref: tiltRef, tilt, onMove, onLeave } = useParallaxTilt(0.28);

  return (
    <div className="dc-split dc-ops is-reverse">
      <motion.div
        className="dc-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div
          className="dc-opsStage"
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
          <div className="dc-opsPanel" aria-hidden />
          <motion.article
            className="dc-opsCard dc-opsInvoice"
            {...(reduced ? {} : floatAnim(6, 6.2, 0.15))}
          >
            <strong>Invoice #1042</strong>
            <ul>
              <li>
                <span>Tuition · March</span>
                <b>$485.00</b>
              </li>
              <li>
                <span>Registration</span>
                <b>$50.00</b>
              </li>
              <li>
                <span>Late fee</span>
                <b>$15.00</b>
              </li>
            </ul>
            <em>Due in 5 days</em>
          </motion.article>
          <motion.article
            className="dc-opsCard dc-opsBalance"
            {...(reduced ? {} : floatAnim(-5, 5.6, 0.55))}
          >
            <strong>Balance Details</strong>
            <p>
              <b>$550.00</b>
              <span>Outstanding</span>
            </p>
            <i>Send reminder</i>
          </motion.article>
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
          {DC_OPS.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{DC_OPS.title}</motion.h2>
        <motion.p className="dc-sectionLead" variants={fadeUp}>
          {DC_OPS.lead}
        </motion.p>
        <ul className="dc-checkList">
          {DC_OPS.points.map((p) => (
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
