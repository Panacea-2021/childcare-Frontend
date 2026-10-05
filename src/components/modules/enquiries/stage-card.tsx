'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Lock, Pencil, Settings2, Trash2 } from 'lucide-react';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { getStageIcon } from './stage-icon';
import { cardHover } from './animations';

type Props = {
  stage: EnquiryStageConfig;
  index: number;
  dragIndex: number | null;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  onEdit: (stage: EnquiryStageConfig) => void;
  onDelete: (stage: EnquiryStageConfig) => void;
  onConfigureLost?: (stage: EnquiryStageConfig) => void;
  onToggleActive: (stage: EnquiryStageConfig) => void;
};

export const StageCard = memo(function StageCard({
  stage,
  index,
  dragIndex,
  onDragStart,
  onDrop,
  onEdit,
  onDelete,
  onConfigureLost,
  onToggleActive,
}: Props) {
  const Icon = getStageIcon(stage.icon);
  const isLost = stage.name.toLowerCase() === 'lost';
  const dragging = dragIndex === index;

  return (
    <motion.article
      className={`enq-stage-card${dragging ? ' is-dragging' : ''}${!stage.active ? ' is-inactive' : ''}`}
      style={{
        ['--stage-color' as string]: stage.color,
      }}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      whileHover={cardHover}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
    >
      <div className="enq-stage-card-accent" aria-hidden />
      <div className="enq-stage-card-top">
        <span className="enq-stage-handle" title="Drag to reorder" aria-hidden>
          <GripVertical size={16} />
        </span>
        <span className="enq-stage-icon-wrap" style={{ color: stage.color, background: `color-mix(in srgb, ${stage.color} 14%, #fff)` }}>
          <Icon size={18} />
        </span>
        <div className="enq-stage-card-titles">
          <h4>{stage.name}</h4>
          {stage.description ? <p>{stage.description}</p> : null}
        </div>
        <span
          className="enq-stage-swatch"
          style={{ background: stage.color }}
          title={stage.color}
          aria-label={`Color ${stage.color}`}
        />
      </div>

      <div className="enq-stage-card-meta">
        <span className="enq-stage-count">
          <strong>{stage.enquiryCount}</strong> enquiries
        </span>
        {stage.isSystem ? (
          <span className="enq-system-badge">
            <Lock size={12} aria-hidden /> System Stage
          </span>
        ) : (
          <label className="enq-stage-toggle">
            <input
              type="checkbox"
              checked={stage.active}
              onChange={() => onToggleActive(stage)}
            />
            <span>{stage.active ? 'Active' : 'Disabled'}</span>
          </label>
        )}
      </div>

      <div className="enq-stage-card-actions">
        {isLost && onConfigureLost ? (
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => onConfigureLost(stage)}
          >
            <Settings2 size={14} aria-hidden /> Configure Lost Reasons
          </button>
        ) : null}
        <button
          type="button"
          className="ui-btn ui-btn-outline"
          onClick={() => onEdit(stage)}
          title={
            stage.isSystem
              ? 'Color and icon can be updated; renaming is locked'
              : 'Edit stage'
          }
        >
          <Pencil size={14} aria-hidden /> Edit
        </button>
        <button
          type="button"
          className="ui-btn ui-btn-danger"
          onClick={() => onDelete(stage)}
          disabled={stage.isSystem}
          title={stage.isSystem ? 'System stages cannot be deleted' : 'Delete stage'}
        >
          <Trash2 size={14} aria-hidden /> Delete
        </button>
      </div>
    </motion.article>
  );
});
