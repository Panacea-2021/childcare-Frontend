'use client';

import { motion } from 'framer-motion';
import { Award, ShieldCheck } from 'lucide-react';
import { TRUST_BADGES } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function TrustBadges() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="px-trust" aria-label="Trust and security badges">
      <div className="px-wrap">
        <ul className="px-trustRow">
          {TRUST_BADGES.map((b, i) => (
            <motion.li
              key={b.id}
              className="px-trustBadge"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <span className="px-trustIcon" aria-hidden>
                {b.sublabel === 'G2' ? <Award size={22} /> : <ShieldCheck size={22} />}
              </span>
              <span className="px-trustCopy">
                <strong>{b.label}</strong>
                <em>{b.sublabel}</em>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
