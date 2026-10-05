'use client';

import { GraduationCap, Smile, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { PS_ASPECTS } from './data';
import { PsReveal } from './PsReveal';
import { fadeUp, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

const ICONS = {
  cap: GraduationCap,
  smile: Smile,
  users: Users,
} as const;

export function PsAspects() {
  const { reduced, animateProp } = useRevealFallback();

  return (
    <div className="ps-aspects">
      <PsReveal className="ps-sectionHead ps-center">
        <h2>{PS_ASPECTS.title}</h2>
        <p>{PS_ASPECTS.lead}</p>
      </PsReveal>

      <motion.div
        className="ps-aspectGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        {PS_ASPECTS.cards.map((card) => {
          const Icon = ICONS[card.icon];
          return (
            <motion.article key={card.id} className="ps-aspectCard" variants={fadeUp}>
              <span className="ps-aspectIcon" aria-hidden>
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
