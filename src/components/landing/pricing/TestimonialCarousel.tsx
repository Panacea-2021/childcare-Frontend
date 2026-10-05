'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PRICING_TESTIMONIALS } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

function highlightQuote(quote: string, phrases?: string[]) {
  if (!phrases?.length) return quote;
  let parts: (string | { highlight: string })[] = [quote];
  for (const phrase of phrases) {
    const next: typeof parts = [];
    for (const part of parts) {
      if (typeof part !== 'string') {
        next.push(part);
        continue;
      }
      const idx = part.toLowerCase().indexOf(phrase.toLowerCase());
      if (idx === -1) {
        next.push(part);
        continue;
      }
      if (idx > 0) next.push(part.slice(0, idx));
      next.push({ highlight: part.slice(idx, idx + phrase.length) });
      if (idx + phrase.length < part.length) next.push(part.slice(idx + phrase.length));
    }
    parts = next;
  }
  return parts;
}

export function TestimonialCarousel() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const items = PRICING_TESTIMONIALS;
  const active = items[index];

  const go = useCallback(
    (dir: -1 | 1) => {
      setIndex((i) => (i + dir + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => go(1), 5500);
    return () => window.clearInterval(id);
  }, [paused, reduced, go]);

  const rendered = highlightQuote(active.quote, active.highlightPhrases);

  return (
    <section
      className="px-testimonials"
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="px-testimonialWave" aria-hidden />
      <div className="px-wrap px-testimonialInner">
        <div className="px-ratingRow">
          <p className="px-stars" aria-label="5 out of 5 stars">
            ★★★★★
          </p>
          <span className="px-g2Mark">G2</span>
        </div>

        <div
          className="px-quoteStage"
          onTouchStart={(e) => {
            touchX.current = e.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) < 40) return;
            go(dx < 0 ? 1 : -1);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active.id}
              className="px-quote"
              initial={reduced ? false : { opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -18 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              aria-live="polite"
            >
              “
              {typeof rendered === 'string'
                ? rendered
                : rendered.map((part, i) =>
                    typeof part === 'string' ? (
                      <span key={i}>{part}</span>
                    ) : (
                      <em key={i} className="px-quoteEm">
                        {part.highlight}
                      </em>
                    ),
                  )}
              ”
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + '-person'}
            className="px-person"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.imageUrl} alt="" width={64} height={64} />
            <div>
              <strong>{active.name}</strong>
              <span>
                {active.role}, {active.company}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="px-carouselControls">
          <button
            type="button"
            className="px-carNav"
            aria-label="Previous testimonial"
            onClick={() => go(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-dots" role="tablist" aria-label="Testimonial slides">
            {items.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show testimonial ${i + 1}`}
                className={`px-dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
          <button
            type="button"
            className="px-carNav"
            aria-label="Next testimonial"
            onClick={() => go(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
