'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { AIP_STATS } from './data';
import { AipReveal } from './AipReveal';
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
    const frames = 48;
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
    <span className="aip-statValue">
      {prefix}
      {n}
      {suffix}
    </span>
  );
}

export function AipStats() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <div className="aip-stats" ref={ref}>
      <AipReveal className="aip-sectionHead aip-center">
        <h2>Unlock the AI Advantage</h2>
      </AipReveal>

      <motion.div
        className="aip-statsGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {AIP_STATS.map((stat) => (
          <motion.article key={stat.label} className="aip-statCard" variants={fadeUp}>
            <CountUp
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              active={inView}
              reduced={reduced}
            />
            <p>{stat.label}</p>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
