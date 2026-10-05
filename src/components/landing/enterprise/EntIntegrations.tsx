'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ENT_INTEGRATIONS } from './data';
import { EntReveal } from './EntReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function IntegrationLogo({ label, domain }: { label: string; domain: string }) {
  const [failed, setFailed] = useState(false);
  const clearbit = `https://logo.clearbit.com/${domain}`;
  const fallback = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const src = failed ? fallback : clearbit;

  return (
    <motion.li className="ent-intCard" variants={fadeUp}>
      <span className="ent-intMark">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={36}
          height={36}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </span>
      <strong>{label}</strong>
    </motion.li>
  );
}

export function EntIntegrations() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="ent-integrations" aria-labelledby="ent-int-heading">
      <EntReveal className="ent-sectionHead ent-center">
        <h2 id="ent-int-heading">{ENT_INTEGRATIONS.title}</h2>
      </EntReveal>

      <motion.ul
        className="ent-intGrid"
        variants={staggerContainer}
        initial={reduced ? false : 'hidden'}
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
      >
        {ENT_INTEGRATIONS.items.map((item) => (
          <IntegrationLogo key={item.domain} label={item.label} domain={item.domain} />
        ))}
      </motion.ul>
    </section>
  );
}
