'use client';

import { memo } from 'react';
import { Columns3, List } from 'lucide-react';
import { motion } from 'framer-motion';
import type { EnquiryViewMode } from '../types';
import { btnTransition } from '../animations';

type Props = {
  mode: EnquiryViewMode;
  onModeChange: (mode: EnquiryViewMode) => void;
  total?: number;
  filtered?: number;
  showMeta?: boolean;
  showToggle?: boolean;
};

export const BoardHeader = memo(function BoardHeader({
  mode,
  onModeChange,
  total = 0,
  filtered = 0,
  showMeta = true,
  showToggle = true,
}: Props) {
  if (!showMeta && !showToggle) return null;

  return (
    <div className={`enq-view-bar${showMeta && !showToggle ? ' is-meta-only' : ''}${!showMeta ? ' is-compact' : ''}`}>
      {showMeta ? (
        <div className="enq-view-meta">
          Showing <strong>{filtered}</strong> of <strong>{total}</strong> enquiries
        </div>
      ) : null}
      {showToggle ? (
        <div className="enq-view-toggle" role="tablist" aria-label="Enquiry view mode">
          <motion.button
            type="button"
            role="tab"
            aria-selected={mode === 'list'}
            className={`enq-view-btn${mode === 'list' ? ' is-active' : ''}`}
            onClick={() => onModeChange('list')}
            whileHover={{ y: mode === 'list' ? 0 : -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === 'list' ? (
              <motion.span
                className="enq-view-btn-bg"
                layoutId="enq-view-active"
                transition={btnTransition}
              />
            ) : null}
            <span className="enq-view-btn-label">
              <List size={15} aria-hidden />
              List
            </span>
          </motion.button>
          <motion.button
            type="button"
            role="tab"
            aria-selected={mode === 'board'}
            className={`enq-view-btn${mode === 'board' ? ' is-active' : ''}`}
            onClick={() => onModeChange('board')}
            whileHover={{ y: mode === 'board' ? 0 : -1 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === 'board' ? (
              <motion.span
                className="enq-view-btn-bg"
                layoutId="enq-view-active"
                transition={btnTransition}
              />
            ) : null}
            <span className="enq-view-btn-label">
              <Columns3 size={15} aria-hidden />
              Board
            </span>
          </motion.button>
        </div>
      ) : null}
    </div>
  );
});

/** Compact view toggle for the main toolbar (no meta line). */
export const ViewModeToggle = memo(function ViewModeToggle({
  mode,
  onModeChange,
}: {
  mode: EnquiryViewMode;
  onModeChange: (mode: EnquiryViewMode) => void;
}) {
  return (
    <BoardHeader
      mode={mode}
      onModeChange={onModeChange}
      showMeta={false}
      showToggle
    />
  );
});
