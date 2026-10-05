'use client';

import { Building2, MessageCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { SC_DISCOVER } from './data';
import { ScReveal } from './ScReveal';
import { fadeUp, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

const ICONS = {
  building: Building2,
  chat: MessageCircle,
  shield: ShieldCheck,
} as const;

export function ScDiscover() {
  const { reduced, animateProp } = useRevealFallback();

  return (
    <div className="sc-discover">
      <ScReveal className="sc-sectionHead sc-center">
        <h2>{SC_DISCOVER.title}</h2>
        <p>{SC_DISCOVER.lead}</p>
      </ScReveal>

      <motion.div
        className="sc-discoverGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        animate={animateProp}
        whileInView="show"
        viewport={{ once: true, amount: 0.2, margin: '0px 0px -8% 0px' }}
      >
        {SC_DISCOVER.cards.map((card) => {
          const Icon = ICONS[card.icon];
          return (
            <motion.article key={card.id} className="sc-discoverCard" variants={fadeUp}>
              <span className="sc-discoverIcon" aria-hidden>
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
