'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

export function useCountUp(
  end: number,
  active: boolean,
  duration = 1600,
  decimals = 0,
) {
  const reduced = usePrefersReducedMotion();
  // Always start at the final value so UI never looks "empty"/broken
  const [value, setValue] = useState(end);

  useEffect(() => {
    if (!active) {
      setValue(end);
      return;
    }
    if (reduced) {
      setValue(end);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    setValue(0);

    const tick = (now: number) => {
      if (start == null) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Number((eased * end).toFixed(decimals)));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setValue(end);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration, end, decimals, reduced]);

  return value;
}
