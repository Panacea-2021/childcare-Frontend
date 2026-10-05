'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { FileText, PencilLine, Send, Sparkles } from 'lucide-react';
import { LN_OBSERVATION_AI_POINTS } from './data';
import { LnFeatureList } from './LnFeatureList';
import { LnReveal } from './LnReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const DRAFT =
  'Ethan listened carefully during story time, then retold key events using new vocabulary. He negotiated roles with peers and sustained focus through the activity.';

export function LnObservationAi() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [writing, setWriting] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 90, damping: 20 });
  const sy = useSpring(my, { stiffness: 90, damping: 20 });

  const cardX = useTransform(sx, [0, 1], [-7, 7]);
  const cardY = useTransform(sy, [0, 1], [5, -5]);
  const cardRotY = useTransform(sx, [0, 1], [-2, 2]);
  const cardRotX = useTransform(sy, [0, 1], [1.2, -1.2]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  });
  const scrollY = useTransform(scrollYProgress, [0, 1], [14, -18]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (reduced) {
      setTyped(DRAFT);
      setDone(true);
      return;
    }
    if (!started || done) return;

    setWriting(true);
    let intervalId: number | undefined;
    const start = window.setTimeout(() => {
      setWriting(false);
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setTyped(DRAFT.slice(0, i));
        if (i >= DRAFT.length) {
          if (intervalId) window.clearInterval(intervalId);
          setDone(true);
        }
      }, 14);
    }, 650);

    return () => {
      window.clearTimeout(start);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [mounted, reduced, started, done]);

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
    <div className="ln-split ln-aiSplit">
      <LnReveal className="ln-splitCopy" variants={slideFromLeft}>
        <p className="ln-eyebrow">AI observations</p>
        <h2>Observations Made Easy with AI</h2>
        <p className="ln-support">
          Turn quick classroom notes into professional observations and personalized reports —
          without losing the educator’s voice.
        </p>
        <LnFeatureList points={LN_OBSERVATION_AI_POINTS} />
      </LnReveal>

      <LnReveal className="ln-splitVisual ln-obsAiVisual" variants={slideFromRight}>
        <div
          ref={stageRef}
          className="ln-aiStage ln-obsAiStage"
          onMouseMove={onMove}
          onMouseLeave={() => {
            mx.set(0.5);
            my.set(0.5);
          }}
        >
          <div className="ln-aiAtmosphere is-cyan" aria-hidden>
            <i className="ln-aiGlow g1" />
            <i className="ln-aiGlow g2" />
            <i className="ln-aiGlow g3" />
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className={`ln-aiDust d${i + 1}`} />
            ))}
          </div>

          <motion.div
            className="ln-obsPrompt glass"
            style={live ? { y: scrollY } : undefined}
            {...(live ? floatAnim(6, 5.1) : {})}
          >
            <FileText size={14} aria-hidden />
            <div>
              <strong>Prompt</strong>
              <p>Ethan · story time · peer collaboration</p>
            </div>
          </motion.div>

          <motion.div
            className="ln-obsDraftWrap"
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
              className="ln-obsDraft glass"
              initial={false}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              onViewportEnter={() => setStarted(true)}
              {...(live ? floatAnim(5, 6.4) : {})}
            >
              <div className="ln-obsDraftHead">
                <span className="ln-aiBadge is-cyan">
                  <Sparkles size={13} aria-hidden />
                  Observation Assistant
                </span>
                <em>AI Ready</em>
              </div>

              <label className="ln-obsInput">
                <span>Describe the moment…</span>
                <div className="ln-obsInputTools" aria-hidden>
                  <PencilLine size={14} />
                  <i className={writing ? 'is-pulse' : undefined}>
                    <Send size={13} />
                  </i>
                </div>
              </label>

              <div className="ln-obsOutput" aria-live="polite">
                {writing ? <p className="ln-obsWriting">Writing…</p> : null}
                {!writing ? (
                  <p>
                    {typed}
                    {!done ? <i className="ln-obsCursor" /> : null}
                  </p>
                ) : null}
                {done ? <em>Generated with AI</em> : null}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </LnReveal>
    </div>
  );
}
