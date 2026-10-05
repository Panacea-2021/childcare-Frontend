'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Camera, Heart, Sparkles } from 'lucide-react';
import { ADR_AI_PHASES, ADR_STEPS } from './data';
import { AdrReveal } from './AdrReveal';
import { fadeUp, staggerContainer } from './motion';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = [Camera, Sparkles, Heart] as const;

function StepCard({
  step,
  index,
  reduced,
}: {
  step: (typeof ADR_STEPS)[number];
  index: number;
  reduced: boolean;
}) {
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.55);
  const Icon = ICONS[index] ?? Camera;
  const isAi = step.id === 'ai';
  const [phase, setPhase] = useState(0);
  const cardRef = useRef<HTMLElement>(null);
  const inView = useInView(cardRef, { once: false, amount: 0.45 });

  useEffect(() => {
    if (!isAi || reduced || !inView) return;
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % ADR_AI_PHASES.length);
    }, 1800);
    return () => window.clearInterval(id);
  }, [isAi, reduced, inView]);

  return (
    <motion.article
      ref={cardRef}
      className={`adr-stepCard adr-step-${step.id}`}
      variants={fadeUp}
      whileHover={reduced ? undefined : { y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
    >
      <div
        ref={ref}
        className="adr-stepTilt"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={
          reduced
            ? undefined
            : {
                transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translate3d(${tilt.tx}px, ${tilt.ty}px, 0)`,
              }
        }
      >
        <div className="adr-stepMedia">
          {isAi ? (
            <div className="adr-phoneMock">
              <div className="adr-phoneBezel">
                <div className="adr-phoneNotch" aria-hidden />
                <div className="adr-phoneScreen">
                  <div className="adr-aiDetect">
                    <img
                      src={step.image}
                      alt=""
                      width={280}
                      height={180}
                      loading="lazy"
                    />
                    <span className="adr-aiScan" aria-hidden />
                    <span className="adr-aiBox a" aria-hidden />
                    <span className="adr-aiBox b" aria-hidden />
                  </div>
                  <div className="adr-aiReport">
                    <span
                      className={`adr-aiPhase is-${phase === 0 ? 'analyzing' : phase === 1 ? 'generating' : 'ready'}`}
                    >
                      <Sparkles size={12} aria-hidden />
                      {ADR_AI_PHASES[phase]}
                    </span>
                    <p>
                      Emma explored the sensory table with focus, shared blocks with
                      friends, and settled calmly for rest time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={step.image}
              alt={step.alt}
              width={420}
              height={320}
              loading="lazy"
            />
          )}
        </div>
      </div>

      <div className="adr-stepCopy">
        <span className="adr-stepBadge glass">
          <Icon size={14} aria-hidden />
          {step.badge}
        </span>
        <h3>{step.title}</h3>
      </div>
    </motion.article>
  );
}

export function AdrSteps() {
  const reduced = usePrefersReducedMotion();
  const pathRef = useRef<SVGPathElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.25 });

  useEffect(() => {
    const path = pathRef.current;
    if (!path || reduced) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = inView ? '0' : `${length}`;
  }, [inView, reduced]);

  return (
    <div className="adr-steps" ref={sectionRef}>
      <AdrReveal className="adr-sectionHead adr-center">
        <h2>Three steps. Zero stress.</h2>
        <p>Snap photos. AI writes the report. Parents smile.</p>
      </AdrReveal>

      <div className="adr-stepsTrack">
        <svg
          className="adr-stepsConnector"
          viewBox="0 0 1000 80"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            ref={pathRef}
            d="M40 48 C 220 8, 320 72, 500 40 S 780 8, 960 48"
            fill="none"
            stroke="url(#adr-connector-grad)"
            strokeWidth="3"
            strokeLinecap="round"
            className={inView && !reduced ? 'is-drawn' : ''}
          />
          <defs>
            <linearGradient id="adr-connector-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f0abfc" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </svg>

        <motion.div
          className="adr-stepsGrid"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {ADR_STEPS.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} reduced={reduced} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
