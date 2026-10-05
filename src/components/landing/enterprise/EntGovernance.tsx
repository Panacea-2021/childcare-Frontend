'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  Percent,
  ShieldCheck,
} from 'lucide-react';
import { ENT_GOVERNANCE } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, floatAnim, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type MockRow =
  | { kind: 'badge'; icon: 'shield' | 'percent' | 'bell' | 'check'; label: string; status: string }
  | { kind: 'toggle'; label: string; on: boolean };

function MockIcon({ name }: { name: 'shield' | 'percent' | 'bell' | 'check' }) {
  const props = { size: 13, strokeWidth: 2.4 } as const;
  if (name === 'shield') return <ShieldCheck {...props} />;
  if (name === 'percent') return <Percent {...props} />;
  if (name === 'bell') return <Bell {...props} />;
  return <Check {...props} />;
}

function StaticMock({ rows }: { rows: readonly MockRow[] }) {
  return (
    <div className="ent-govVisual" aria-hidden>
      <div className="ent-govMock">
        {rows.map((row) =>
          row.kind === 'toggle' ? (
            <div key={row.label} className="ent-govMockRow">
              <span className="ent-govMockLabel">{row.label}</span>
              <span className={`ent-govFakeToggle${row.on ? ' is-on' : ''}`}>
                <em />
              </span>
            </div>
          ) : (
            <div key={row.label} className="ent-govMockRow">
              <span className="ent-govMockIcon">
                <MockIcon name={row.icon} />
              </span>
              <span className="ent-govMockLabel">{row.label}</span>
              <span className="ent-govMockBadge">{row.status}</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export function EntGovernance() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="ent-governance" aria-labelledby="ent-gov-heading">
      <EntReveal className="ent-sectionHead ent-center">
        <h2 id="ent-gov-heading">{ENT_GOVERNANCE.title}</h2>
      </EntReveal>

      <motion.div
        className="ent-govGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {ENT_GOVERNANCE.cards.map((card, i) => (
          <motion.div key={card.id} variants={fadeUp}>
            <motion.article
              className="ent-floatCard ent-govCard"
              {...(reduced ? {} : floatAnim(4 + i * 1.1, 5.6 + i * 0.3))}
            >
              <StaticMock rows={card.mock} />
              <div className="ent-govCopy">
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </motion.article>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
