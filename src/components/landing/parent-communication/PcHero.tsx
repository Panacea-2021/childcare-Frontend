'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRef } from 'react';
import { fadeUp, staggerContainer } from './motion';
import { ParentCommunicationHeroVisual } from './ParentCommunicationHeroVisual';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PcHero() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 30]);

  return (
    <section ref={ref} className="pc-hero">
      <motion.div className="pc-heroBlob a" style={{ y: blobY }} aria-hidden />
      <motion.div className="pc-heroBlob b" style={{ y: blobY }} aria-hidden />
      <div className="pc-heroGrid" aria-hidden />

      <div className="pc-heroInner">
        <motion.div
          className="pc-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="pc-eyebrow" variants={fadeUp}>
            Parent Communication
          </motion.p>
          <motion.h1 variants={fadeUp}>
            <span className="pc-heroLine">Real-Time Updates,</span>
            <br />
            <span className="pc-gradText">Stronger Trust</span>
          </motion.h1>
          <motion.p className="pc-lead" variants={fadeUp}>
            Keep families connected with real-time updates, meaningful child progress, secure
            messaging, and effortless communication — all from one place.
          </motion.p>
          <motion.div className="pc-heroCtas" variants={fadeUp}>
            <Link href="/book-demo" className="ui-btn ui-btn-primary pc-btnPrimary">
              Book a Demo
              <ArrowRight size={16} aria-hidden />
            </Link>
            <a href="#pc-realtime" className="ui-btn ui-btn-outline pc-btnGhost">
              Explore Communication
            </a>
          </motion.div>
        </motion.div>

        <ParentCommunicationHeroVisual />
      </div>
    </section>
  );
}
