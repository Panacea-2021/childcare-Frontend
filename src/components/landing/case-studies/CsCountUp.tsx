'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function CsCountUp({ value, suffix = '', duration = 1400, className }: Props) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(reduced ? value : 0);
  const played = useRef(false);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || played.current) return;
        played.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.45 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [duration, reduced, value]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix}
    </span>
  );
}
