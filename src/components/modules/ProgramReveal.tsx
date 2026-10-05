'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import motion from './programMotion.module.css';

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: 'div' | 'section' | 'article';
};

/** Fade/slide-up when entering viewport — matches Center Dashboard reveal. */
export function ProgramReveal({ children, className = '', delayMs = 0, as = 'div' }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const Tag = as;

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
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  return (
    <Tag
      ref={ref as never}
      className={`${motion.reveal}${visible ? ` ${motion.revealIn}` : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
