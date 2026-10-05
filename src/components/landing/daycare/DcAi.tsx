'use client';

import { Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { DC_AI } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

export function DcAi() {
  const { reduced, animateProp } = useRevealFallback();

  return (
    <div className="dc-split dc-ai">
      <motion.div
        className="dc-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="dc-eyebrow" variants={fadeUp}>
          {DC_AI.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{DC_AI.title}</motion.h2>
        <motion.p className="dc-sectionLead" variants={fadeUp}>
          {DC_AI.lead}
        </motion.p>
        <ul className="dc-checkList">
          {DC_AI.points.map((p) => (
            <motion.li key={p.title} variants={slideFromLeft}>
              <span className="dc-check" aria-hidden>
                <Check size={14} strokeWidth={2.8} />
              </span>
              <div>
                <strong>{p.title}</strong>
                <em>{p.detail}</em>
              </div>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        className="dc-splitVisual"
        variants={slideFromRight}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="dc-aiStage" aria-hidden>
          <div className="dc-aiGlow" />
          <motion.div
            className="dc-aiCore"
            {...(reduced
              ? {}
              : {
                  animate: { scale: [1, 1.04, 1] },
                  transition: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
                })}
          >
            <Sparkles size={20} />
            <strong>AI</strong>
          </motion.div>
          {DC_AI.chips.map((chip, i) => (
            <motion.span
              key={chip}
              className={`dc-aiChip dc-aiChip--${i}`}
              {...(reduced ? {} : floatAnim(5 + (i % 3), 5.2 + i * 0.35, i * 0.25))}
            >
              {chip}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
