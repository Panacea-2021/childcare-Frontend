'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { AU_VISION } from './data';
import { AuReveal } from './AuReveal';
import { floatAnim, scaleIn } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AuVision() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : 24, reduced ? 0 : -28]);
  const ringY = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -16, reduced ? 0 : 20]);

  return (
    <section ref={sectionRef} className="au-vision">
      <motion.div className="au-visionOrb" style={{ y: orbY }} aria-hidden />
      <motion.div className="au-visionRing" style={{ y: ringY }} aria-hidden />
      <motion.div
        className="au-visionDot au-visionDot--a"
        aria-hidden
        {...(reduced ? {} : floatAnim(8, 8, 0.2))}
      />
      <motion.div
        className="au-visionDot au-visionDot--b"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 7, 1))}
      />

      <div className="au-wrap">
        <AuReveal className="au-visionInner" variants={scaleIn}>
          <h2>{AU_VISION.title}</h2>
          <p>{AU_VISION.body}</p>
        </AuReveal>
      </div>
    </section>
  );
}
