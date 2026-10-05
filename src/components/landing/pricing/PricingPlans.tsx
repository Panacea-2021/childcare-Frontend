'use client';

import { motion } from 'framer-motion';
import { PRICING_PLANS } from './data';
import { PricingCard } from './PricingCard';
import { staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function PricingPlans() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="px-plans" aria-label="Pricing plans">
      <div className="px-wrap">
        <motion.div
          className="px-planGrid"
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.12 }}
        >
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
