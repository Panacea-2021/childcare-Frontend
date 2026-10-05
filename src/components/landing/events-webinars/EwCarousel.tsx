'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  children: ReactNode;
  className?: string;
  label: string;
  autoplayMs?: number;
};

export function EwCarousel({ children, className = '', label, autoplayMs = 0 }: Props) {
  const reduced = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(0);
  const [pages, setPages] = useState(1);
  const paused = useRef(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 16 : el.clientWidth;
    const count = Math.max(1, Math.round(max / step) + 1);
    setPages(count);
    const next = Math.round(el.scrollLeft / step);
    setIndex(Math.min(count - 1, Math.max(0, next)));
  }, []);

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
  }, [measure, children]);

  const scrollTo = useCallback(
    (dir: -1 | 1) => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.firstElementChild as HTMLElement | null;
      const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.85;
      el.scrollBy({ left: dir * step, behavior: reduced ? 'auto' : 'smooth' });
    },
    [reduced],
  );

  useEffect(() => {
    if (!autoplayMs || reduced) return;
    const id = window.setInterval(() => {
      if (paused.current || document.hidden) return;
      const el = trackRef.current;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
      else scrollTo(1);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, reduced, scrollTo]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollTo(-1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollTo(1);
    }
  };

  return (
    <div
      className={`ew-carousel ${className}`.trim()}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
      }}
    >
      <div
        ref={trackRef}
        className="ew-carouselTrack"
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKey}
      >
        {children}
      </div>

      {pages > 1 ? (
        <div className="ew-carouselControls">
          <button
            type="button"
            className="ew-carouselBtn"
            aria-label="Previous"
            onClick={() => scrollTo(-1)}
          >
            <ChevronLeft size={18} />
          </button>
          <div className="ew-dots" role="tablist" aria-label={`${label} pages`}>
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={`ew-dot${i === index ? ' is-active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  const el = trackRef.current;
                  if (!el) return;
                  const card = el.firstElementChild as HTMLElement | null;
                  const step = card ? card.offsetWidth + 16 : el.clientWidth;
                  el.scrollTo({ left: i * step, behavior: reduced ? 'auto' : 'smooth' });
                }}
              />
            ))}
          </div>
          <button
            type="button"
            className="ew-carouselBtn"
            aria-label="Next"
            onClick={() => scrollTo(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
