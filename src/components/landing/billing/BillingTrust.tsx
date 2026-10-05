'use client';

import { motion } from 'framer-motion';
import { Eye, FileText, BadgeDollarSign } from 'lucide-react';
import { BILLING_TRUST } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = {
  fees: Eye,
  audit: FileText,
  secure: BadgeDollarSign,
} as const;

export function BillingTrust() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="bl-trust">
      <div className="bl-trustHead">
        <h2>Trust, built into billing</h2>
        <p>
          Clear pricing, complete history, and secure payment workflows — so directors and
          families always know where money stands.
        </p>
      </div>

      <div className="bl-trustGrid">
        {BILLING_TRUST.map((item, i) => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? Eye;
          return (
            <motion.article
              key={item.id}
              className="bl-trustCard"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={reduced ? undefined : { y: -4 }}
            >
              <div className="bl-trustCardTop">
                <span className="bl-trustIcon" aria-hidden>
                  <Icon size={20} strokeWidth={1.8} />
                </span>
                <strong>{item.title}</strong>
              </div>
              <p>{item.detail}</p>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
