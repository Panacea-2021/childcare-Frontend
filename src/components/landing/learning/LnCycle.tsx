'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LN_CYCLE_STEPS } from './data';
import { LnReveal } from './LnReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const RADIUS = 118;
const CX = 160;
const CY = 160;
const CIRC = 2 * Math.PI * RADIUS;

function stepPosition(index: number, total: number) {
  const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
  return {
    x: CX + RADIUS * Math.cos(angle),
    y: CY + RADIUS * Math.sin(angle),
  };
}

export function LnCycle() {
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const activeStep = LN_CYCLE_STEPS[active] ?? LN_CYCLE_STEPS[0];

  return (
    <div id="ln-cycle" className="ln-cycle">
      <LnReveal className="ln-sectionHead ln-center">
        <p className="ln-eyebrow">Learning cycle</p>
        <h2>Streamline Your 4-Step Learning Cycle.</h2>
        <p>
          Keep families&apos; learning journey connected from plan through review — so every
          observation informs the next intentional step.
        </p>
      </LnReveal>

      <div className="ln-cycleLayout">
        <LnReveal className="ln-cycleDiagram" amount={0.35}>
          <div className="ln-cycleStage" aria-label="Four-step learning cycle">
            <svg className="ln-cycleSvg" viewBox="0 0 320 320" role="presentation">
              <circle className="ln-cycleTrack" cx={CX} cy={CY} r={RADIUS} />
              <motion.circle
                className="ln-cyclePath"
                cx={CX}
                cy={CY}
                r={RADIUS}
                strokeDasharray={CIRC}
                initial={reduced ? false : { strokeDashoffset: CIRC }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: reduced ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>

            <div className="ln-cycleCenter">
              <strong>Support every child&apos;s next steps.</strong>
            </div>

            {LN_CYCLE_STEPS.map((step, index) => {
              const pos = stepPosition(index, LN_CYCLE_STEPS.length);
              const isActive = active === index;
              return (
                <button
                  key={step.id}
                  type="button"
                  className={`ln-cycleNode${isActive ? ' is-active' : ''}`}
                  style={{ left: `${(pos.x / 320) * 100}%`, top: `${(pos.y / 320) * 100}%` }}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => setActive(index)}
                  aria-pressed={isActive}
                >
                  <span className="ln-cycleIndex">{index + 1}</span>
                  <em>{step.label}</em>
                </button>
              );
            })}
          </div>
        </LnReveal>

        <motion.div
          className="ln-cycleDetails"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {LN_CYCLE_STEPS.map((step, index) => (
            <motion.button
              key={step.id}
              type="button"
              className={`ln-cycleCard${active === index ? ' is-active' : ''}`}
              variants={fadeUp}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </div>
            </motion.button>
          ))}
          <p className="ln-cycleActiveHint" aria-live="polite">
            <strong>{activeStep.label}:</strong> {activeStep.detail}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
