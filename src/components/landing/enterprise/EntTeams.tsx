'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BadgeDollarSign,
  ClipboardList,
  Megaphone,
  Settings2,
} from 'lucide-react';
import { ENT_TEAMS } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = {
  finance: BadgeDollarSign,
  operations: Settings2,
  marketing: Megaphone,
  admissions: ClipboardList,
} as const;

export function EntTeams() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="ent-teams" aria-labelledby="ent-teams-heading">
      <EntReveal className="ent-teamsHead">
        <h2 id="ent-teams-heading">{ENT_TEAMS.title}</h2>
        <Link href={ENT_TEAMS.ctaHref} className="ent-btnDark">
          {ENT_TEAMS.ctaLabel}
        </Link>
      </EntReveal>

      <motion.div
        className="ent-teamsGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {ENT_TEAMS.cards.map((card) => {
          const Icon = ICONS[card.id];
          return (
            <motion.article key={card.id} className="ent-floatCard ent-teamCard" variants={fadeUp}>
              <span className="ent-teamIcon" aria-hidden>
                <Icon size={18} strokeWidth={2.2} />
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
