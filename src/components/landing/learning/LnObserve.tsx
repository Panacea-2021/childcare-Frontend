'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Camera, Mic, Star } from 'lucide-react';
import { LN_OBSERVE_POINTS } from './data';
import { LnFeatureList } from './LnFeatureList';
import { LnReveal } from './LnReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function LnObserve() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 100, damping: 20 });
  const sy = useSpring(my, { stiffness: 100, damping: 20 });
  const rotY = useTransform(sx, [0, 1], [-4, 3]);
  const rotX = useTransform(sy, [0, 1], [3, -2]);
  const floatX = useTransform(sx, [0, 1], [-8, 10]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;

  const onMove = (e: MouseEvent) => {
    if (!live) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  return (
    <div className="ln-split">
      <LnReveal className="ln-splitCopy" variants={slideFromLeft}>
        <p className="ln-eyebrow">On-the-go documentation</p>
        <h2>Observe, Record On The Go</h2>
        <p className="ln-support">
          Capture authentic learning moments where they happen — then turn them into clear
          documentation without leaving the room.
        </p>
        <LnFeatureList points={LN_OBSERVE_POINTS} />
      </LnReveal>

      <LnReveal className="ln-splitVisual ln-observeVisual" variants={slideFromRight}>
        <div className="ln-observeBlob" aria-hidden />
        <div ref={ref} className="ln-observeStage" onMouseMove={onMove} onMouseLeave={() => {
          mx.set(0.5);
          my.set(0.5);
        }}>
          <motion.div
            className="ln-observeMain glass"
            style={
              live
                ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1100 }
                : undefined
            }
            {...(live ? floatAnim(7, 6) : {})}
          >
            <img
              src="/images/parent-communication/activity.jpg"
              alt=""
              loading="lazy"
            />
            <div className="ln-observeMainMeta">
              <strong>Outdoor discovery</strong>
              <em>Captured · 10:24 AM</em>
            </div>
          </motion.div>

          <motion.div
            className="ln-floatCard o1 glass"
            style={live ? { x: floatX } : undefined}
            {...(live ? floatAnim(6, 4.8) : {})}
          >
            <Star size={14} aria-hidden />
            <div>
              <strong>Milestone</strong>
              <p>Shared confidently in group play</p>
            </div>
          </motion.div>

          <motion.div
            className="ln-floatCard o2 glass"
            {...(live ? floatAnim(5, 5.5) : {})}
          >
            <Mic size={14} aria-hidden />
            <div>
              <strong>Voice note</strong>
              <p>Transcribed observation ready</p>
            </div>
          </motion.div>

          <motion.div
            className="ln-floatCard o3 glass"
            {...(live ? floatAnim(5.5, 5.9) : {})}
          >
            <Camera size={14} aria-hidden />
            <div>
              <strong>Lesson link</strong>
              <p>Mapped to listening goals</p>
            </div>
          </motion.div>
        </div>
      </LnReveal>
    </div>
  );
}
