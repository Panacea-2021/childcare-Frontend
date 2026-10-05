'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { ConcernStatus } from '@/types/concern';

interface StatusBadgeProps {
  status: ConcernStatus;
  size?: 'sm' | 'md';
}

const statusClass: Record<ConcernStatus, string> = {
  Open: 'pc-status-open',
  'In Progress': 'pc-status-progress',
  Resolved: 'pc-status-resolved',
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  return (
    <motion.span
      className={`pc-status-badge ${statusClass[status]} pc-status-${size}`}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
    >
      <span className="pc-status-dot" aria-hidden />
      {status}
    </motion.span>
  );
}
