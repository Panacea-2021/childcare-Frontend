export type TaskStatus =
  | 'Pending'
  | 'In Progress'
  | 'Completed'
  | 'Overdue'
  | 'Cancelled';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type TaskRecord = {
  id: string;
  name: string;
  /** Linked student for profile navigation (optional). */
  studentId?: string;
  studentName?: string;
  assignedTo: string;
  assignedBy: string;
  department: string;
  dueDate: string;
  dueTime?: string;
  priority: TaskPriority;
  type: string;
  label: string;
  labelColor: string;
  status: TaskStatus;
  /** Required when status is Cancelled (My Tasks cancel flow). */
  cancelReason?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  activity: { id: string; text: string; at: string }[];
};

export type TaskFilters = {
  search: string;
  assignedTo: string;
  assignedBy: string;
  type: string;
  label: string;
  priority: string;
  status: string;
  dueFrom: string;
  dueTo: string;
  createdFrom: string;
  createdTo: string;
};

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  search: '',
  assignedTo: '',
  assignedBy: '',
  type: '',
  label: '',
  priority: '',
  status: '',
  dueFrom: '',
  dueTo: '',
  createdFrom: '',
  createdTo: '',
};

export type TaskTab = 'mine' | 'all';

export type TaskModalMode = 'create' | 'edit' | 'view';

export const TASK_STORAGE_KEY = 'panacea.tasks.v3';
export const TASK_TYPES_KEY = 'panacea.taskTypes.v1';
export const TASK_LABELS_KEY = 'panacea.taskLabels.v1';

/** Statuses available in My Tasks create/edit/status menus. */
export const MY_TASK_STATUSES: TaskStatus[] = ['In Progress', 'Completed'];
