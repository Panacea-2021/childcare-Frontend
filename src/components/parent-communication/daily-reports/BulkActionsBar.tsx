'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Trash2 } from 'lucide-react';

type Props = {
  count: number;
  onMarkCompleted: () => void;
  onDelete: () => void;
  onClear: () => void;
};

export function BulkActionsBar({ count, onMarkCompleted, onDelete, onClear }: Props) {
  return (
    <motion.div
      className="dr-bulk"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="dr-bulk-left">
        <span>
          <strong>{count}</strong> selected
        </span>
        <button type="button" className="ui-btn ui-btn-outline" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="dr-bulk-actions">
        <button type="button" className="ui-btn ui-btn-primary" onClick={onMarkCompleted}>
          <CheckCircle2 size={15} />
          Mark Completed
        </button>
        <button type="button" className="ui-btn ui-btn-danger" onClick={onDelete}>
          <Trash2 size={15} />
          Delete
        </button>
      </div>
    </motion.div>
  );
}
