'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Flag, Share2, Target } from 'lucide-react';
import { LN_GOALS_POINTS } from './data';
import { LnFeatureList } from './LnFeatureList';
import { LnReveal } from './LnReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const RINGS = [
  { label: 'Listening', value: 82, tone: 'accent' },
  { label: 'Social', value: 68, tone: 'mint' },
  { label: 'Literacy', value: 74, tone: 'blush' },
] as const;

function ProgressRing({
  value,
  tone,
  animate,
}: {
  value: number;
  tone: string;
  animate: boolean;
}) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <svg className={`ln-ringSvg tone-${tone}`} viewBox="0 0 84 84" aria-hidden>
      <circle className="ln-ringTrack" cx="42" cy="42" r={r} />
      <motion.circle
        className="ln-ringFill"
        cx="42"
        cy="42"
        r={r}
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: animate ? offset : c }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export function LnGoals() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const ringsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ringsRef, { once: true, amount: 0.4 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const live = mounted && !reduced;
  const showRings = reduced || (mounted && inView);

  return (
    <div className="ln-split is-reverse">
      <LnReveal className="ln-splitVisual ln-goalsVisual" variants={slideFromLeft}>
        <div className="ln-goalsBlob" aria-hidden />
        <div ref={ringsRef} className="ln-goalsStage">
          <div className="ln-goalsRings">
            {RINGS.map((ring) => (
              <div key={ring.label} className="ln-goalRing">
                <ProgressRing value={ring.value} tone={ring.tone} animate={showRings} />
                <strong>{ring.value}%</strong>
                <em>{ring.label}</em>
              </div>
            ))}
          </div>

          <motion.div
            className="ln-floatCard g1 glass"
            {...(live ? floatAnim(6, 5) : {})}
          >
            <Target size={14} aria-hidden />
            <div>
              <strong>Goal set</strong>
              <p>Expand expressive vocabulary</p>
            </div>
          </motion.div>

          <motion.div
            className="ln-floatCard g2 glass"
            {...(live ? floatAnim(5, 5.6) : {})}
          >
            <Flag size={14} aria-hidden />
            <div>
              <strong>Milestone</strong>
              <p>Retells stories with sequence</p>
            </div>
          </motion.div>

          <motion.div
            className="ln-floatCard g3 glass"
            {...(live ? floatAnim(5.5, 6.1) : {})}
          >
            <Share2 size={14} aria-hidden />
            <div>
              <strong>Shared with family</strong>
              <p>Progress update · today</p>
            </div>
          </motion.div>
        </div>
      </LnReveal>

      <LnReveal className="ln-splitCopy" variants={slideFromRight}>
        <p className="ln-eyebrow">Development goals</p>
        <h2>Meet Learning Goals</h2>
        <p className="ln-support">
          Track development with clarity, set meaningful next steps, and keep families part of
          every child’s learning journey.
        </p>
        <LnFeatureList points={LN_GOALS_POINTS} />
      </LnReveal>
    </div>
  );
}
