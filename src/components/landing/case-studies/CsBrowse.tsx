'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CASE_STUDIES } from './data';
import { CaseStudyCard } from './CaseStudyCard';
import { CsReveal } from './CsReveal';
import { fadeUp, staggerContainer } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const PAGE_SIZE = 6;

export function CsBrowse() {
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(PAGE_SIZE);
  const list = CASE_STUDIES.slice(0, visible);
  const hasMore = visible < CASE_STUDIES.length;

  if (CASE_STUDIES.length === 0) {
    return (
      <section className="cs-browse" aria-labelledby="cs-browse-title">
        <div className="cs-wrap">
          <div className="cs-empty">
            <h2 id="cs-browse-title">No case studies available yet.</h2>
            <p>Check back soon for stories from centers growing with Panacea.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cs-browse" aria-labelledby="cs-browse-title">
      <div className="cs-wrap">
        <CsReveal className="cs-browseHead">
          <h2 id="cs-browse-title">Browse all Case Studies</h2>
          <p>Explore how centers worldwide run clearer operations with Panacea.</p>
        </CsReveal>

        <motion.div
          className="cs-grid"
          variants={staggerContainer}
          initial={reduced ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
        >
          {list.map((study, i) => (
            <motion.div key={study.id} variants={fadeUp} custom={i}>
              <CaseStudyCard study={study} priority={i < 3} />
            </motion.div>
          ))}
        </motion.div>

        {hasMore ? (
          <div className="cs-loadMoreWrap">
            <button
              type="button"
              className="ui-btn ui-btn-outline cs-loadMore"
              onClick={() => setVisible((v) => Math.min(v + 3, CASE_STUDIES.length))}
            >
              Load more
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
