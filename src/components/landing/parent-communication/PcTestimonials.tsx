'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PC_TESTIMONIALS } from './data';
import { PcReveal } from './PcReveal';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function Card({
  item,
}: {
  item: (typeof PC_TESTIMONIALS)[number];
}) {
  return (
    <article className={`pc-testiCard tone-${item.tone}`}>
      <span className="pc-quoteMark" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="pc-testiPerson">
        <img src={item.avatar} alt="" width={44} height={44} loading="lazy" />
        <div>
          <strong>{item.name}</strong>
          <em>{item.role}</em>
        </div>
      </div>
    </article>
  );
}

export function PcTestimonials() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const loop = [...PC_TESTIMONIALS, ...PC_TESTIMONIALS];

  return (
    <div className="pc-testimonials">
      <PcReveal className="pc-sectionHead pc-center">
        <p className="pc-eyebrow">Customer stories</p>
        <h2>Real Customers, Real Stories</h2>
        <p>See how stronger communication helps childcare teams and families stay connected.</p>
      </PcReveal>

      {reduced ? (
        <div className="pc-testiGrid">
          {PC_TESTIMONIALS.map((item) => (
            <Card key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <motion.div
          className="pc-marquee"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="pc-marqueeTrack"
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
