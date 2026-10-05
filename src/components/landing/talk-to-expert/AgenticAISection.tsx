'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TTE_AI, TTE_AI_PRODUCTS } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function AgenticAISection() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const items = TTE_AI_PRODUCTS;

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

  return (
    <section
      className="tte-ai"
      aria-labelledby="tte-ai-title"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="tte-wrap">
        <div className="tte-aiHead">
          <h2 id="tte-ai-title">{TTE_AI.title}</h2>
          <Link href={TTE_AI.ctaHref} className="tte-aiCta">
            {TTE_AI.ctaLabel}
          </Link>
        </div>

        <div
          className="tte-aiCarousel"
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
          <div className="tte-aiTrack">
            {items.map((item, i) => {
              const offset = (i - index + items.length) % items.length;
              const visual =
                offset === 0 ? 'is-center' : offset === 1 || offset === items.length - 1 ? 'is-side' : 'is-far';
              return (
                <article
                  key={item.id}
                  className={`tte-aiCard ${visual}`}
                  aria-hidden={offset !== 0}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt="" width={480} height={300} loading="lazy" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={items[index].id}
              className="tte-aiMobileCard"
              initial={reduced ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -16 }}
              transition={{ duration: 0.4 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={items[index].imageUrl}
                alt=""
                width={640}
                height={400}
                loading="lazy"
              />
              <h3>{items[index].title}</h3>
              <p>{items[index].description}</p>
            </motion.div>
          </AnimatePresence>

          <div className="tte-aiControls">
            <button type="button" className="tte-aiNav" aria-label="Previous" onClick={() => go(-1)}>
              <ChevronLeft size={18} />
            </button>
            <div className="tte-aiDots">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show ${item.title}`}
                  className={`tte-aiDot${i === index ? ' is-active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <button type="button" className="tte-aiNav" aria-label="Next" onClick={() => go(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
