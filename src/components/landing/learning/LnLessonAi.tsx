'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { BookOpen, Layers, Sparkles, Wand2 } from 'lucide-react';
import { LN_LESSON_AI_POINTS } from './data';
import { LnFeatureList } from './LnFeatureList';
import { LnReveal } from './LnReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const CHIPS = [
  { label: 'Align to EYFS', Icon: Layers },
  { label: 'Add extensions', Icon: Wand2 },
  { label: 'Suggest materials', Icon: BookOpen },
] as const;

export function LnLessonAi() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });

  const cardX = useTransform(sx, [0, 1], [-8, 8]);
  const cardY = useTransform(sy, [0, 1], [6, -6]);
  const cardRotY = useTransform(sx, [0, 1], [-2.5, 2]);
  const cardRotX = useTransform(sy, [0, 1], [1.5, -1.5]);
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
    <div className="ln-split is-reverse ln-aiSplit">
      <LnReveal className="ln-splitVisual ln-lessonVisual" variants={slideFromLeft}>
        <div
          ref={stageRef}
          className="ln-aiStage ln-lessonStage"
          onMouseMove={onMove}
          onMouseLeave={() => {
            mx.set(0.5);
            my.set(0.5);
          }}
        >
          <div className="ln-aiAtmosphere is-lavender" aria-hidden>
            <i className="ln-aiGlow g1" />
            <i className="ln-aiGlow g2" />
            <i className="ln-aiGlow g3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`ln-aiDust d${i + 1}`} />
            ))}
          </div>

          <motion.div
            className="ln-lessonCardWrap"
            style={
              live
                ? {
                    x: cardX,
                    y: cardY,
                    rotateX: cardRotX,
                    rotateY: cardRotY,
                    transformPerspective: 1200,
                  }
                : undefined
            }
          >
            <motion.div
              className="ln-lessonCard glass"
              style={live ? { y: scrollY } : undefined}
              {...(live ? floatAnim(5, 6.2) : {})}
            >
              <div className="ln-lessonCardHead">
                <span className="ln-aiBadge">
                  <Sparkles size={13} aria-hidden />
                  Lesson Planning AI
                </span>
                <em>Draft ready</em>
              </div>
              <h3>Listening Gardens</h3>
              <p>
                A sensory storytelling activity that builds attentive listening and expressive
                language through outdoor sound walks and group reflection.
              </p>
              <ul>
                <li>
                  <strong>Goal</strong>
                  <span>Communication &amp; Language</span>
                </li>
                <li>
                  <strong>Framework</strong>
                  <span>EYFS · Listening</span>
                </li>
                <li>
                  <strong>Materials</strong>
                  <span>Story stones, clipboards</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div className="ln-aiChips" style={live ? { x: chipX } : undefined}>
            {CHIPS.map((chip, i) => {
              const Icon = chip.Icon;
              return (
                <motion.span
                  key={chip.label}
                  className={`ln-aiChip c${i + 1}`}
                  {...(live ? floatAnim(5 + (i % 2), 4.6 + i * 0.4) : {})}
                  whileHover={live ? { y: -4, scale: 1.04 } : undefined}
                >
                  <Icon size={12} aria-hidden />
                  {chip.label}
                </motion.span>
              );
            })}
          </motion.div>
        </div>
      </LnReveal>

      <LnReveal className="ln-splitCopy" variants={slideFromRight}>
        <p className="ln-eyebrow">AI-powered planning</p>
        <h2>Smarter Lesson Planning with AI</h2>
        <p className="ln-support">
          Generate thoughtful lesson drafts, stay framework-aligned, and unlock resource ideas —
          then refine everything with your professional judgment.
        </p>
        <LnFeatureList points={LN_LESSON_AI_POINTS} />
      </LnReveal>
    </div>
  );
}
