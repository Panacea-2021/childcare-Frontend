'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, RefreshCw, FilterX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  onRefresh: () => void;
  onClearFilters: () => void;
  theme?: 'notes' | 'concerns';
}

export function EmptyState({
  title,
  description,
  onRefresh,
  onClearFilters,
  theme = 'notes',
}: EmptyStateProps) {
  return (
    <motion.section
      className={`pc-empty pc-empty-${theme}`}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      aria-label={title}
    >
      <div className="pc-empty-graphic" aria-hidden>
        <div className="pc-empty-glow" />
        <div className="pc-empty-core">
          <Inbox size={44} strokeWidth={1.5} />
        </div>
      </div>
      <h2 className="pc-empty-title">{title}</h2>
      <p className="pc-empty-desc">{description}</p>
      <div className="pc-empty-actions">
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClearFilters}>
          <FilterX size={16} />
          Clear Filters
        </button>
        <button type="button" className="ui-btn ui-btn-primary" onClick={onRefresh}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </motion.section>
  );
}
