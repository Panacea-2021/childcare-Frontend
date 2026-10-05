'use client';

import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

const VIDEO_POSTER =
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1400&q=80';

export function BillingStoryBand() {
  const reduced = usePrefersReducedMotion();

  return (
    <section className="bl-storyBand" aria-labelledby="bl-story-title">
      <div className="bl-storyPattern" aria-hidden="true" />
      <motion.div
        className="bl-storyInner"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45 }}
      >
        <h2 id="bl-story-title">
          Childcare networks collect faster when billing runs on Panacea.
        </h2>
        <p>
          Directors replace chase-and-check workflows with automated invoices, subsidy
          tracking, and clear parent payments — so cash flow stays predictable.
        </p>

        <div className="bl-storyVideo">
          <div
            className="bl-storyVideoMedia"
            style={{ backgroundImage: `url(${VIDEO_POSTER})` }}
            role="img"
            aria-label="Sample billing success story video"
          >
            <div className="bl-storyVideoShade" />
            <button type="button" className="bl-storyWatch" aria-label="Watch sample video">
              <span className="bl-storyWatchIcon" aria-hidden>
                <Play size={16} fill="currentColor" />
              </span>
              <span>Watch video</span>
              <em>01:02</em>
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
