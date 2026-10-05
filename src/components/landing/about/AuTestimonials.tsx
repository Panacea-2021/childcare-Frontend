'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AU_TESTIMONIALS } from './data';
import { AuReveal } from './AuReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Item = (typeof AU_TESTIMONIALS)[number];

function Card({ item }: { item: Item }) {
  return (
    <article className="au-testiCard">
      <span className="au-quote" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="au-testiPerson">
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

export function AuTestimonials() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const loop = [...AU_TESTIMONIALS, ...AU_TESTIMONIALS];

  return (
    <div className="au-testimonials">
      <AuReveal className="au-sectionHead au-center">
        <h2>What Our Customers Say</h2>
        <p>Centers using Panacea grow enrollment, delight families, and give teachers time back.</p>
      </AuReveal>

      {reduced ? (
        <motion.div
          className="au-testiSnap"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {AU_TESTIMONIALS.map((item) => (
            <motion.div key={item.id} variants={fadeUp}>
              <Card item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div
          className="au-testiMarquee"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="au-testiTrack"
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
