'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WebinarEvent } from './data';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Testimonial = NonNullable<WebinarEvent['testimonials']>[number];

type Props = {
  items: Testimonial[];
};

export function ErTestimonials({ items }: Props) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = () => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const count = Math.max(1, Math.round(max / step) + 1);
    setPages(count);
    setIndex(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  useEffect(() => {
    measure();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
    };
  }, [items]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section className="er-quotes" aria-labelledby="er-quotes-title">
      <div className="er-wrap">
        <p className="er-quotesEyebrow">Trusted by 2,500+ leaders</p>
        <h2 id="er-quotes-title">What Past Attendees Are Saying</h2>

        <div className="er-quoteCarousel">
          <div
            ref={trackRef}
            className="er-quoteTrack"
            role="region"
            aria-label="Attendee testimonials"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollByDir(-1);
              }
              if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollByDir(1);
              }
            }}
          >
            {items.map((t) => (
              <article key={t.name + t.quote.slice(0, 20)} className="er-quoteCard">
                <p className="er-stars" aria-label="5 out of 5 stars">
                  ★★★★★
                </p>
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <strong>{t.name}</strong>
                <em>
                  {t.role} · {t.location}
                </em>
                <span className="er-attended">{t.attended}</span>
              </article>
            ))}
          </div>

          {pages > 1 ? (
            <div className="er-quoteControls">
              <button
                type="button"
                className="er-quoteNav"
                aria-label="Previous testimonials"
                onClick={() => scrollByDir(-1)}
              >
                <ChevronLeft size={18} />
              </button>
              <div className="er-quoteDots" role="tablist" aria-label="Testimonial pages">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    className={`er-quoteDot${i === index ? ' is-active' : ''}`}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => {
                      const el = trackRef.current;
                      if (!el) return;
                      const card = el.firstElementChild as HTMLElement | null;
                      const step = card ? card.offsetWidth + 16 : el.clientWidth;
                      el.scrollTo({
                        left: i * step,
                        behavior: reduced ? 'auto' : 'smooth',
                      });
                    }}
                  />
                ))}
              </div>
              <button
                type="button"
                className="er-quoteNav"
                aria-label="Next testimonials"
                onClick={() => scrollByDir(1)}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
