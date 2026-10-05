'use client';

import { motion } from 'framer-motion';
import { ClipboardList, Plus, FileText } from 'lucide-react';

type Props = {
  variant?: 'students' | 'reports' | 'checklist';
  onAction?: () => void;
  actionLabel?: string;
};

const COPY = {
  students: {
    title: 'No Rooms Found',
    desc: 'Try another room filter or clear the search to view daily reports.',
  },
  reports: {
    title: 'No Reports Yet',
    desc: 'Generate a daily report to start tracking room activities for today.',
  },
  checklist: {
    title: 'No Checklist Configured',
    desc: 'Enable checklist items so staff can record meals, naps, and activities.',
  },
};

export function EmptyState({
  variant = 'reports',
  onAction,
  actionLabel = 'Generate Daily Report',
}: Props) {
  const copy = COPY[variant];

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="dr-empty"
      aria-label={copy.title}
    >
      <div className="dr-empty-graphic">
        <motion.div
          animate={{ y: [-6, 6, -6], rotate: [0, 8, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="dr-floating-icon"
          style={{ top: '-8px', right: '-12px' }}
        >
          <FileText size={20} />
        </motion.div>
        <div className="dr-empty-core">
          <ClipboardList size={48} strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="dr-empty-title">{copy.title}</h2>
      <p className="dr-empty-desc">{copy.desc}</p>
      {onAction ? (
        <motion.button
          type="button"
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="dr-btn-primary"
        >
          <Plus size={18} strokeWidth={2.5} />
          {actionLabel}
        </motion.button>
      ) : null}
    </motion.section>
  );
}
