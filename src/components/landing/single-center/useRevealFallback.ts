'use client';

import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

export function useRevealFallback(ms = 1600) {
  const reduced = usePrefersReducedMotion();
  const [forceShow, setForceShow] = useState(reduced);

  useEffect(() => {
    if (reduced) {
      setForceShow(true);
      return;
    }
    const t = window.setTimeout(() => setForceShow(true), ms);
    return () => window.clearTimeout(t);
  }, [reduced, ms]);

  return { reduced, forceShow, animateProp: forceShow ? ('show' as const) : undefined };
}
