'use client';

import { Receipt, ShieldCheck, Workflow } from 'lucide-react';
import { motion } from 'framer-motion';
import { DC_MEET } from './data';
import { DcReveal } from './DcReveal';
import { fadeUp, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

const ICONS = {
  ops: Workflow,
  billing: Receipt,
  safety: ShieldCheck,
} as const;

export function DcMeet() {
  const { reduced, animateProp } = useRevealFallback();

  return (
    <div className="dc-meet">
      <DcReveal className="dc-sectionHead dc-center">
        <h2>{DC_MEET.title}</h2>
        <p>{DC_MEET.lead}</p>
      </DcReveal>

      <motion.div
        className="dc-meetGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        {DC_MEET.cards.map((card) => {
          const Icon = ICONS[card.icon];
          return (
            <motion.article key={card.id} className="dc-meetCard" variants={fadeUp}>
              <span className="dc-meetIcon" aria-hidden>
                <i />
                <Icon size={22} strokeWidth={1.85} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
