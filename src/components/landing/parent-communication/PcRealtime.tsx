'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Bell, Image as ImageIcon } from 'lucide-react';
import { PC_REALTIME_POINTS } from './data';
import { PcFeatureList } from './PcFeatureList';
import { PcReveal } from './PcReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PcRealtime() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 100, damping: 20 });
  const sy = useSpring(my, { stiffness: 100, damping: 20 });
  const rotY = useTransform(sx, [0, 1], [-4, 2]);
  const rotX = useTransform(sy, [0, 1], [3, -1]);

  return (
    <div id="pc-realtime" className="pc-split">
      <PcReveal className="pc-splitCopy" variants={slideFromLeft}>
        <p className="pc-eyebrow">Real-time communication</p>
        <h2>Instant Communication, No Missed Messages</h2>
        <p className="pc-support">
          Keep parents informed with timely updates, meaningful moments, and important information
          delivered directly to them.
        </p>
        <PcFeatureList points={PC_REALTIME_POINTS} />
      </PcReveal>

      <PcReveal className="pc-splitVisual pc-commVisual" variants={slideFromRight}>
        <div className="pc-commBlob" aria-hidden />
        <div
          ref={ref}
          className="pc-commStage"
          onMouseMove={(e) => {
            if (reduced) return;
            const el = ref.current;
            if (!el) return;
            const r = el.getBoundingClientRect();
            mx.set((e.clientX - r.left) / r.width);
            my.set((e.clientY - r.top) / r.height);
          }}
          onMouseLeave={() => {
            mx.set(0.5);
            my.set(0.5);
          }}
        >
          <motion.div
            className="pc-dashCard"
            style={reduced ? undefined : { rotateX: rotX, rotateY: rotY, transformPerspective: 1100 }}
            {...(reduced ? {} : floatAnim(7, 6))}
          >
            <div className="pc-dashHead">
              <div className="pc-dashHeadLeft">
                <img src="/images/parent-communication/classroom.jpg" alt="" loading="lazy" />
                <div>
                  <strong>Today&apos;s updates</strong>
                  <em>Emma · Room B</em>
                </div>
              </div>
            </div>
            <div className="pc-dashFeed">
              <div className="pc-dashPhoto">
                <img src="/images/parent-communication/learning.jpg" alt="" loading="lazy" />
                <em>Story time · 11:15 AM</em>
              </div>
              <div>
                <strong>9:42 AM</strong>
                <span>Outdoor play</span>
              </div>
              <div>
                <strong>12:30 PM</strong>
                <span>Lunch finished</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="pc-overlayCard o1 glass" {...(reduced ? {} : floatAnim(6, 4.8))}>
            <strong>New message</strong>
            <p>“Emma enjoyed today’s activity!”</p>
            <em>— Ms. Sarah</em>
          </motion.div>

          <motion.div className="pc-overlayCard o2 glass" {...(reduced ? {} : floatAnim(5, 5.4))}>
            <ImageIcon size={14} aria-hidden />
            <div>
              <strong>Today&apos;s highlights</strong>
              <p>3 updates · 2 photos · 1 learning moment</p>
            </div>
          </motion.div>

          <motion.div className="pc-overlayCard o3 glass" {...(reduced ? {} : floatAnim(5, 5.9))}>
            <Bell size={14} aria-hidden />
            <div>
              <strong>New update</strong>
              <p>Incident report shared</p>
            </div>
          </motion.div>
        </div>
      </PcReveal>
    </div>
  );
}
