'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import type { TaskTab } from '@/lib/tasks/types';

type Props = {
  active: TaskTab;
  onChange: (tab: TaskTab) => void;
  showAll: boolean;
};

export const TaskTabs = memo(function TaskTabs({ active, onChange, showAll }: Props) {
  return (
    <div className="tm-tabs" role="tablist" aria-label="Task views">
      <button
        type="button"
        role="tab"
        aria-selected={active === 'mine'}
        className={`tm-tab${active === 'mine' ? ' is-active' : ''}`}
        onClick={() => onChange('mine')}
      >
        {active === 'mine' ? <motion.span className="tm-tab-pill" layoutId="tm-tab-pill" /> : null}
        My Tasks
      </button>
      {showAll ? (
        <button
          type="button"
          role="tab"
          aria-selected={active === 'all'}
          className={`tm-tab${active === 'all' ? ' is-active' : ''}`}
          onClick={() => onChange('all')}
        >
          {active === 'all' ? <motion.span className="tm-tab-pill" layoutId="tm-tab-pill" /> : null}
          All Tasks
        </button>
      ) : null}
    </div>
  );
});
