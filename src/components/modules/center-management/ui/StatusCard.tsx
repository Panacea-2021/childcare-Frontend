'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  label: string;
  count: number;
  icon: ReactNode;
  tone: string;
  active?: boolean;
  onClick?: () => void;
  index?: number;
};

export function StatusCard({ label, count, icon, tone, active, onClick, index = 0 }: Props) {
  return (
    <motion.button
      type="button"
      className={`cm-status-card tone-${tone}${active ? ' is-active' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={`cm-status-icon ${tone}`} aria-hidden>
        {icon}
      </span>
      <span className="cm-status-copy">
        <span className="cm-status-label">{label}</span>
        <strong className="cm-status-count">{count}</strong>
      </span>
      <span className="cm-status-glow" aria-hidden />
    </motion.button>
  );
}
