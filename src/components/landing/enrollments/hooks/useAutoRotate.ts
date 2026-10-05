'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export function useAutoRotate<T extends { id: string; duration: number }>(
  items: T[],
  {
    paused,
    initialId,
  }: {
    paused: boolean;
    initialId?: string;
  },
) {
  const [activeId, setActiveId] = useState(initialId ?? items[0]?.id ?? '');
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(performance.now());
  const activeRef = useRef(activeId);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  const select = useCallback((id: string) => {
    setActiveId(id);
    setProgress(0);
    startedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (paused || items.length === 0) return;
    let raf = 0;
    const loop = (now: number) => {
      const current = items.find((i) => i.id === activeRef.current) ?? items[0];
      if (!current) return;
      const elapsed = now - startedAt.current;
      const pct = Math.min(1, elapsed / current.duration);
      setProgress(pct);
      if (pct >= 1) {
        const idx = items.findIndex((i) => i.id === current.id);
        const next = items[(idx + 1) % items.length];
        if (next) {
          activeRef.current = next.id;
          setActiveId(next.id);
          setProgress(0);
          startedAt.current = now;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [items, paused]);

  useEffect(() => {
    startedAt.current = performance.now();
    setProgress(0);
  }, [activeId]);

  return { activeId, progress, select };
}
