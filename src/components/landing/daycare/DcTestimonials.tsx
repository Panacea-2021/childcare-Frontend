'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DC_TESTIMONIALS } from './data';
import { DcReveal } from './DcReveal';
import { fadeUp, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

type Item = (typeof DC_TESTIMONIALS)[number];

function Card({ item }: { item: Item }) {
  return (
    <article className={`dc-testiCard tone-${item.tone}`}>
      <span className="dc-quote" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="dc-testiPerson">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.avatar} alt="" width={44} height={44} loading="lazy" />
        <div>
          <strong>{item.name}</strong>
          <em>{item.role}</em>
        </div>
      </div>
    </article>
  );
}

export function DcTestimonials() {
  const { reduced } = useRevealFallback();
  const [paused, setPaused] = useState(false);
  const loop = [...DC_TESTIMONIALS, ...DC_TESTIMONIALS];

  return (
    <div className="dc-testimonials">
      <DcReveal className="dc-sectionHead dc-center">
        <h2>Real Customers, Real Stories!</h2>
        <p>Daycare teams use Panacea to run calmer days and keep families close.</p>
      </DcReveal>

      {reduced ? (
        <motion.div
          className="dc-testiSnap"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {DC_TESTIMONIALS.map((item) => (
            <motion.div key={item.id} variants={fadeUp}>
              <Card item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div
          className="dc-testiMarquee"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="dc-testiTrack"
            style={{ animationPlayState: paused ? 'paused' : 'running' }}
          >
            {loop.map((item, i) => (
              <Card key={`${item.id}-${i}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
