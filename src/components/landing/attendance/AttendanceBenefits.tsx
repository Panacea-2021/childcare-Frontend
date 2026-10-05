'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Table2, Users } from 'lucide-react';
import { ATTENDANCE_BENEFITS } from './data';
import { AttReveal } from './AttReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = {
  manual: Users,
  forecast: Table2,
  safety: ShieldCheck,
} as const;

export function AttendanceBenefits() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="att-benefits" id="att-benefits">
      <AttReveal className="att-sectionHead att-center">
        <h2>Built for accurate days and confident directors</h2>
        <p>Less paperwork at the door. Clearer occupancy. Safer, audit-ready records.</p>
      </AttReveal>

      <motion.div
        className="att-benefitGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        {ATTENDANCE_BENEFITS.map((item) => {
          const Icon = ICONS[item.id];
          return (
            <motion.article
              key={item.id}
              className={`att-benefitCard tone-${item.id}`}
              variants={fadeUp}
              whileHover={reduced ? undefined : { y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <span className="att-benefitGlow" aria-hidden />
              <span className="att-benefitIcon" aria-hidden>
                <Icon size={22} strokeWidth={1.8} />
              </span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
