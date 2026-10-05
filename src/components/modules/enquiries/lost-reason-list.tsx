'use client';

import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { LostReason } from '@/lib/enquiries/types';

type Props = {
  reasons: LostReason[];
  onEdit: (reason: LostReason) => void;
  onDelete: (reason: LostReason) => void;
  onReorder: (from: number, to: number) => void;
  onToggle: (reason: LostReason) => void;
};

export const LostReasonList = memo(function LostReasonList({
  reasons,
  onEdit,
  onDelete,
  onReorder,
  onToggle,
}: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    (index: number) => {
      if (dragIndex === null || dragIndex === index) {
        setDragIndex(null);
        return;
      }
      onReorder(dragIndex, index);
      setDragIndex(null);
    },
    [dragIndex, onReorder],
  );

  if (!reasons.length) {
    return (
      <div className="enq-empty-panel">
        No lost reasons yet. Add reasons that appear when an enquiry is marked Lost.
      </div>
    );
  }

  return (
    <div className="enq-lost-list">
      {reasons.map((reason, index) => (
        <motion.div
          key={reason.id}
          className={`enq-lost-row${!reason.active ? ' is-inactive' : ''}${dragIndex === index ? ' is-dragging' : ''}`}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03 }}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(index)}
        >
          <span className="enq-sub-handle" aria-hidden title="Drag to reorder">
            <GripVertical size={16} />
          </span>
          <div className="enq-lost-row-body">
            <strong>{reason.name}</strong>
            {reason.description ? <p>{reason.description}</p> : null}
          </div>
          <label className="enq-stage-toggle">
            <input
              type="checkbox"
              checked={reason.active}
              onChange={() => onToggle(reason)}
            />
            <span>{reason.active ? 'Active' : 'Off'}</span>
          </label>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => onEdit(reason)}
            aria-label={`Edit ${reason.name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-danger"
            onClick={() => onDelete(reason)}
            aria-label={`Delete ${reason.name}`}
          >
            <Trash2 size={14} />
          </button>
        </motion.div>
      ))}
    </div>
  );
});
