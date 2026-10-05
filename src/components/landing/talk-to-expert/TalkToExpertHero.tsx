'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import type { TtePlan } from './data';
import { TTE_HERO, TTE_PLANS } from './data';
import { useParallaxTilt } from '../enrollments/hooks/useParallaxTilt';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function PlanCard({ plan, index }: { plan: TtePlan; index: number }) {
  const reduced = usePrefersReducedMotion();
  const { ref, tilt, onMove, onLeave } = useParallaxTilt(0.35);
  const popular = Boolean(plan.popular);

  return (
    <div className={`tte-cardShell${popular ? ' is-popular' : ''}`}>
      <motion.article
        ref={ref}
        className={`tte-card${popular ? ' is-popular' : ''}`}
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        {plan.badge ? <span className="tte-ribbon">{plan.badge}</span> : null}
        <h3>{plan.name}</h3>
        <p className="tte-cardDesc">{plan.description}</p>
        <Link href={plan.ctaHref} className="tte-cardCta">
          <span>{plan.ctaLabel}</span>
          <ArrowRight size={16} aria-hidden className="tte-ctaArrow" />
        </Link>
        {plan.introNote ? <p className="tte-introNote">{plan.introNote}</p> : null}
        <div className="tte-cardFeatures">
          {plan.featureGroups.map((g) => (
            <div key={g.heading}>
              <p className="tte-groupHead">{g.heading}</p>
              <ul>
                {g.items.map((item) => (
                  <li key={item.label}>
                    <Check size={15} aria-hidden className="tte-check" />
                    <span>
                      {item.label}
                      {item.ai ? <em className="tte-aiBadge">AI</em> : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.article>
    </div>
  );
}

export function TalkToExpertHero() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="tte-hero" aria-labelledby="tte-hero-title">
      <div className="tte-heroDecor" aria-hidden>
        <span className="tte-blob tte-blob--a" />
        <span className="tte-blob tte-blob--b" />
        <span className="tte-blob tte-blob--c" />
        <span className="tte-star tte-star--1" />
        <span className="tte-star tte-star--2" />
        <span className="tte-dot tte-dot--1" />
        <span className="tte-dot tte-dot--2" />
      </div>
      <div className="tte-wrap">
        <motion.h1
          id="tte-hero-title"
          initial={reduced ? false : { opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {TTE_HERO.headline}
        </motion.h1>
        <motion.p
          className="tte-heroSub"
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {TTE_HERO.subtitle}
        </motion.p>
        <div className="tte-planGrid">
          {TTE_PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
