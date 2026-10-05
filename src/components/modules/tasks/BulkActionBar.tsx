'use client';

import { memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Download, Tag, Trash2, Zap } from 'lucide-react';
import { PRIORITIES } from '@/lib/tasks/mockData';
import type { TaskPriority } from '@/lib/tasks/types';
import { fadeUp } from './animations';

type Props = {
  count: number;
  labels: { id: string; name: string }[];
  onComplete: () => void;
  onDelete: () => void;
  onExport: () => void;
  onAssignLabel: (label: string) => void;
  onChangePriority: (priority: TaskPriority) => void;
};

export const BulkActionBar = memo(function BulkActionBar({
  count,
  labels,
  onComplete,
  onDelete,
  onExport,
  onAssignLabel,
  onChangePriority,
}: Props) {
  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div className="tm-bulk-bar" {...fadeUp}>
          <strong>{count} selected</strong>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onComplete}>
            <CheckCircle2 size={14} /> Mark Complete
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onExport}>
            <Download size={14} /> Export
          </button>
          <label className="ui-btn ui-btn-outline" style={{ display: 'inline-flex', gap: 6 }}>
            <Tag size={14} />
            Assign Label
            <select
              aria-label="Assign label"
              style={{
                border: 0,
                background: 'transparent',
                color: 'inherit',
                font: 'inherit',
                maxWidth: 120,
              }}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onAssignLabel(e.target.value);
                e.target.value = '';
              }}
            >
              <option value="" disabled>
                Choose…
              </option>
              {labels.map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name}
                </option>
              ))}
            </select>
          </label>
          <label className="ui-btn ui-btn-outline" style={{ display: 'inline-flex', gap: 6 }}>
            <Zap size={14} />
            Priority
            <select
              aria-label="Change priority"
              style={{
                border: 0,
                background: 'transparent',
                color: 'inherit',
                font: 'inherit',
                maxWidth: 110,
              }}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) onChangePriority(e.target.value as TaskPriority);
                e.target.value = '';
              }}
            >
              <option value="" disabled>
                Choose…
              </option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
});
