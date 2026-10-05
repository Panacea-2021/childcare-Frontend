'use client';

import { Check, Pencil, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PS_AI } from './data';
import { fadeUp, floatAnim, slideFromLeft, slideFromRight, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

export function PsAi() {
  const { reduced, animateProp } = useRevealFallback();

  return (
    <div className="ps-split ps-ai is-reverse">
      <motion.div
        className="ps-splitVisual"
        variants={slideFromLeft}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        <div className="ps-aiStage" aria-hidden>
          <div className="ps-aiGlow" />
          <motion.div
            className="ps-aiCore"
            {...(reduced
              ? {}
              : {
                  animate: { scale: [1, 1.04, 1] },
                  transition: { duration: 4.8, repeat: Infinity, ease: 'easeInOut' },
                })}
          >
            <Sparkles size={22} strokeWidth={2} />
            <strong>AI</strong>
            <Pencil size={16} strokeWidth={2.2} />
          </motion.div>

          {PS_AI.chips.map((chip, i) => (
            <motion.span
              key={chip}
              className={`ps-aiChip ps-aiChip--${i}`}
              {...(reduced ? {} : floatAnim(6 + (i % 3), 5.2 + i * 0.35, i * 0.25))}
            >
              {chip}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="ps-splitCopy"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      >
        <motion.p className="ps-eyebrow" variants={fadeUp}>
          {PS_AI.eyebrow}
        </motion.p>
        <motion.h2 variants={fadeUp}>{PS_AI.title}</motion.h2>
        <motion.p className="ps-sectionLead" variants={fadeUp}>
          {PS_AI.lead}
        </motion.p>
        <ul className="ps-checkList">
          {PS_AI.points.map((p) => (
            <motion.li key={p.title} variants={slideFromRight}>
              <span className="ps-check is-accent" aria-hidden>
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
    </div>
  );
}
