'use client';

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Ban,
  CheckCircle2,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { TaskRecord, TaskStatus } from '@/lib/tasks/types';
import { MY_TASK_STATUSES } from '@/lib/tasks/types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { dropdownMotion } from './animations';

type ColKey =
  | 'check'
  | 'name'
  | 'student'
  | 'assignedTo'
  | 'assignedBy'
  | 'department'
  | 'dueDate'
  | 'priority'
  | 'type'
  | 'label'
  | 'status'
  | 'reason'
  | 'createdAt'
  | 'actions';

type Props = {
  items: TaskRecord[];
  selected: Set<string>;
  isAllTab: boolean;
  /** My Tasks simplified columns (reason); All Tasks uses same actions. */
  isMyTasks?: boolean;
  colWidths: Partial<Record<ColKey, number>>;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onRowClick: (task: TaskRecord) => void;
  onView: (task: TaskRecord) => void;
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
  onStatusChange: (task: TaskRecord, status: TaskStatus) => void;
  onMarkDone: (task: TaskRecord) => void;
  onCancel: (task: TaskRecord) => void;
  onResize: (key: ColKey, width: number) => void;
};

function formatDate(iso: string) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

export const TaskTable = memo(function TaskTable({
  items,
  selected,
  isAllTab,
  isMyTasks = false,
  colWidths,
  onToggle,
  onToggleAll,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onMarkDone,
  onCancel,
  onResize,
}: Props) {
  const router = useRouter();
  const allChecked = items.length > 0 && items.every((t) => selected.has(t.id));
  const [statusFor, setStatusFor] = useState<string | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [previewPos, setPreviewPos] = useState({ top: 0, left: 0 });
  const nameBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const resizeRef = useRef<{ key: ColKey; startX: number; startW: number } | null>(null);
  const previewTask = previewFor ? items.find((t) => t.id === previewFor) ?? null : null;

  useEffect(() => {
    const close = () => {
      setStatusFor(null);
      setPreviewFor(null);
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  useLayoutEffect(() => {
    if (!previewFor) return;
    const el = nameBtnRefs.current[previewFor];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 24);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
    if (left < 12) left = 12;
    const below = rect.bottom + 8;
    const estimatedHeight = 220;
    const top =
      below + estimatedHeight > window.innerHeight - 12
        ? Math.max(12, rect.top - estimatedHeight - 8)
        : below;
    setPreviewPos({ top, left });
  }, [previewFor]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const next = Math.max(80, resizeRef.current.startW + (e.clientX - resizeRef.current.startX));
      onResize(resizeRef.current.key, next);
    };
    const onUp = () => {
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onResize]);

  const th = (key: ColKey, label: string) => (
    <th style={colWidths[key] ? { width: colWidths[key], minWidth: colWidths[key] } : undefined}>
      {label}
      <span
        className="tm-th-resize"
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const thEl = (e.target as HTMLElement).parentElement;
          resizeRef.current = {
            key,
            startX: e.clientX,
            startW: thEl?.getBoundingClientRect().width ?? 120,
          };
        }}
      />
    </th>
  );

  return (
    <motion.div
      className="tm-table-wrap tm-desktop-only"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <table className="ui-table tm-table">
        <thead>
          <tr>
            <th className="tm-check">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onToggleAll(e.target.checked)}
                aria-label="Select all tasks"
              />
            </th>
            {th('student', 'Student Name')}
            {th('name', isAllTab ? 'Task' : 'Task Name')}
            {isAllTab ? th('assignedTo', 'Assigned To') : null}
            {th('assignedBy', 'Assigned By')}
            {isAllTab ? th('department', 'Department') : null}
            {th('dueDate', 'Due Date')}
            {!isMyTasks ? th('priority', 'Priority') : null}
            {!isMyTasks ? th('type', 'Type') : null}
            {!isMyTasks ? th('label', 'Label') : null}
            {th('status', 'Status')}
            {isMyTasks ? th('reason', 'Reason') : null}
            {th('createdAt', 'Created Date')}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((task, index) => {
            const isSelected = selected.has(task.id);
            return (
              <motion.tr
                key={task.id}
                className={`tm-row${isSelected ? ' is-selected' : ''}`}
                onClick={() => onRowClick(task)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.025, 0.2), duration: 0.22 }}
                whileHover={{ y: -1 }}
              >
                <td className="tm-check" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(task.id)}
                    aria-label={`Select ${task.name}`}
                  />
                </td>
                <td className="tm-student" onClick={(e) => e.stopPropagation()}>
                  {task.studentId && task.studentName ? (
                    <button
                      type="button"
                      className="tm-student-link"
                      title={`Open ${task.studentName} profile`}
                      onClick={() => router.push(`/students/${task.studentId}`)}
                    >
                      {task.studentName}
                    </button>
                  ) : (
                    <span className="tm-student-empty">—</span>
                  )}
                </td>
                <td className="tm-name" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    ref={(node) => {
                      nameBtnRefs.current[task.id] = node;
                    }}
                    className={`tm-name-btn${previewFor === task.id ? ' is-open' : ''}`}
                    aria-expanded={previewFor === task.id}
                    aria-label={`Preview task: ${task.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setStatusFor(null);
                      setPreviewFor((id) => (id === task.id ? null : task.id));
                    }}
                  >
                    <span>{task.name}</span>
                  </button>
                </td>
                {isAllTab ? <td>{task.assignedTo}</td> : null}
                <td>{task.assignedBy}</td>
                {isAllTab ? <td>{task.department}</td> : null}
                <td>
                  {formatDate(task.dueDate)}
                  {task.dueTime ? ` · ${task.dueTime}` : ''}
                </td>
                {!isMyTasks ? (
                  <td>
                    <PriorityBadge priority={task.priority} />
                  </td>
                ) : null}
                {!isMyTasks ? <td>{task.type}</td> : null}
                {!isMyTasks ? (
                  <td>
                    <span className="tm-label-chip">
                      <span className="tm-label-dot" style={{ background: task.labelColor }} />
                      {task.label}
                    </span>
                  </td>
                ) : null}
                <td onClick={(e) => e.stopPropagation()} style={{ position: 'relative' }}>
                  <StatusBadge
                    status={task.status}
                    interactive
                    onClick={() => {
                      setPreviewFor(null);
                      setStatusFor((id) => (id === task.id ? null : task.id));
                    }}
                  />
                  <AnimatePresence>
                    {statusFor === task.id ? (
                      <motion.div className="tm-status-menu" {...dropdownMotion}>
                        {MY_TASK_STATUSES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={`tm-status-option${task.status === s ? ' is-active' : ''}`}
                            onClick={() => {
                              onStatusChange(task, s);
                              setStatusFor(null);
                            }}
                          >
                            {s === 'Completed' ? 'Mark as Done' : s}
                          </button>
                        ))}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </td>
                {isMyTasks ? (
                  <td className="tm-reason" title={task.cancelReason || undefined}>
                    {task.status === 'Cancelled' && task.cancelReason ? task.cancelReason : '—'}
                  </td>
                ) : null}
                <td>{formatDate(task.createdAt)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="tm-actions">
                    <button
                      type="button"
                      className="tm-icon-btn"
                      data-tip="View"
                      aria-label="View"
                      onClick={() => onView(task)}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      type="button"
                      className="tm-icon-btn"
                      data-tip="Edit"
                      aria-label="Edit"
                      onClick={() => onEdit(task)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="tm-icon-btn"
                      data-tip="Mark as Done"
                      aria-label="Mark as Done"
                      onClick={() => onMarkDone(task)}
                    >
                      <CheckCircle2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="tm-icon-btn is-danger"
                      data-tip="Cancel"
                      aria-label="Cancel task"
                      onClick={() => onCancel(task)}
                    >
                      <Ban size={15} />
                    </button>
                    <button
                      type="button"
                      className="tm-icon-btn is-danger"
                      data-tip="Delete"
                      aria-label="Delete"
                      onClick={() => onDelete(task)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {previewTask ? (
                <motion.div
                  key={previewTask.id}
                  className="tm-name-popover"
                  role="dialog"
                  aria-label="Task preview"
                  style={{
                    position: 'fixed',
                    top: previewPos.top,
                    left: previewPos.left,
                    zIndex: 2400,
                  }}
                  {...dropdownMotion}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="tm-name-popover-head">
                    <p className="tm-name-popover-kicker">Task name</p>
                    <button
                      type="button"
                      className="tm-name-popover-close"
                      aria-label="Close preview"
                      onClick={() => setPreviewFor(null)}
                    >
                      ×
                    </button>
                  </div>
                  <p className="tm-name-popover-title">{previewTask.name}</p>
                  <div className="tm-name-popover-block">
                    <p className="tm-name-popover-kicker">Reason</p>
                    <p className="tm-name-popover-body">
                      {previewTask.cancelReason?.trim()
                        ? previewTask.cancelReason
                        : 'No reason recorded for this task.'}
                    </p>
                  </div>
                  {previewTask.description?.trim() ? (
                    <div className="tm-name-popover-block">
                      <p className="tm-name-popover-kicker">Description</p>
                      <p className="tm-name-popover-body">{previewTask.description}</p>
                    </div>
                  ) : null}
                  <div className="tm-name-popover-actions">
                    <button
                      type="button"
                      className="ui-btn ui-btn-outline"
                      onClick={() => {
                        setPreviewFor(null);
                        onView(previewTask);
                      }}
                    >
                      Open full view
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </motion.div>
  );
});
