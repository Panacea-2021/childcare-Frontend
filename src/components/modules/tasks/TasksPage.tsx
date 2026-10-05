'use client';

import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { getCurrentStaff } from '@/lib/tasks/currentUser';
import {
  departmentOf,
  labelColorOf,
  type LabelOption,
} from '@/lib/tasks/mockData';
import type { CreateTaskValues } from '@/lib/tasks/schema';
import type {
  TaskFilters,
  TaskModalMode,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  TaskTab,
} from '@/lib/tasks/types';
import { DEFAULT_TASK_FILTERS } from '@/lib/tasks/types';
import {
  bulkUpdate,
  deleteTasks,
  exportTasksCsv,
  filterTasks,
  loadTaskLabels,
  loadTasks,
  loadTaskTypes,
  saveTaskLabels,
  saveTaskTypes,
  updateTaskStatus,
  upsertTask,
} from '@/lib/tasks/tasksStore';
import { TaskTabs } from './TaskTabs';
import { TaskToolbar } from './TaskToolbar';
import { TaskTable } from './TaskTable';
import { TaskMobileCards } from './TaskMobileCards';
import { CreateTaskModal } from './CreateTaskModal';
import { CancelTaskModal } from './CancelTaskModal';
import { TaskDetailsDrawer } from './TaskDetailsDrawer';
import { BulkActionBar } from './BulkActionBar';
import { TasksPageHeader } from './TasksPageHeader';
import { pageMotion, softInteractiveBtn } from './animations';
import '@/components/ui/module.css';
import './tasks.css';

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

export const TasksPage = memo(function TasksPage() {
  const staff = useMemo(() => getCurrentStaff(), []);
  const [tab, setTab] = useState<TaskTab>('mine');
  const [items, setItems] = useState<TaskRecord[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ ...DEFAULT_TASK_FILTERS });
  const [types, setTypes] = useState<string[]>([]);
  const [labels, setLabels] = useState<LabelOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<TaskModalMode>('create');
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const [drawerTask, setDrawerTask] = useState<TaskRecord | null>(null);
  const [cancelTask, setCancelTask] = useState<TaskRecord | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; message: string } | null>(null);
  const [colWidths, setColWidths] = useState<Partial<Record<ColKey, number>>>({});

  useEffect(() => {
    setItems(loadTasks());
    setTypes(loadTaskTypes());
    setLabels(loadTaskLabels());
    const t = window.setTimeout(() => setLoading(false), 420);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [tab, filters, pageSize]);

  const showAll = staff.isAdmin;
  const activeTab: TaskTab = showAll ? tab : 'mine';
  const isMyTasks = activeTab === 'mine';

  const filtered = useMemo(() => {
    return filterTasks(items, filters, {
      assignedToOnly: isMyTasks ? staff.name : undefined,
    });
  }, [items, filters, isMyTasks, staff.name]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const rangeStart = filtered.length ? (safePage - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(safePage * pageSize, filtered.length);

  const notify = useCallback((message: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ message, type });
  }, []);

  const onFilterChange = useCallback((patch: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setModalMode('create');
    setModalOpen(true);
  }, []);

  const openView = useCallback((task: TaskRecord) => {
    setDrawerTask(null);
    setEditing(task);
    setModalMode('view');
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((task: TaskRecord) => {
    setDrawerTask(null);
    setEditing(task);
    setModalMode('edit');
    setModalOpen(true);
  }, []);

  const onSaveTask = useCallback(
    (values: CreateTaskValues & { labelColor: string }) => {
      const now = new Date().toISOString();
      if (editing && modalMode === 'edit') {
        const next: TaskRecord = {
          ...editing,
          name: values.name,
          assignedTo: values.assignedTo,
          assignedBy: values.assignedBy,
          department: departmentOf(values.assignedTo),
          dueDate: values.dueDate,
          dueTime: values.dueTime,
          type: values.type,
          label: values.label,
          labelColor: values.labelColor,
          priority: values.priority,
          status: values.status,
          cancelReason: values.status === 'Cancelled' ? editing.cancelReason : undefined,
          description: values.description ?? '',
          updatedAt: now,
          activity: [
            { id: `act-${Date.now()}`, text: 'Task updated', at: now },
            ...editing.activity,
          ],
        };
        setItems(upsertTask(next));
        notify('Task updated');
        return;
      }
      const created: TaskRecord = {
        id: `task-${Date.now()}`,
        name: values.name,
        assignedTo: values.assignedTo,
        assignedBy: values.assignedBy || staff.name,
        department: departmentOf(values.assignedTo),
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        type: values.type,
        label: values.label,
        labelColor: values.labelColor,
        priority: values.priority,
        status: values.status || (isMyTasks ? 'In Progress' : 'Pending'),
        description: values.description ?? '',
        createdAt: now,
        updatedAt: now,
        activity: [
          { id: `act-${Date.now()}`, text: 'Task created', at: now },
          {
            id: `act-${Date.now()}-a`,
            text: `Assigned to ${values.assignedTo}`,
            at: now,
          },
        ],
      };
      setItems(upsertTask(created));
      notify('Task created');
    },
    [editing, modalMode, notify, staff.name, isMyTasks],
  );

  const onAddType = useCallback((type: string) => {
    setTypes((prev) => {
      if (prev.includes(type)) return prev;
      const next = [...prev, type];
      saveTaskTypes(next);
      return next;
    });
  }, []);

  const onAddLabel = useCallback((label: LabelOption) => {
    setLabels((prev) => {
      if (prev.some((p) => p.name.toLowerCase() === label.name.toLowerCase())) return prev;
      const next = [...prev, label];
      saveTaskLabels(next);
      return next;
    });
  }, []);

  const onStatusChange = useCallback(
    (task: TaskRecord, status: TaskStatus, cancelReason?: string) => {
      setItems(updateTaskStatus(task.id, status, { cancelReason }));
      setDrawerTask((prev) =>
        prev?.id === task.id
          ? {
              ...prev,
              status,
              cancelReason: status === 'Cancelled' ? cancelReason : undefined,
            }
          : prev,
      );
      notify(status === 'Cancelled' ? 'Task cancelled' : `Status → ${status}`);
    },
    [notify],
  );

  const onMarkDone = useCallback(
    (task: TaskRecord) => onStatusChange(task, 'Completed'),
    [onStatusChange],
  );

  const onConfirmCancel = useCallback(
    (reason: string) => {
      if (!cancelTask) return;
      onStatusChange(cancelTask, 'Cancelled', reason);
      setCancelTask(null);
    },
    [cancelTask, onStatusChange],
  );

  const onDelete = useCallback(
    (task: TaskRecord) => {
      if (!window.confirm(`Delete “${task.name}”?`)) return;
      setItems(deleteTasks([task.id]));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
      setDrawerTask((prev) => (prev?.id === task.id ? null : prev));
      notify('Task deleted');
    },
    [notify],
  );

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(
    (checked: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        pageItems.forEach((t) => {
          if (checked) next.add(t.id);
          else next.delete(t.id);
        });
        return next;
      });
    },
    [pageItems],
  );

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  const bulkComplete = useCallback(() => {
    setItems(bulkUpdate(selectedIds, { status: 'Completed' }));
    setSelected(new Set());
    notify('Selected tasks marked complete');
  }, [selectedIds, notify]);

  const bulkDelete = useCallback(() => {
    if (!window.confirm(`Delete ${selectedIds.length} task(s)?`)) return;
    setItems(deleteTasks(selectedIds));
    setSelected(new Set());
    notify('Selected tasks deleted');
  }, [selectedIds, notify]);

  const bulkExport = useCallback(() => {
    const rows = items.filter((t) => selected.has(t.id));
    exportTasksCsv(rows.length ? rows : filtered);
    notify('Export ready');
  }, [items, selected, filtered, notify]);

  const bulkLabel = useCallback(
    (label: string) => {
      setItems(
        bulkUpdate(selectedIds, {
          label,
          labelColor: labelColorOf(label, labels),
        }),
      );
      notify(`Label → ${label}`);
    },
    [selectedIds, labels, notify],
  );

  const bulkPriority = useCallback(
    (priority: TaskPriority) => {
      setItems(bulkUpdate(selectedIds, { priority }));
      notify(`Priority → ${priority}`);
    },
    [selectedIds, notify],
  );

  const onResize = useCallback((key: ColKey, width: number) => {
    setColWidths((prev) => ({ ...prev, [key]: width }));
  }, []);

  return (
    <motion.div className="tm-page is-schedule-look" {...pageMotion}>
      <div className="tm-ambient" aria-hidden>
        <span className="tm-blob b1" />
        <span className="tm-blob b2" />
        <span className="tm-blob b3" />
        <span className="tm-mesh" />
      </div>

      <div className="tm-page-inner">
        <TasksPageHeader
          subtitle={`Logged in as ${staff.name}${staff.isAdmin ? ' · Admin' : ''}. Track and assign follow-ups across your centre.`}
          onCreate={openCreate}
        />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
        >
          <TaskTabs
            active={activeTab}
            showAll={showAll}
            onChange={(next) => {
              if (next === 'all' && !showAll) return;
              setTab(next);
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <TaskToolbar
            filters={filters}
            onChange={onFilterChange}
            onCreate={openCreate}
          />
        </motion.div>

        <motion.div
          className="tm-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        >
          {loading ? (
            <div className="tm-skeleton" aria-busy aria-label="Loading tasks">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="tm-skel-line" style={{ width: `${88 - i * 4}%` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="tm-empty">
              <div className="tm-empty-illu">
                <ClipboardList size={36} strokeWidth={1.6} />
              </div>
              <h3>No Tasks Found</h3>
              <p>Create your first task to assign and track work efficiently.</p>
              <motion.button
                type="button"
                className="ui-btn ui-btn-primary tm-create-btn"
                onClick={openCreate}
                {...softInteractiveBtn}
              >
                <Plus size={16} /> Create Task
              </motion.button>
            </div>
          ) : (
            <>
              <TaskTable
                items={pageItems}
                selected={selected}
                isAllTab={activeTab === 'all'}
                isMyTasks={isMyTasks}
                colWidths={colWidths}
                onToggle={toggle}
                onToggleAll={toggleAll}
                onRowClick={setDrawerTask}
                onView={openView}
                onEdit={openEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                onMarkDone={onMarkDone}
                onCancel={setCancelTask}
                onResize={onResize}
              />
              <TaskMobileCards
                items={pageItems}
                selected={selected}
                isMyTasks={isMyTasks}
                onToggle={toggle}
                onOpen={setDrawerTask}
                onView={openView}
                onEdit={openEdit}
                onComplete={onMarkDone}
                onCancel={setCancelTask}
                onDelete={onDelete}
              />
              <div className="tm-pager">
                <div className="tm-pager-meta">
                  Showing <strong>{rangeStart}</strong>–<strong>{rangeEnd}</strong> of{' '}
                  <strong>{filtered.length}</strong> Tasks
                </div>
                <div className="tm-pager-right">
                  <label className="tm-page-size">
                    Rows per page
                    <select
                      className="ui-select"
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                    >
                      {[10, 25, 50, 100].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      <BulkActionBar
        count={selected.size}
        labels={labels}
        onComplete={bulkComplete}
        onDelete={bulkDelete}
        onExport={bulkExport}
        onAssignLabel={bulkLabel}
        onChangePriority={bulkPriority}
      />

      <CreateTaskModal
        open={modalOpen}
        mode={modalMode}
        editing={editing}
        currentUserName={staff.name}
        taskTypes={types}
        labels={labels}
        simpleStatus={isMyTasks}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={onSaveTask}
        onAddType={onAddType}
        onAddLabel={onAddLabel}
      />

      <CancelTaskModal
        open={Boolean(cancelTask)}
        task={cancelTask}
        onClose={() => setCancelTask(null)}
        onConfirm={onConfirmCancel}
      />

      <TaskDetailsDrawer
        open={Boolean(drawerTask)}
        task={drawerTask}
        onClose={() => setDrawerTask(null)}
        onEdit={() => {
          if (drawerTask) openEdit(drawerTask);
        }}
        onComplete={() => {
          if (drawerTask) onMarkDone(drawerTask);
        }}
        onDelete={() => {
          if (drawerTask) onDelete(drawerTask);
        }}
      />

      <motion.button
        type="button"
        className="tm-fab"
        aria-label="Create Task"
        onClick={openCreate}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus size={24} />
      </motion.button>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className={`tm-toast${toast.type === 'err' ? ' is-err' : ''}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
});
