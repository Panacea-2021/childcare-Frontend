'use client';

import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { WebinarEvent } from './data';

type Props = {
  event: WebinarEvent;
};

export function ErStickyCta({ event }: Props) {
  const [show, setShow] = useState(false);
  const active =
    event.registration.enabled &&
    (event.status === 'UPCOMING' || event.status === 'LIVE');

  useEffect(() => {
    if (!active) return;
    const onScroll = () => {
      const reg = document.getElementById('er-register');
      if (!reg) {
        setShow(window.scrollY > 420);
        return;
      }
      const rect = reg.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 80;
      setShow(window.scrollY > 380 && !inView);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [active]);

  if (!active || !show) return null;

  return (
    <a href="#er-register" className="er-stickyCta">
      Reserve My Free Spot
      <ArrowRight size={15} aria-hidden />
    </a>
  );
}
