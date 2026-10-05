'use client';

import { memo } from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TaskFilters } from '@/lib/tasks/types';
import { STAFF } from '@/lib/tasks/mockData';
import { btnMotion } from './animations';

const TOOLBAR_STATUSES = ['In Progress', 'Completed', 'Cancelled'] as const;

type Props = {
  filters: TaskFilters;
  onChange: (patch: Partial<TaskFilters>) => void;
  onCreate: () => void;
};

export const TaskToolbar = memo(function TaskToolbar({ filters, onChange, onCreate }: Props) {
  return (
    <motion.div
      className="tm-toolbar is-simple"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="tm-toolbar-row tm-toolbar-row-simple">
        <div className="ui-field tm-filter">
          <label className="ui-label" htmlFor="tm-filter-assigned-to">
            Assigned To
          </label>
          <select
            id="tm-filter-assigned-to"
            className="ui-select"
            value={filters.assignedTo}
            onChange={(e) => onChange({ assignedTo: e.target.value })}
          >
            <option value="">All</option>
            {STAFF.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ui-field tm-filter">
          <label className="ui-label" htmlFor="tm-filter-status">
            Status
          </label>
          <select
            id="tm-filter-status"
            className="ui-select"
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="">All</option>
            {TOOLBAR_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="tm-toolbar-actions">
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary tm-create-btn"
            onClick={onCreate}
            {...btnMotion}
          >
            <Plus size={17} aria-hidden />
            Create Task
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
});
