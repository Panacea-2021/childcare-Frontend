'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  Languages,
  Minimize2,
  Paperclip,
  PencilLine,
  Send,
  Smile,
  Sparkles,
} from 'lucide-react';
import { PC_AI_POINTS } from './data';
import { PcFeatureList } from './PcFeatureList';
import { PcReveal } from './PcReveal';
import { floatAnim, slideFromLeft, slideFromRight } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const AI_TEXT =
  'Emma had a wonderful day today. She participated in outdoor play, enjoyed story time, and worked enthusiastically with her classmates.';

const CHIPS = [
  { label: 'Write in a friendly tone', Icon: Smile, float: 4.5 },
  { label: 'Shorten the message', Icon: Minimize2, float: 5.2 },
  { label: 'Make it more professional', Icon: Sparkles, float: 4.8 },
  { label: 'Expand the text', Icon: PencilLine, float: 6 },
] as const;

function useSum(a: MotionValue<number>, b: MotionValue<number>) {
  return useTransform([a, b], ([av, bv]) => Number(av) + Number(bv));
}

export function PcAi() {
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

  const cardX = useTransform(sx, [0, 1], [-8, 8]);
  const cardY = useTransform(sy, [0, 1], [6, -6]);
  const cardRotY = useTransform(sx, [0, 1], [-2.5, 1]);
  const cardRotX = useTransform(sy, [0, 1], [1.5, -1]);
  const translateParallaxX = useTransform(sx, [0, 1], [10, -14]);
  const translateParallaxY = useTransform(sy, [0, 1], [-8, 10]);
  const chipX = useTransform(sx, [0, 1], [-12, 18]);
  const chipY = useTransform(sy, [0, 1], [10, -14]);
  const glowX = useTransform(sx, [0, 1], [-16, 16]);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start end', 'end start'],
  });
  const scrollCard = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const scrollTranslate = useTransform(scrollYProgress, [0, 1], [28, -28]);
  const scrollChips = useTransform(scrollYProgress, [0, 1], [12, -22]);
  const scrollGlow = useTransform(scrollYProgress, [0, 1], [20, -30]);
  const scrollRing = useTransform(scrollYProgress, [0, 1], [10, -16]);

  const cardYCombined = useSum(cardY, scrollCard);
  const translateYCombined = useSum(translateParallaxY, scrollTranslate);
  const chipYCombined = useSum(chipY, scrollChips);

  const live = mounted && !reduced;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (reduced) {
      setTyped(AI_TEXT);
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
        setTyped(AI_TEXT.slice(0, i));
        if (i >= AI_TEXT.length) {
          if (intervalId) window.clearInterval(intervalId);
          setDone(true);
        }
      }, 16);
    }, 700);

    return () => {
      window.clearTimeout(start);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [mounted, reduced, started, done]);

  return (
    <div className="pc-split is-reverse pc-aiSplit">
      <PcReveal className="pc-splitVisual pc-aiVisual" variants={slideFromLeft}>
        <div
          ref={stageRef}
          className="pc-aiStage"
          onMouseMove={(e) => {
            if (!live) return;
            const el = stageRef.current;
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
          <div className="pc-aiAtmosphere" aria-hidden>
            <motion.i
              className="pc-aiAtmosGlow g1"
              style={live ? { x: glowX, y: scrollGlow } : undefined}
            />
            <motion.i
              className="pc-aiAtmosGlow g2"
              style={live ? { y: scrollRing } : undefined}
            />
            <motion.i className="pc-aiAtmosGlow g3" />
            <motion.i className="pc-aiAtmosGlow g4" />
            <i className="pc-aiBeam" />
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={i} className={`pc-aiDust d${i + 1}`} />
            ))}
          </div>

          <motion.div
            className="pc-aiCore"
            aria-hidden
            style={live ? { y: scrollRing } : undefined}
          >
            <i className="pc-aiRing r1" />
            <i className="pc-aiRing r2" />
            <i className="pc-aiRing r3" />
            <i className="pc-aiGlow" />
          </motion.div>

          <motion.div
            className="pc-aiTranslateCard"
            style={
              live
                ? { x: translateParallaxX, y: translateYCombined }
                : undefined
            }
            initial={false}
            whileHover={live ? { y: -4, rotateZ: 0 } : undefined}
          >
            <motion.div {...(live ? floatAnim(7, 5.2) : {})}>
              <div className="pc-aiTranslateHead">
                <Languages size={14} aria-hidden />
                Translate
              </div>
              <div className="pc-aiTranslateBox">Hello, Alex.</div>
              <div className="pc-aiTranslateLang">
                <em>Spanish</em>
                <span aria-hidden>▾</span>
              </div>
              <div className="pc-aiTranslateBox is-out">Hola, Alex.</div>
            </motion.div>
          </motion.div>

          <motion.div
            className="pc-aiCardWrap"
            style={
              live
                ? {
                    x: cardX,
                    y: cardYCombined,
                    rotateX: cardRotX,
                    rotateY: cardRotY,
                    transformPerspective: 1200,
                  }
                : undefined
            }
            whileHover={live ? { scale: 1.01 } : undefined}
          >
            <motion.div
              className="pc-aiCard"
              initial={false}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.35 }}
              onViewportEnter={() => setStarted(true)}
              {...(live ? floatAnim(5, 6.4) : {})}
            >
              <div className="pc-aiCardHead">
                <div className="pc-aiBadge">
                  <Sparkles size={13} className="pc-aiSpark" aria-hidden />
                  AI Communication Assistant
                  <span className="pc-aiSparkle s1" aria-hidden />
                  <span className="pc-aiSparkle s2" aria-hidden />
                  <span className="pc-aiSparkle s3" aria-hidden />
                </div>
                <em className="pc-aiReady">AI Ready</em>
              </div>

              <label className="pc-aiInput">
                <span>Write today&apos;s update…</span>
                <div className="pc-aiInputTools" aria-hidden>
                  <Languages size={14} />
                  <Smile size={14} />
                  <Paperclip size={14} />
                  <i className={writing ? 'is-pulse' : undefined}>
                    <Send size={13} />
                  </i>
                </div>
              </label>

              <motion.div
                className="pc-aiOutput"
                aria-live="polite"
                initial={false}
                animate={
                  started
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0.45, y: 8, filter: 'blur(2px)' }
                }
                transition={{ duration: 0.55 }}
              >
                {writing ? <p className="pc-aiWriting">Writing…</p> : null}
                {!writing ? (
                  <p>
                    {typed}
                    {!done ? <i className="pc-aiCursor" /> : null}
                  </p>
                ) : null}
                {done ? <em>Generated with AI</em> : null}
              </motion.div>

              <div className="pc-aiActions">
                <span className="is-primary">
                  <Sparkles size={12} aria-hidden /> Generate
                </span>
                <span>Improve</span>
                <span>Translate</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="pc-aiChips"
            style={live ? { x: chipX, y: chipYCombined } : undefined}
          >
            {CHIPS.map((chip, i) => {
              const Icon = chip.Icon;
              return (
                <motion.span
                  key={chip.label}
                  className={`pc-aiChip c${i + 1}`}
                  initial={false}
                  {...(live ? floatAnim(6 + (i % 2), chip.float) : {})}
                  whileHover={live ? { y: -4, scale: 1.04 } : undefined}
                >
                  <Icon size={12} aria-hidden />
                  {chip.label}
                </motion.span>
              );
            })}
          </motion.div>
        </div>
      </PcReveal>

      <PcReveal className="pc-splitCopy" variants={slideFromRight}>
        <p className="pc-eyebrow">AI-powered</p>
        <h2>AI-Powered Communication</h2>
        <p className="pc-support">
          Make every message easier with intelligent summaries, faster updates, and meaningful
          parent communication.
        </p>
        <PcFeatureList points={PC_AI_POINTS} />
      </PcReveal>
    </div>
  );
}
