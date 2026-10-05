'use client';

import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TaskPriority } from '@/lib/tasks/types';
import { PRIORITY_COLORS } from '@/lib/tasks/mockData';
import { badgeMotion } from './animations';

export const PriorityBadge = memo(function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const colors = PRIORITY_COLORS[priority];
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={priority}
        className="tm-badge"
        style={{ background: colors.bg, color: colors.fg, borderColor: `${colors.fg}22` }}
        {...badgeMotion}
      >
        {priority}
      </motion.span>
    </AnimatePresence>
  );
});
