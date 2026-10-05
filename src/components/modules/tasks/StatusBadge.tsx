'use client';

import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TaskStatus } from '@/lib/tasks/types';
import { STATUS_COLORS } from '@/lib/tasks/mockData';
import { badgeMotion } from './animations';

type Props = {
  status: TaskStatus;
  interactive?: boolean;
  onClick?: () => void;
};

export const StatusBadge = memo(function StatusBadge({ status, interactive, onClick }: Props) {
  const colors = STATUS_COLORS[status];
  const content = (
    <motion.span
      key={status}
      className="tm-badge"
      style={{ background: colors.bg, color: colors.fg, borderColor: `${colors.fg}22` }}
      {...badgeMotion}
    >
      {status}
    </motion.span>
  );

  if (interactive) {
    return (
      <button type="button" className="tm-status-btn" onClick={onClick} aria-label={`Status: ${status}`}>
        <AnimatePresence mode="wait" initial={false}>
          {content}
        </AnimatePresence>
      </button>
    );
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {content}
    </AnimatePresence>
  );
});
