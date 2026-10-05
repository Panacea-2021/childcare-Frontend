'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import type { TaskRecord } from '@/lib/tasks/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

type Props = {
  open: boolean;
  task: TaskRecord | null;
  onClose: () => void;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const TaskDetailsDrawer = memo(function TaskDetailsDrawer({
  open,
  task,
  onClose,
  onEdit,
  onComplete,
  onDelete,
}: Props) {
  const router = useRouter();

  return (
    <Drawer
      open={open && Boolean(task)}
      title="Task Details"
      subtitle={task?.type}
      onClose={onClose}
      icon={<ClipboardList size={18} strokeWidth={1.75} />}
      bodyClassName="tm-drawer-body"
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={onEdit}>
            Edit
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onComplete}>
            Mark Complete
          </button>
          <button type="button" className="ui-btn ui-btn-danger" onClick={onDelete}>
            Delete
          </button>
        </>
      }
    >
      {task ? (
        <>
          <div className="tm-drawer-hero">
            <h3>{task.name}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>

          <dl className="tm-drawer-meta">
            {task.studentId && task.studentName ? (
              <div className="tm-drawer-row">
                <dt>Student Name</dt>
                <dd>
                  <button
                    type="button"
                    className="tm-student-link"
                    onClick={() => {
                      onClose();
                      router.push(`/students/${task.studentId}`);
                    }}
                  >
                    {task.studentName}
                  </button>
                </dd>
              </div>
            ) : null}
            {task.status === 'Cancelled' && task.cancelReason ? (
              <div className="tm-drawer-row">
                <dt>Cancel Reason</dt>
                <dd>{task.cancelReason}</dd>
              </div>
            ) : null}
            <div className="tm-drawer-row">
              <dt>Assigned To</dt>
              <dd>{task.assignedTo}</dd>
            </div>
            <div className="tm-drawer-row">
              <dt>Assigned By</dt>
              <dd>{task.assignedBy}</dd>
            </div>
            <div className="tm-drawer-row">
              <dt>Department</dt>
              <dd>{task.department}</dd>
            </div>
            <div className="tm-drawer-row">
              <dt>Due Date</dt>
              <dd>
                {formatDate(task.dueDate)}
                {task.dueTime ? ` · ${task.dueTime}` : ''}
              </dd>
            </div>
            <div className="tm-drawer-row">
              <dt>Label</dt>
              <dd>
                <span className="tm-label-chip">
                  <span className="tm-label-dot" style={{ background: task.labelColor }} />
                  {task.label}
                </span>
              </dd>
            </div>
            <div className="tm-drawer-row">
              <dt>Type</dt>
              <dd>{task.type}</dd>
            </div>
          </dl>

          <div className="tm-drawer-section">
            <h4>Description</h4>
            <div className="tm-drawer-card">
              {task.description?.trim() || 'No description provided.'}
            </div>
          </div>

          <div className="tm-drawer-section">
            <h4>Timeline</h4>
            <div className="tm-drawer-card">
              <div className="tm-drawer-row">
                <dt>Created</dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
              <div className="tm-drawer-row" style={{ marginTop: 8 }}>
                <dt>Last Updated</dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
            </div>
          </div>

          <div className="tm-drawer-section">
            <h4>Activity History</h4>
            <ul className="tm-timeline">
              {task.activity.length ? (
                task.activity.map((a) => (
                  <li key={a.id}>
                    <i aria-hidden />
                    <div>
                      {a.text}
                      <time>{formatDate(a.at)}</time>
                    </div>
                  </li>
                ))
              ) : (
                <li>
                  <i aria-hidden />
                  <div>No activity yet</div>
                </li>
              )}
            </ul>
          </div>
        </>
      ) : null}
    </Drawer>
  );
});
