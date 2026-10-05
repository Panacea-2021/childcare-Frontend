'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LN_TESTIMONIALS } from './data';
import { LnReveal } from './LnReveal';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function Card({ item }: { item: (typeof LN_TESTIMONIALS)[number] }) {
  return (
    <article className={`ln-testiCard tone-${item.tone}`}>
      <span className="ln-quoteMark" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="ln-testiPerson">
        <img src={item.avatar} alt="" width={44} height={44} loading="lazy" />
        <div>
          <strong>{item.name}</strong>
          <em>{item.role}</em>
        </div>
      </div>
    </article>
  );
}

export function LnTestimonials() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const loop = [...LN_TESTIMONIALS, ...LN_TESTIMONIALS];

  return (
    <div className="ln-testimonials">
      <LnReveal className="ln-sectionHead ln-center">
        <p className="ln-eyebrow">Customer stories</p>
        <h2>Real Customers, Real Stories!</h2>
        <p>See how childcare teams reclaim time on planning, observations, and assessments.</p>
      </LnReveal>

      {reduced ? (
        <div className="ln-testiGrid">
          {LN_TESTIMONIALS.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <motion.div
          className="ln-marquee"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="ln-marqueeTrack"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
          >
            {loop.map((item, i) => (
              <Card key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
