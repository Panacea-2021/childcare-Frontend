'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ClipboardList, Pencil, Sparkles, Star } from 'lucide-react';
import { useRef } from 'react';
import { fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';

export function ResourceHero() {
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const decorY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 24]);
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.25);

  return (
    <section ref={sectionRef} className="rc-hero">
      <motion.div className="rc-heroGlow" style={{ y: decorY }} aria-hidden />
      <motion.span
        className="rc-heroFloat rc-heroFloat--star"
        aria-hidden
        {...(reduced ? {} : floatAnim(7, 6.4, 0.2))}
      >
        <Star size={14} fill="currentColor" strokeWidth={0} />
      </motion.span>
      <motion.span
        className="rc-heroFloat rc-heroFloat--pencil"
        aria-hidden
        {...(reduced ? {} : floatAnim(6, 7, 0.8))}
      >
        <Pencil size={16} strokeWidth={1.8} />
      </motion.span>
      <motion.span
        className="rc-heroFloat rc-heroFloat--check"
        aria-hidden
        {...(reduced ? {} : floatAnim(8, 7.5, 1.1))}
      >
        <ClipboardList size={16} strokeWidth={1.8} />
      </motion.span>
      <motion.span
        className="rc-heroFloat rc-heroFloat--spark"
        aria-hidden
        {...(reduced ? {} : floatAnim(5, 5.8, 0.4))}
      >
        <Sparkles size={15} strokeWidth={1.8} />
      </motion.span>

      <div
        className="rc-wrap rc-heroInner"
        onMouseMove={(e) => {
          if (window.innerWidth < 900) return;
          onMove(e);
        }}
        onMouseLeave={onLeave}
      >
        <motion.div
          className="rc-heroDocs"
          ref={ref}
          aria-hidden
          style={{
            rotateX: reduced ? 0 : `${tilt.rx}deg`,
            rotateY: reduced ? 0 : `${tilt.ry}deg`,
            transformStyle: 'preserve-3d',
            perspective: 1000,
          }}
        >
          <span className="rc-doc rc-doc--a" />
          <span className="rc-doc rc-doc--b" />
          <span className="rc-doc rc-doc--c" />
        </motion.div>

        <motion.div
          className="rc-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.h1 variants={fadeUp}>Panacea resource center</motion.h1>
          <motion.p variants={fadeUp}>
            Get expert-created checklists, templates, and cheatsheets for all things early years!
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
