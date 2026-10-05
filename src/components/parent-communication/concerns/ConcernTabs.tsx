'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Inbox } from 'lucide-react';

export type ConcernsListView = 'active' | 'resolved';

interface ConcernTabsProps {
  view: ConcernsListView;
  activeCount: number;
  resolvedCount: number;
  onChange: (view: ConcernsListView) => void;
}

export function ConcernTabs({
  view,
  activeCount,
  resolvedCount,
  onChange,
}: ConcernTabsProps) {
  return (
    <div className="concerns-tabs" role="tablist" aria-label="Concern lists">
      <button
        type="button"
        role="tab"
        aria-selected={view === 'active'}
        className={`concerns-tab ${view === 'active' ? 'is-active' : ''}`}
        onClick={() => onChange('active')}
      >
        <Inbox size={16} aria-hidden />
        Active
        <span className="concerns-tab-count">{activeCount}</span>
        {view === 'active' ? (
          <motion.span className="concerns-tab-indicator" layoutId="concerns-tab-indicator" />
        ) : null}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === 'resolved'}
        className={`concerns-tab ${view === 'resolved' ? 'is-active' : ''}`}
        onClick={() => onChange('resolved')}
      >
        <CheckCircle2 size={16} aria-hidden />
        Resolved
        <span className="concerns-tab-count">{resolvedCount}</span>
        {view === 'resolved' ? (
          <motion.span className="concerns-tab-indicator" layoutId="concerns-tab-indicator" />
        ) : null}
      </button>
    </div>
  );
}
