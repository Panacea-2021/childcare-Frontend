'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ban, CheckCircle2, Eye, Pencil, Trash2 } from 'lucide-react';
import type { TaskRecord } from '@/lib/tasks/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

type Props = {
  items: TaskRecord[];
  selected: Set<string>;
  isMyTasks?: boolean;
  onToggle: (id: string) => void;
  onOpen: (task: TaskRecord) => void;
  onView: (task: TaskRecord) => void;
  onEdit: (task: TaskRecord) => void;
  onComplete: (task: TaskRecord) => void;
  onCancel?: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export const TaskMobileCards = memo(function TaskMobileCards({
  items,
  selected,
  isMyTasks = false,
  onToggle,
  onOpen,
  onView,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
}: Props) {
  const router = useRouter();

  return (
    <div className="tm-cards">
      {items.map((task, i) => (
        <motion.article
          key={task.id}
          className="tm-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.03, 0.24), duration: 0.22 }}
          whileHover={{ y: -2, boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)' }}
          onClick={() => onOpen(task)}
        >
          <div className="tm-card-top">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={selected.has(task.id)}
                onChange={() => onToggle(task.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Select ${task.name}`}
              />
              <div className="tm-card-titles">
                <h4>{task.name}</h4>
                {task.studentId && task.studentName ? (
                  <button
                    type="button"
                    className="tm-student-link"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/students/${task.studentId}`);
                    }}
                  >
                    {task.studentName}
                  </button>
                ) : null}
              </div>
            </div>
            <StatusBadge status={task.status} />
          </div>
          <div className="tm-card-meta">
            <span>Due {formatDate(task.dueDate)}</span>
            {!isMyTasks ? <PriorityBadge priority={task.priority} /> : null}
            {!isMyTasks ? (
              <span className="tm-label-chip">
                <span className="tm-label-dot" style={{ background: task.labelColor }} />
                {task.label}
              </span>
            ) : null}
            {!isMyTasks ? <span>{task.type}</span> : null}
            {isMyTasks && task.status === 'Cancelled' && task.cancelReason ? (
              <span className="tm-cancel-reason" title={task.cancelReason}>
                Reason: {task.cancelReason}
              </span>
            ) : null}
          </div>
          <div className="tm-card-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="tm-icon-btn" data-tip="View" onClick={() => onView(task)}>
              <Eye size={15} />
            </button>
            <button type="button" className="tm-icon-btn" data-tip="Edit" onClick={() => onEdit(task)}>
              <Pencil size={15} />
            </button>
            <button
              type="button"
              className="tm-icon-btn"
              data-tip="Mark as Done"
              onClick={() => onComplete(task)}
            >
              <CheckCircle2 size={15} />
            </button>
            <button
              type="button"
              className="tm-icon-btn is-danger"
              data-tip="Cancel"
              onClick={() => onCancel?.(task)}
            >
              <Ban size={15} />
            </button>
            <button
              type="button"
              className="tm-icon-btn is-danger"
              data-tip="Delete"
              onClick={() => onDelete(task)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </motion.article>
      ))}
    </div>
  );
});
