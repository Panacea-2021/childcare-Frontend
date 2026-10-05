'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ProductGuideShell } from './ProductGuideShell';
import { PgHero } from './PgHero';
import { GuideGrid } from './GuideCard';
import { getProductGuides } from './service';
import type { ProductGuide } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';
import { pgFadeUp } from './motion';

export function ProductGuideHome() {
  const [guides, setGuides] = useState<ProductGuide[] | null>(null);
  const [error, setError] = useState(false);
  const reduced = usePrefersReducedMotion();

  const load = () => {
    setError(false);
    setGuides(null);
    getProductGuides()
      .then(setGuides)
      .catch(() => setError(true));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ProductGuideShell>
      <PgHero />
      <main className="pg-main">
        <motion.div
          className="pg-section-label"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span>Browse collections</span>
          <span className="pg-section-line" aria-hidden />
        </motion.div>

        {error ? (
          <div className="pg-error">
            <h2>We couldn&apos;t load Product Guides</h2>
            <p>Something went wrong. Please try again.</p>
            <div className="pg-error-actions">
              <button type="button" className="pg-btn pg-btn-primary" onClick={load}>
                Try Again
              </button>
            </div>
          </div>
        ) : guides === null ? (
          <div className="pg-grid" aria-busy aria-label="Loading guides">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pg-skeleton-card" />
            ))}
          </div>
        ) : (
          <motion.div variants={pgFadeUp} initial={reduced ? false : 'hidden'} animate="show">
            <GuideGrid guides={guides} />
          </motion.div>
        )}
      </main>
    </ProductGuideShell>
  );
}
