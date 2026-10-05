'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp, fadeUpTransition } from './animations';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function AnimatedCard({ children, className = '', delay = 0 }: Props) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={fadeUp}
      transition={fadeUpTransition(delay)}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({ children, className = '', delay = 0 }: Props) {
  return (
    <AnimatedCard className={`ivd-glass ${className}`} delay={delay}>
      {children}
    </AnimatedCard>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="ivd-section-head">
      <h2>{title}</h2>
      {action}
    </div>
  );
}
