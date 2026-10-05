'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ClipboardList, Sparkles } from 'lucide-react';
import { fadeUp, floatAnim, orbPulse, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AipHero() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });

  const cardRotY = useTransform(sx, [0, 1], [-6, 4]);
  const cardRotX = useTransform(sy, [0, 1], [4, -3]);
  const layerObs = useTransform(sx, [0, 1], [14, -10]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const scrollMain = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -20]);
  const scrollFloat = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -34]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;

  const onMove = (e: MouseEvent) => {
    if (!live) return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <section ref={sectionRef} className="aip-hero">
      <motion.div
        className="aip-orb aip-orb-a"
        aria-hidden
        {...(live ? orbPulse(16) : {})}
      />
      <motion.div
        className="aip-orb aip-orb-b"
        aria-hidden
        {...(live ? orbPulse(18) : {})}
      />
      <motion.div
        className="aip-orb aip-orb-c"
        aria-hidden
        {...(live ? orbPulse(13) : {})}
      />
      <div className="aip-heroGrid" aria-hidden />

      <div className="aip-heroInner">
        <motion.div
          className="aip-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.h1 variants={fadeUp}>
            Step into the Future of Childcare with{' '}
            <span className="aip-heroBrand">Panacea AI</span>
          </motion.h1>
          <motion.p className="aip-heroSub" variants={fadeUp}>
            Seamless Parent Communication | Personalized Learning | Smarter Facilities
          </motion.p>
          <motion.div className="aip-heroCtas" variants={fadeUp}>
            <Link href="/book-demo" className="aip-btnGold">
              Book a Demo
            </Link>
          </motion.div>
        </motion.div>

        <div
          ref={stageRef}
          className="aip-heroVisual"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <motion.div
            className="aip-heroLessonWrap"
            style={
              live
                ? {
                    y: scrollMain,
                    rotateX: cardRotX,
                    rotateY: cardRotY,
                    transformPerspective: 1200,
                  }
                : undefined
            }
          >
            <motion.div
              className="aip-heroLesson glass"
              {...(live ? floatAnim(7, 5.8) : {})}
            >
              <div className="aip-heroLessonHead">
                <span className="aip-aiBadge">
                  <Sparkles size={13} aria-hidden />
                  Create lesson with AI
                </span>
              </div>
              <div className="aip-heroField">
                <label>Grade</label>
                <div className="aip-heroSelect">Toddler · Ages 2–3</div>
              </div>
              <div className="aip-heroField">
                <label>Subject</label>
                <div className="aip-heroSelect">Communication &amp; Language</div>
              </div>
              <div className="aip-heroField">
                <label>Topic</label>
                <div className="aip-heroSelect">Listening gardens</div>
              </div>
              <button type="button" className="aip-heroGenerate" tabIndex={-1}>
                <Sparkles size={14} aria-hidden />
                Generate lesson
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            className="aip-heroObs"
            style={live ? { y: scrollFloat, x: layerObs } : undefined}
            {...(live ? floatAnim(6, 6.4) : {})}
          >
            <div className="aip-heroObsHead">
              <ClipboardList size={14} aria-hidden />
              <strong>Observation</strong>
            </div>
            <p>
              Emma showed focused listening during circle time and shared two new
              vocabulary words with peers.
            </p>
            <span className="aip-heroObsTag">AI drafted · Ready to share</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
