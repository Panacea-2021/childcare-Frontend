'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { Check, Languages, PencilLine, Utensils } from 'lucide-react';
import { AIP_ENGAGE_POINTS } from './data';
import { AipReveal } from './AipReveal';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AipFeatureEngage() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });

  const cardRotY = useTransform(sx, [0, 1], [-3, 3]);
  const cardRotX = useTransform(sy, [0, 1], [2, -2]);
  const chipX = useTransform(sx, [0, 1], [-8, 12]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], [14, -14]);

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
      <div className="aip-featureSplit">
        <AipReveal className="aip-featureVisual" variants={slideFromLeft}>
          <div
            ref={stageRef}
            className="aip-engageStage"
            onMouseMove={onMove}
            onMouseLeave={() => {
              mx.set(0.5);
              my.set(0.5);
            }}
          >
            <motion.div
              className="aip-phone"
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
              {...(live ? floatAnim(5, 5.6) : {})}
            >
              <div className="aip-phoneNotch" aria-hidden />
              <div className="aip-phoneHead">
                <strong>Parent feed</strong>
                <em>Emma · Room B</em>
              </div>
              <article className="aip-feedCard">
                <div className="aip-feedMeta">
                  <span className="aip-feedIcon" aria-hidden>
                    <Utensils size={14} />
                  </span>
                  <div>
                    <strong>Lunch update</strong>
                    <em>Today · 12:18 PM</em>
                  </div>
                </div>
                <img
                  className="aip-feedPhoto"
                  src="/images/parent-communication/activity.jpg"
                  alt=""
                  width={220}
                  height={110}
                  loading="lazy"
                />
                <p>
                  Emma enjoyed pasta and steamed carrots. She tried a new veggie and asked
                  for seconds!
                </p>
                <div className="aip-feedActions">
                  <span>
                    <PencilLine size={12} aria-hidden />
                    Rewrite
                  </span>
                  <span>
                    <Languages size={12} aria-hidden />
                    Translate
                  </span>
                </div>
              </article>
            </motion.div>

            <motion.div className="aip-engageChips" style={live ? { x: chipX } : undefined}>
              <motion.span
                className="aip-chip c1"
                {...(live ? floatAnim(5, 4.8) : {})}
              >
                Warm tone
              </motion.span>
              <motion.span
                className="aip-chip c2"
                {...(live ? floatAnim(6, 5.4) : {})}
              >
                ES · Translate
              </motion.span>
            </motion.div>
          </div>
        </AipReveal>

        <AipReveal className="aip-featureCopy" variants={slideFromRight}>
          <h2>Enhance Parent Engagement with AI-Powered Writing</h2>
          <motion.ul
            className="aip-pointList"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            {AIP_ENGAGE_POINTS.map((point) => (
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
      </div>
    </div>
  );
}
