'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  tone?: 'green' | 'purple' | 'soft';
  className?: string;
  shimmer?: boolean;
};

export function AnimatedBadge({
  children,
  tone = 'green',
  className = '',
  shimmer = false,
}: Props) {
  return (
    <motion.span
      className={`slq-badge slq-badge-${tone}${shimmer ? ' slq-badge-shimmer' : ''}${className ? ` ${className}` : ''}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  );
}
