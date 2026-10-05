'use client';

import { motion } from 'framer-motion';
import type { ReportStatus } from '@/types/dailyReport';
import { statusClass, statusLabel } from './utils';

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <motion.span
      className={statusClass(status)}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      {statusLabel(status)}
    </motion.span>
  );
}
