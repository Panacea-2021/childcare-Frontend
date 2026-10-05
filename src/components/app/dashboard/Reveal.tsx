'use client';

import type { ReactNode } from 'react';
import { useInViewOnce } from './useInViewOnce';

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: 'div' | 'section' | 'article';
};

export function Reveal({ children, className = '', delayMs = 0, as = 'div' }: Props) {
  const { ref, visible } = useInViewOnce<HTMLDivElement>();
  const Tag = as;

  return (
    <Tag
      ref={ref as never}
      className={`dash-revealBlock${visible ? ' dash-inview' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  );
}
