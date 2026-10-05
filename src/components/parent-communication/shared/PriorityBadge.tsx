'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ConcernPriority } from '@/types/concern';

interface PriorityBadgeProps {
  priority: ConcernPriority;
  variant?: 'ribbon' | 'pill';
}

const priorityClass: Record<ConcernPriority, string> = {
  High: 'pc-priority-high',
  Medium: 'pc-priority-medium',
  Low: 'pc-priority-low',
};

export function PriorityBadge({ priority, variant = 'pill' }: PriorityBadgeProps) {
  return (
    <motion.span
      className={`pc-priority-badge ${priorityClass[priority]} pc-priority-${variant}`}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
    >
      {priority}
    </motion.span>
  );
}
