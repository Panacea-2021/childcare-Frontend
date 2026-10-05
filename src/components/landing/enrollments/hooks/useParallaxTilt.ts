'use client';

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { usePrefersReducedMotion } from '../../hero/usePrefersReducedMotion';

type Tilt = { rx: number; ry: number; tx: number; ty: number };

export function useParallaxTilt(strength = 1) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef<Tilt>({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const [tilt, setTilt] = useState<Tilt>({ rx: 0, ry: 0, tx: 0, ty: 0 });
  const raf = useRef<number | null>(null);

  const animate = useCallback(() => {
    setTilt((prev) => {
      const next = {
        rx: prev.rx + (target.current.rx - prev.rx) * 0.12,
        ry: prev.ry + (target.current.ry - prev.ry) * 0.12,
        tx: prev.tx + (target.current.tx - prev.tx) * 0.12,
        ty: prev.ty + (target.current.ty - prev.ty) * 0.12,
      };
      const settled =
        Math.abs(next.rx - target.current.rx) < 0.01 &&
        Math.abs(next.ry - target.current.ry) < 0.01;
      if (!settled) raf.current = requestAnimationFrame(animate);
      else raf.current = null;
      return next;
    });
  }, []);

  const onMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (reduced || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      target.current = {
        rx: py * -6 * strength,
        ry: px * 8 * strength,
        tx: px * 10 * strength,
        ty: py * 8 * strength,
      };
      if (raf.current == null) raf.current = requestAnimationFrame(animate);
    },
    [animate, reduced, strength],
  );

  const onLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
    if (raf.current == null) raf.current = requestAnimationFrame(animate);
  }, [animate]);

  useEffect(() => () => {
    if (raf.current != null) cancelAnimationFrame(raf.current);
  }, []);

  return { ref, tilt, onMove, onLeave, reduced };
}
