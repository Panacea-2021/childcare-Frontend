'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Building2, LayoutDashboard, Smartphone, Sparkles } from 'lucide-react';
import { TTE_ADDONS, TTE_ADDONS_CTA } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const ICONS = [LayoutDashboard, Building2, Sparkles, Smartphone] as const;

export function AddOnsSection() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="tte-addons" aria-labelledby="tte-addons-title">
      <div className="tte-wrap">
        <div className="tte-addonsHead">
          <h2 id="tte-addons-title">{TTE_ADDONS_CTA.title}</h2>
          <Link href={TTE_ADDONS_CTA.ctaHref} className="tte-addonsCta">
            {TTE_ADDONS_CTA.ctaLabel}
          </Link>
        </div>
        <div className="tte-addonGrid">
          {TTE_ADDONS.map((addon, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.article
                key={addon.id}
                className="tte-addonCard"
                initial={reduced ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <span className="tte-addonIcon" aria-hidden>
                  <Icon size={22} />
                </span>
                <h3>{addon.title}</h3>
                <p>{addon.description}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
