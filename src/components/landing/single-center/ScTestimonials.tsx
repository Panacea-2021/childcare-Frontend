'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SC_TESTIMONIALS } from './data';
import { ScReveal } from './ScReveal';
import { fadeUp, staggerContainer } from './motion';
import { useRevealFallback } from './useRevealFallback';

type Item = (typeof SC_TESTIMONIALS)[number];

function Card({ item }: { item: Item }) {
  return (
    <article className={`sc-testiCard tone-${item.tone}`}>
      <span className="sc-quote" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="sc-testiPerson">
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

export function ScTestimonials() {
  const { reduced } = useRevealFallback();
  const [paused, setPaused] = useState(false);
  const loop = [...SC_TESTIMONIALS, ...SC_TESTIMONIALS];

  return (
    <div className="sc-testimonials">
      <ScReveal className="sc-sectionHead sc-center">
        <h2>Real Customers, Real Stories!</h2>
        <p>Single-center owners use Panacea to simplify operations and keep families close.</p>
      </ScReveal>

      {reduced ? (
        <motion.div
          className="sc-testiSnap"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {SC_TESTIMONIALS.map((item) => (
            <motion.div key={item.id} variants={fadeUp}>
              <Card item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div
          className="sc-testiMarquee"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="sc-testiTrack"
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
