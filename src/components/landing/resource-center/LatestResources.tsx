'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  getResourcePage,
  getResourcePageCount,
  RESOURCE_CENTER_ITEMS,
} from './data';
import { ResourceCard } from './ResourceCard';
import { RcReveal } from './RcReveal';
import { staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function LatestResources() {
  const reduced = usePrefersReducedMotion();
  const pageCount = getResourcePageCount();
  const [page, setPage] = useState(1);
  const items = useMemo(() => getResourcePage(page), [page]);

  return (
    <section className="rc-latest">
      <div className="rc-wrap">
        <RcReveal>
          <h2 className="rc-sectionTitle">Latest Resources</h2>
        </RcReveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="rc-grid"
            variants={staggerContainer}
            initial={reduced ? false : 'hidden'}
            animate="show"
            exit={reduced ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {items.map((item) => (
              <ResourceCard key={item.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>

        <nav className="rc-pagination" aria-label="Resource pages">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`rc-pageBtn${page === n ? ' is-active' : ''}`}
              onClick={() => setPage(n)}
              aria-current={page === n ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="rc-nextBtn"
            disabled={page >= pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          >
            Next
          </button>
        </nav>

        <p className="rc-countHint">
          Showing {(page - 1) * 6 + 1}–
          {Math.min(page * 6, RESOURCE_CENTER_ITEMS.length)} of {RESOURCE_CENTER_ITEMS.length}
        </p>
      </div>
    </section>
  );
}
