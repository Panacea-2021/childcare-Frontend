'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ATTENDANCE_TESTIMONIALS } from './data';
import { AttReveal } from './AttReveal';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Testimonial = (typeof ATTENDANCE_TESTIMONIALS)[number];

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className={`att-testiCard tone-${item.tone}`}>
      <span className="att-quoteMark" aria-hidden>
        “
      </span>
      <p>{item.quote}</p>
      <div className="att-testiPerson">
        <img src={item.avatar} alt="" width={44} height={44} loading="lazy" />
        <div>
          <strong>{item.name}</strong>
          <em>{item.role}</em>
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  reverse,
  paused,
  duration,
}: {
  items: readonly Testimonial[];
  reverse?: boolean;
  paused: boolean;
  duration: number;
}) {
  const loop = [...items, ...items];

  return (
    <div className={`att-marquee ${reverse ? 'is-reverse' : ''}`}>
      <div
        className="att-marqueeTrack"
        style={{
          animationDuration: `${duration}s`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {loop.map((item, i) => (
          <TestimonialCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export function AttendanceTestimonials() {
  const reduced = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);

  const rowA = ATTENDANCE_TESTIMONIALS.filter((_, i) => i % 2 === 0);
  const rowB = ATTENDANCE_TESTIMONIALS.filter((_, i) => i % 2 === 1);

  return (
    <div className="att-testimonials">
      <AttReveal className="att-sectionHead att-center">
        <p className="att-eyebrow">Customer stories</p>
        <h2>Real customers, Real Stories</h2>
        <p>
          Centers using Panacea spend less time chasing attendance records and more time focusing on
          children.
        </p>
      </AttReveal>

      {reduced ? (
        <div className="att-testiGrid">
          {ATTENDANCE_TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <motion.div
          className="att-marqueeStack"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <MarqueeRow items={rowA} paused={paused} duration={42} />
          <MarqueeRow items={rowB} reverse paused={paused} duration={48} />
        </motion.div>
      )}
    </div>
  );
}
