'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { BookOpen, Check, Sparkles, Wand2 } from 'lucide-react';
import { AIP_LESSON_POINTS } from './data';
import { AipReveal } from './AipReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const CHIPS = [
  { label: 'Align to goals', Icon: BookOpen },
  { label: 'Add extensions', Icon: Wand2 },
  { label: 'Suggest materials', Icon: Sparkles },
] as const;

export function AipFeatureLessons() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });

  const cardRotY = useTransform(sx, [0, 1], [-3, 3]);
  const cardRotX = useTransform(sy, [0, 1], [2, -2]);
  const chipX = useTransform(sx, [0, 1], [-10, 14]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], [16, -16]);

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

  return (
    <div className="aip-featureCard">
      <div className="aip-featureSplit is-reverse">
        <AipReveal className="aip-featureCopy" variants={slideFromLeft}>
          <h2>Teaching Made Impactful with AI-Backed Lessons</h2>
          <motion.ul
            className="aip-pointList"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            {AIP_LESSON_POINTS.map((point) => (
              <motion.li key={point.title} variants={fadeUp}>
                <span className="aip-pointIcon" aria-hidden>
                  <Check size={14} strokeWidth={2.6} />
                </span>
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.detail}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </AipReveal>

        <AipReveal className="aip-featureVisual" variants={slideFromRight}>
          <div
            ref={stageRef}
            className="aip-lessonStage"
            onMouseMove={onMove}
            onMouseLeave={() => {
              mx.set(0.5);
              my.set(0.5);
            }}
          >
            <motion.div
              className="aip-lessonFormWrap"
              style={
                live
                  ? {
                      y: scrollY,
                      rotateX: cardRotX,
                      rotateY: cardRotY,
                      transformPerspective: 1100,
                    }
                  : undefined
              }
            >
              <motion.div
                className="aip-lessonForm glass"
                {...(live ? floatAnim(5, 6) : {})}
              >
                <div className="aip-lessonThumb" aria-hidden>
                  <img
                    src="/images/parent-communication/learning.jpg"
                    alt=""
                    width={280}
                    height={96}
                    loading="lazy"
                  />
                </div>
                <div className="aip-lessonFormHead">
                  <span className="aip-aiBadge soft">
                    <Sparkles size={13} aria-hidden />
                    Lesson Planning AI
                  </span>
                </div>
                <div className="aip-heroField">
                  <label>Age group</label>
                  <div className="aip-heroSelect light">Preschool · Ages 3–4</div>
                </div>
                <div className="aip-heroField">
                  <label>Focus area</label>
                  <div className="aip-heroSelect light">Listening &amp; expression</div>
                </div>
                <div className="aip-heroField">
                  <label>Activity idea</label>
                  <div className="aip-heroSelect light">Story stones outdoors</div>
                </div>
                <button type="button" className="aip-heroGenerate dark" tabIndex={-1}>
                  Create lesson
                </button>
              </motion.div>
            </motion.div>

            <motion.span
              className="aip-createdChip"
              {...(live ? floatAnim(7, 5.2) : {})}
            >
              <Check size={13} strokeWidth={2.8} aria-hidden />
              Lesson Plan Created
            </motion.span>

            <motion.div className="aip-lessonChips" style={live ? { x: chipX } : undefined}>
              {CHIPS.map((chip, i) => {
                const Icon = chip.Icon;
                return (
                  <motion.span
                    key={chip.label}
                    className={`aip-chip c${i + 1}`}
                    {...(live ? floatAnim(5 + (i % 2), 4.6 + i * 0.35) : {})}
                  >
                    <Icon size={12} aria-hidden />
                    {chip.label}
                  </motion.span>
                );
              })}
            </motion.div>
          </div>
        </AipReveal>
      </div>
    </div>
  );
}
