'use client';

import { useEffect, useRef, useState } from 'react';

/** Adds `.dash-inview` when element enters viewport (once). */
export function useInViewOnce<T extends HTMLElement>(rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin, threshold: 0.12 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, visible]);

  return { ref, visible };
}
