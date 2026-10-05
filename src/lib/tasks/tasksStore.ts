import {
  DEFAULT_LABELS,
  DEFAULT_TASK_TYPES,
  SEED_TASKS,
  type LabelOption,
} from './mockData';
import type { TaskFilters, TaskPriority, TaskRecord, TaskStatus } from './types';
import { TASK_LABELS_KEY, TASK_STORAGE_KEY, TASK_TYPES_KEY } from './types';

function canUseStorage() {
  return typeof window !== 'undefined';
}

export function loadTasks(): TaskRecord[] {
  if (!canUseStorage()) return [...SEED_TASKS];
  try {
    const raw = localStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return [...SEED_TASKS];
    const parsed = JSON.parse(raw) as TaskRecord[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...SEED_TASKS];
  } catch {
    return [...SEED_TASKS];
  }
}

export function saveTasks(tasks: TaskRecord[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
}

export function resetTasksToSeed(): TaskRecord[] {
  const seeded = [...SEED_TASKS];
  saveTasks(seeded);
  return seeded;
}

export function upsertTask(task: TaskRecord) {
  const list = loadTasks();
  const idx = list.findIndex((t) => t.id === task.id);
  if (idx >= 0) list[idx] = task;
  else list.unshift(task);
  saveTasks(list);
  return list;
}

export function deleteTasks(ids: string[]) {
  const idSet = new Set(ids);
  const next = loadTasks().filter((t) => !idSet.has(t.id));
  saveTasks(next);
  return next;
}

export function updateTaskStatus(
  id: string,
  status: TaskStatus,
  opts?: { cancelReason?: string },
): TaskRecord[] {
  const list = loadTasks().map((t) => {
    if (t.id !== id) return t;
    const now = new Date().toISOString();
    const cancelReason =
      status === 'Cancelled' ? (opts?.cancelReason ?? t.cancelReason ?? '').trim() : undefined;
    return {
      ...t,
      status,
      cancelReason,
      updatedAt: now,
      activity: [
        {
          id: `act-${Date.now()}`,
          text:
            status === 'Cancelled' && cancelReason
              ? `Status → Cancelled · ${cancelReason}`
              : `Status → ${status}`,
          at: now,
        },
        ...t.activity,
      ],
    };
  });
  saveTasks(list);
  return list;
}

export function bulkUpdate(
  ids: string[],
  patch: Partial<Pick<TaskRecord, 'status' | 'priority' | 'label' | 'labelColor' | 'assignedTo' | 'department'>>,
): TaskRecord[] {
  const idSet = new Set(ids);
  const now = new Date().toISOString();
  const list = loadTasks().map((t) => {
    if (!idSet.has(t.id)) return t;
    const next = { ...t, ...patch, updatedAt: now };
    const notes: string[] = [];
    if (patch.status) notes.push(`Status → ${patch.status}`);
    if (patch.priority) notes.push(`Priority → ${patch.priority}`);
    if (patch.label) notes.push(`Label → ${patch.label}`);
    if (patch.assignedTo) notes.push(`Reassigned to ${patch.assignedTo}`);
    if (notes.length) {
      next.activity = [
        ...notes.map((text, i) => ({ id: `act-${Date.now()}-${i}`, text, at: now })),
        ...t.activity,
      ];
    }
    return next;
  });
  saveTasks(list);
  return list;
}

export function duplicateTask(id: string): TaskRecord[] {
  const list = loadTasks();
  const src = list.find((t) => t.id === id);
  if (!src) return list;
  const now = new Date().toISOString();
  const copy: TaskRecord = {
    ...src,
    id: `task-${Date.now()}`,
    name: `${src.name} (Copy)`,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
    activity: [{ id: `act-${Date.now()}`, text: 'Duplicated task', at: now }],
  };
  const next = [copy, ...list];
  saveTasks(next);
  return next;
}

export function loadTaskTypes(): string[] {
  if (!canUseStorage()) return [...DEFAULT_TASK_TYPES];
  try {
    const raw = localStorage.getItem(TASK_TYPES_KEY);
    if (!raw) return [...DEFAULT_TASK_TYPES];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_TASK_TYPES];
  } catch {
    return [...DEFAULT_TASK_TYPES];
  }
}

export function saveTaskTypes(types: string[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(TASK_TYPES_KEY, JSON.stringify(types));
}

export function loadTaskLabels(): LabelOption[] {
  if (!canUseStorage()) return [...DEFAULT_LABELS];
  try {
    const raw = localStorage.getItem(TASK_LABELS_KEY);
    if (!raw) return [...DEFAULT_LABELS];
    const parsed = JSON.parse(raw) as LabelOption[];
    return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_LABELS];
  } catch {
    return [...DEFAULT_LABELS];
  }
}

export function saveTaskLabels(labels: LabelOption[]) {
  if (!canUseStorage()) return;
  localStorage.setItem(TASK_LABELS_KEY, JSON.stringify(labels));
}

function inRange(value: string, from: string, to: string) {
  if (from && value < from) return false;
  if (to && value > to) return false;
  return true;
}

export function filterTasks(
  items: TaskRecord[],
  filters: TaskFilters,
  opts?: { assignedToOnly?: string },
): TaskRecord[] {
  const q = filters.search.trim().toLowerCase();
  return items.filter((t) => {
    if (opts?.assignedToOnly && t.assignedTo !== opts.assignedToOnly) return false;
    if (q) {
      const hay =
        `${t.name} ${t.studentName ?? ''} ${t.assignedTo} ${t.assignedBy} ${t.type} ${t.label} ${t.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.assignedTo && t.assignedTo !== filters.assignedTo) return false;
    if (filters.assignedBy && t.assignedBy !== filters.assignedBy) return false;
    if (filters.type && t.type !== filters.type) return false;
    if (filters.label && t.label !== filters.label) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.status && t.status !== filters.status) return false;
    if (!inRange(t.dueDate, filters.dueFrom, filters.dueTo)) return false;
    const createdDay = t.createdAt.slice(0, 10);
    if (!inRange(createdDay, filters.createdFrom, filters.createdTo)) return false;
    return true;
  });
}

export function exportTasksCsv(items: TaskRecord[]) {
  const headers = [
    'Task',
    'Student',
    'Assigned To',
    'Assigned By',
    'Department',
    'Due Date',
    'Priority',
    'Type',
    'Label',
    'Status',
    'Cancel Reason',
    'Created',
  ];
  const rows = items.map((t) =>
    [
      t.name,
      t.studentName ?? '',
      t.assignedTo,
      t.assignedBy,
      t.department,
      t.dueDate,
      t.priority,
      t.type,
      t.label,
      t.status,
      t.cancelReason ?? '',
      t.createdAt.slice(0, 10),
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(','),
  );
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export type { TaskPriority, TaskStatus };
