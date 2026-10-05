'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import type { PricingPlan } from './data';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import { featureItem, featureStagger } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  plan: PricingPlan;
  index: number;
};

export function PricingCard({ plan, index }: Props) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.35);
  const popular = Boolean(plan.popular);

  return (
    <div className={`px-cardShell${popular ? ' is-popular' : ''}`}>
    <motion.article
      ref={ref}
      className={`px-card${popular ? ' is-popular' : ''}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        reduced
          ? undefined
          : {
              transform: `perspective(1000px) rotateX(${Math.max(-2, Math.min(2, tilt.rx))}deg) rotateY(${Math.max(-3, Math.min(3, tilt.ry))}deg)`,
            }
      }
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {popular ? <span className="px-ribbon">MOST POPULAR</span> : null}

      <div className="px-cardGlow" aria-hidden />

      <header className="px-cardHead">
        <h3>{plan.name}</h3>
        <p>{plan.description}</p>
      </header>

      <Link href={plan.ctaHref} className="px-cardCta">
        <span>{plan.ctaLabel}</span>
        <ArrowRight size={16} aria-hidden className="px-cardCtaArrow" />
      </Link>

      <motion.ul
        className="px-featureList"
        variants={reduced ? undefined : featureStagger}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {plan.features.map((f) => (
          <motion.li key={f.label} variants={reduced ? undefined : featureItem}>
            <Check size={16} aria-hidden className="px-check" />
            <span>{f.label}</span>
          </motion.li>
        ))}
      </motion.ul>
    </motion.article>
    </div>
  );
}
