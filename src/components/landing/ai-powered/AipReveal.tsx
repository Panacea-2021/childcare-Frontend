'use client';

import { type ReactNode } from 'react';
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

export function AipReveal({
  children,
  className,
  variants = fadeUp,
  delay = 0,
  amount = 0.22,
}: Props) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
