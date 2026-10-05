'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ADR_STATS } from './data';
import { AdrReveal } from './AdrReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function CountUp({
  value,
  prefix,
  suffix,
  active,
  reduced,
}: {
  value: number;
  prefix: string;
  suffix: string;
  active: boolean;
  reduced: boolean;
}) {
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setN(value);
      return;
    }
    let frame = 0;
    const frames = 52;
    const tick = () => {
      frame += 1;
      const t = Math.min(1, frame / frames);
      const eased = 1 - (1 - t) ** 3;
      setN(Math.round(value * eased));
      if (frame < frames) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [active, reduced, value]);

  return (
    <span className="adr-statNum">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

export function AdrStats() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });

  return (
    <div className="adr-stats" ref={ref}>
      <AdrReveal className="adr-sectionHead adr-center">
        <p className="adr-eyebrow adr-eyebrowDark">JOIN THE FUTURE</p>
        <h2>Hundreds of educators already said &apos;yes.&apos;</h2>
      </AdrReveal>

      <motion.div
        className="adr-statsGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {ADR_STATS.map((stat) => (
          <motion.article key={stat.label} className="adr-statCard glass" variants={fadeUp}>
            <CountUp
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              active={inView}
              reduced={reduced}
            />
            <strong className="adr-statUnit">{stat.unit}</strong>
            <p>{stat.label}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
