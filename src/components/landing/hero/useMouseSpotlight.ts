'use client';

import { useCallback, useRef, useState, type MouseEvent, type RefObject } from 'react';

type Point = { x: number; y: number };

export function useMouseSpotlight() {
  const ref = useRef<HTMLElement | null>(null);
  const raf = useRef<number | null>(null);
  const target = useRef<Point>({ x: 50, y: 40 });
  const [point, setPoint] = useState<Point>({ x: 50, y: 40 });

  const onMove = useCallback((e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    target.current = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
    if (raf.current != null) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = null;
      setPoint({ ...target.current });
    });
  }, []);

  const onLeave = useCallback(() => {
    target.current = { x: 50, y: 40 };
    setPoint({ x: 50, y: 40 });
  }, []);

  return { ref: ref as RefObject<HTMLElement>, point, onMove, onLeave };
}
