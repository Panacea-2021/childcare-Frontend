'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { fadeUp } from './motion';
import { usePrefersReducedMotion } from '../hero/usePrefersReducedMotion';

type Props = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  delay?: number;
  amount?: number;
};

/**
 * Scroll reveal that never leaves content permanently invisible.
 * If IntersectionObserver fails (overflow / browser quirks), we force-show.
 */
export function PsReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  amount = 0.18,
}: Props) {
  const reduced = usePrefersReducedMotion();
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const t = window.setTimeout(() => setForceShow(true), 1800);
    return () => window.clearTimeout(t);
  }, [reduced]);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      animate={forceShow ? 'show' : undefined}
      whileInView="show"
      viewport={{ once: true, amount, margin: '0px 0px -8% 0px' }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
