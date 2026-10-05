'use client';

import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Database,
  Lock,
  ScrollText,
  Settings2,
  ShieldCheck,
} from 'lucide-react';
import { ENT_SECURITY } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = {
  soc2: ShieldCheck,
  privacy: Lock,
  audit: ScrollText,
  rai: BrainCircuit,
  data: Database,
  ops: Settings2,
} as const;

export function EntSecurity() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="ent-security" aria-labelledby="ent-security-heading">
      <EntReveal className="ent-sectionHead ent-center">
        <h2 id="ent-security-heading">{ENT_SECURITY.title}</h2>
      </EntReveal>

      <motion.div
        className="ent-securityGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {ENT_SECURITY.cards.map((card) => {
          const Icon = ICONS[card.id];
          return (
            <motion.article
              key={card.id}
              className="ent-floatCard ent-securityCard"
              variants={fadeUp}
            >
              <span className="ent-securityIcon" aria-hidden>
                <Icon size={20} />
              </span>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </motion.article>
          );
        })}
      </motion.div>
    </section>
  );
}
