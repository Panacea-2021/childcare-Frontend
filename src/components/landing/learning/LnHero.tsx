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
import { ArrowRight, ClipboardCheck, Sparkles, TrendingUp } from 'lucide-react';
import { fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function LnHero() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });

  const cardRotY = useTransform(sx, [0, 1], [-5, 3]);
  const cardRotX = useTransform(sy, [0, 1], [3, -2]);
  const layerA = useTransform(sx, [0, 1], [-10, 10]);
  const layerB = useTransform(sx, [0, 1], [12, -8]);
  const layerC = useTransform(sy, [0, 1], [8, -10]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const blobY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 28]);
  const scrollMain = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -22]);
  const scrollFloat = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -36]);

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
    <section ref={sectionRef} className="ln-hero">
      <motion.div className="ln-heroBlob a" style={{ y: blobY }} aria-hidden />
      <motion.div className="ln-heroBlob b" style={{ y: blobY }} aria-hidden />
      <div className="ln-heroGrid" aria-hidden />

      <div className="ln-heroInner">
        <motion.div
          className="ln-heroCopy"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          animate="show"
        >
          <motion.p className="ln-eyebrow" variants={fadeUp}>
            Learning &amp; Assessments
          </motion.p>
          <motion.h1 variants={fadeUp}>Save Hours on Lesson Planning &amp; Assessments.</motion.h1>
          <motion.p className="ln-lead" variants={fadeUp}>
            Transform your childcare insights with AI. From observations to planning, simplify
            every step.
          </motion.p>
          <motion.div className="ln-heroCtas" variants={fadeUp}>
            <Link href="/book-demo" className="ui-btn ui-btn-primary ln-btnPrimary">
              Book a Demo
              <ArrowRight size={16} aria-hidden />
            </Link>
            <a href="#ln-cycle" className="ui-btn ui-btn-outline ln-btnGhost">
              See the Learning Cycle
            </a>
          </motion.div>
        </motion.div>

        <div
          ref={stageRef}
          className="ln-heroVisual"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          <div className="ln-heroMintBlob" aria-hidden />
          <div className="ln-heroLavenderGlow" aria-hidden />

          <motion.div
            className="ln-hvCard ln-hvAi"
            style={live ? { y: scrollFloat, x: layerA } : undefined}
            initial={false}
            animate={{ opacity: 1 }}
            whileHover={live ? { y: -4, scale: 1.03 } : undefined}
          >
            <motion.div {...(live ? floatAnim(6, 4.6) : {})}>
              <span className="ln-hvAiIcon" aria-hidden>
                <Sparkles size={14} />
              </span>
              AI suggestion ready
            </motion.div>
          </motion.div>

          <motion.div
            className="ln-hvWorkspaceWrap"
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
            initial={false}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="ln-hvWorkspace glass"
              {...(live ? floatAnim(8, 5.8) : {})}
              whileHover={live ? { scale: 1.012 } : undefined}
            >
              <div className="ln-hvWorkHead">
                <strong>Learning Workspace</strong>
                <em>Room B · Today</em>
              </div>

              <div className="ln-hvProfile">
                <img
                  src="/images/parent-communication/classroom.jpg"
                  alt=""
                  width={48}
                  height={48}
                  loading="lazy"
                />
                <div>
                  <strong>Ethan · Age 4</strong>
                  <span>Communication &amp; Language</span>
                </div>
                <i className="ln-hvStatus">On track</i>
              </div>

              <div className="ln-hvProgressBlock">
                <div className="ln-hvProgressLabel">
                  <span>Assessment progress</span>
                  <em>78%</em>
                </div>
                <div className="ln-hvBar" aria-hidden>
                  <i style={{ width: '78%' }} />
                </div>
              </div>

              <ul className="ln-hvGoals">
                <li>
                  <ClipboardCheck size={14} aria-hidden />
                  <span>Listening during circle time</span>
                </li>
                <li>
                  <TrendingUp size={14} aria-hidden />
                  <span>Expressive vocabulary growth</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            className="ln-hvCard ln-hvAssess"
            style={live ? { y: scrollFloat, x: layerB } : undefined}
            initial={false}
            animate={{ opacity: 1 }}
            whileHover={live ? { y: -3 } : undefined}
          >
            <motion.div {...(live ? floatAnim(5, 5.4) : {})}>
              <strong>Assessment</strong>
              <div className="ln-hvMiniRing" aria-hidden>
                <svg viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="16" />
                  <circle cx="22" cy="22" r="16" className="is-fill" />
                </svg>
                <em>4/5</em>
              </div>
              <p>Milestones this week</p>
            </motion.div>
          </motion.div>

          <motion.div
            className="ln-hvCard ln-hvSuggest"
            style={live ? { y: scrollFloat, x: layerC } : undefined}
            initial={false}
            animate={{ opacity: 1 }}
            whileHover={live ? { y: -4 } : undefined}
          >
            <motion.div {...(live ? floatAnim(6, 6.1) : {})}>
              <Sparkles size={14} aria-hidden />
              <div>
                <strong>AI lesson idea</strong>
                <p>Story stones for listening skills</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
