'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PS_TESTIMONIALS } from './data';
import { PsReveal } from './PsReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Item = (typeof PS_TESTIMONIALS)[number];

function Card({ item }: { item: Item }) {
  return (
    <article className="ps-testiCard">
      <span className="ps-quote" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="ps-testiPerson">
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

export function PsTestimonials() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const loop = [...PS_TESTIMONIALS, ...PS_TESTIMONIALS];

  return (
    <div className="ps-testimonials">
      <PsReveal className="ps-sectionHead ps-center">
        <h2>Real Customers, Real Stories!</h2>
        <p>Preschools using Panacea grow enrollment, delight families, and give teachers time back.</p>
      </PsReveal>

      {reduced ? (
        <motion.div
          className="ps-testiSnap"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {PS_TESTIMONIALS.map((item) => (
            <motion.div key={item.id} variants={fadeUp}>
              <Card item={item} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div
          className="ps-testiMarquee"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="ps-testiTrack"
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
