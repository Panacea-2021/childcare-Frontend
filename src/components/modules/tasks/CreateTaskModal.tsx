'use client';

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Plus,
  Search,
  Upload,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { CreateTaskValues } from '@/lib/tasks/schema';
import type { TaskModalMode, TaskRecord } from '@/lib/tasks/types';
import {
  PRIORITIES,
  STAFF,
  departmentOf,
  initialsOf,
  labelColorOf,
  type LabelOption,
} from '@/lib/tasks/mockData';
import { dropdownMotion } from './animations';

type FormState = {
  name: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  dueTime: string;
  type: string;
  label: string;
  priority: CreateTaskValues['priority'];
  status: CreateTaskValues['status'];
  description: string;
};

type Props = {
  open: boolean;
  mode: TaskModalMode;
  editing?: TaskRecord | null;
  currentUserName: string;
  taskTypes: string[];
  labels: LabelOption[];
  /** Restrict status dropdown to In Progress + Completed (My Tasks). */
  simpleStatus?: boolean;
  onClose: () => void;
  onSave: (values: CreateTaskValues & { labelColor: string }) => void;
  onAddType: (type: string) => void;
  onAddLabel: (label: LabelOption) => void;
};

const DESC_MAX = 2000;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function emptyForm(assignedBy: string, simpleStatus = false): FormState {
  return {
    name: '',
    assignedTo: '',
    assignedBy,
    dueDate: todayIso(),
    dueTime: '',
    type: '',
    label: '',
    priority: 'Medium',
    status: simpleStatus ? 'In Progress' : 'Pending',
    description: '',
  };
}

function formFromTask(task: TaskRecord): FormState {
  return {
    name: task.name,
    assignedTo: task.assignedTo,
    assignedBy: task.assignedBy,
    dueDate: task.dueDate,
    dueTime: task.dueTime ?? '',
    type: task.type,
    label: task.label,
    priority: task.priority,
    status: task.status,
    description: task.description,
  };
}

type ActiveMenu = 'assignee' | 'type' | 'label' | null;

function TaskIcon() {
  return <ClipboardList size={18} strokeWidth={1.75} aria-hidden />;
}

export const CreateTaskModal = memo(function CreateTaskModal({
  open,
  mode,
  editing = null,
  currentUserName,
  taskTypes,
  labels,
  simpleStatus = false,
  onClose,
  onSave,
  onAddType,
  onAddLabel,
}: Props) {
  const readOnly = mode === 'view';
  const [form, setForm] = useState<FormState>(() => emptyForm(currentUserName, simpleStatus));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState<ActiveMenu>(null);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [addingLabel, setAddingLabel] = useState(false);
  const [newType, setNewType] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5D5FEF');
  const descRef = useRef<HTMLTextAreaElement>(null);
  const assigneeRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  const closeMenus = useCallback(() => {
    setMenu(null);
    setAssigneeQuery('');
  }, []);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    setAddingType(false);
    setAddingLabel(false);
    setNewType('');
    setNewLabel('');
    closeMenus();
    setForm(editing ? formFromTask(editing) : emptyForm(currentUserName, simpleStatus));
  }, [open, editing, currentUserName, simpleStatus, closeMenus]);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (assigneeRef.current?.contains(t)) return;
      if (typeRef.current?.contains(t)) return;
      if (labelRef.current?.contains(t)) return;
      closeMenus();
      setAddingType(false);
      setAddingLabel(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menu, closeMenus]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(220, Math.max(110, el.scrollHeight))}px`;
  }, [form.description, open]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const filteredFaculty = useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();
    if (!q) return STAFF;
    return STAFF.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q),
    );
  }, [assigneeQuery]);

  const selectedFaculty = STAFF.find((f) => f.name === form.assignedTo);
  const selectedLabel = labels.find((l) => l.name === form.label);

  const validate = () => {
    if (readOnly) return false;
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Task name is required';
    if (!form.assignedTo) next.assignedTo = 'Assigned to is required';
    if (!form.dueDate) next.dueDate = 'Due date is required';
    if (!form.type) next.type = 'Task type is required';
    if (!form.label) next.label = 'Label is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 360));
      onSave({
        name: form.name.trim(),
        assignedTo: form.assignedTo,
        assignedBy: form.assignedBy,
        dueDate: form.dueDate,
        dueTime: form.dueTime || undefined,
        type: form.type,
        label: form.label,
        priority: form.priority,
        status: form.status,
        description: form.description.trim(),
        labelColor: selectedLabel?.color ?? labelColorOf(form.label, labels),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const createType = () => {
    const v = newType.trim();
    if (!v) return;
    onAddType(v);
    set('type', v);
    setNewType('');
    setAddingType(false);
    closeMenus();
  };

  const createLabel = () => {
    const v = newLabel.trim();
    if (!v) return;
    const opt: LabelOption = {
      id: `lb-${Date.now()}`,
      name: v,
      color: newLabelColor,
    };
    onAddLabel(opt);
    set('label', v);
    setNewLabel('');
    setAddingLabel(false);
    closeMenus();
  };

  const onTypeKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createType();
    }
  };

  const onLabelKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createLabel();
    }
  };

  const title =
    mode === 'edit' ? 'Edit Task' : mode === 'view' ? 'View Task' : 'Create Task';
  const subtitle =
    mode === 'edit'
      ? 'Update assignment and tracking details.'
      : mode === 'view'
        ? 'Task details (read-only).'
        : 'Assign and track work efficiently.';

  const nameId = useId();
  const byId = useId();
  const dateId = useId();
  const timeId = useId();
  const priorityId = useId();
  const statusId = useId();
  const descId = useId();
  const assigneeId = useId();
  const typeId = useId();
  const labelId = useId();

  return (
    <Modal
      open={open}
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      wide
      autoHeight
      icon={<TaskIcon />}
      iconClose
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={saving}>
            {readOnly ? 'Close' : 'Cancel'}
          </button>
          {!readOnly ? (
            <button
              type="button"
              className="ui-btn ui-btn-primary tm-create-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Task'}
            </button>
          ) : null}
        </>
      }
    >
      <div className={`mod-form-card tm-modal-form${readOnly ? ' tm-readonly' : ''}`}>
        <h2>Task Information</h2>
        <p>Fill in the assignment details below.</p>

        <div className="tm-section">
          <div className="ui-grid-2">
            <div className="ui-field tm-span-2">
              <label className="ui-label" htmlFor={nameId}>
                Task Name *
              </label>
              <input
                id={nameId}
                className="ui-input"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Enter task name"
                readOnly={readOnly}
              />
              {errors.name ? <p className="tm-field-error">{errors.name}</p> : null}
            </div>

            <div className="ui-field tm-dropdown-field" ref={assigneeRef}>
              <label className="ui-label" htmlFor={assigneeId}>
                Assigned To *
              </label>
              <button
                id={assigneeId}
                type="button"
                className={`ui-input tm-select-trigger${menu === 'assignee' ? ' is-open' : ''}`}
                aria-expanded={menu === 'assignee'}
                disabled={readOnly}
                onClick={() => {
                  if (readOnly) return;
                  setMenu((m) => (m === 'assignee' ? null : 'assignee'));
                  setAddingType(false);
                  setAddingLabel(false);
                }}
              >
                {selectedFaculty ? (
                  <span className="tm-trigger-person">
                    <span className="tm-avatar">{selectedFaculty.initials}</span>
                    <span>{selectedFaculty.name}</span>
                  </span>
                ) : form.assignedTo ? (
                  <span>{form.assignedTo}</span>
                ) : (
                  <span className="tm-placeholder">Select staff</span>
                )}
                {form.assignedTo ? (
                  <Check size={16} style={{ color: 'var(--color-accent)' }} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
              <AnimatePresence>
                {menu === 'assignee' ? (
                  <motion.div className="tm-menu" role="listbox" {...dropdownMotion}>
                    <div className="tm-menu-search">
                      <Search size={14} aria-hidden />
                      <input
                        className="ui-input"
                        placeholder="Search staff…"
                        value={assigneeQuery}
                        onChange={(e) => setAssigneeQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="tm-menu-list">
                      {filteredFaculty.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          role="option"
                          className={`tm-option${form.assignedTo === f.name ? ' is-selected' : ''}`}
                          onClick={() => {
                            set('assignedTo', f.name);
                            closeMenus();
                          }}
                        >
                          <span className="tm-avatar">{f.initials || initialsOf(f.name)}</span>
                          <span className="tm-option-copy">
                            <strong>{f.name}</strong>
                            <span>{f.department}</span>
                          </span>
                          {form.assignedTo === f.name ? (
                            <Check size={14} style={{ color: 'var(--color-accent)' }} />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {errors.assignedTo ? <p className="tm-field-error">{errors.assignedTo}</p> : null}
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={byId}>
                Assigned By
              </label>
              <input id={byId} className="ui-input" value={form.assignedBy} readOnly />
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={dateId}>
                Due Date *
              </label>
              <div className="tm-date-wrap">
                <input
                  id={dateId}
                  type="date"
                  className="ui-input tm-date-input"
                  value={form.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                  readOnly={readOnly}
                />
                <CalendarDays size={16} className="tm-date-icon" aria-hidden />
              </div>
              {errors.dueDate ? <p className="tm-field-error">{errors.dueDate}</p> : null}
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={timeId}>
                Time (Optional)
              </label>
              <input
                id={timeId}
                type="time"
                className="ui-input"
                value={form.dueTime}
                onChange={(e) => set('dueTime', e.target.value)}
                readOnly={readOnly}
              />
            </div>

            <div className="ui-field tm-dropdown-field" ref={typeRef}>
              <label className="ui-label" htmlFor={typeId}>
                Task Type *
              </label>
              <div className="tm-type-row">
                <button
                  id={typeId}
                  type="button"
                  className={`ui-input tm-select-trigger${menu === 'type' ? ' is-open' : ''}`}
                  disabled={readOnly}
                  onClick={() => {
                    if (readOnly) return;
                    setMenu((m) => (m === 'type' ? null : 'type'));
                    setAddingLabel(false);
                  }}
                >
                  <span className={form.type ? undefined : 'tm-placeholder'}>
                    {form.type || 'Select type'}
                  </span>
                  <ChevronDown size={16} />
                </button>
                {!readOnly ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline tm-add-mini"
                    aria-label="Add new type"
                    title="Add New Type"
                    onClick={() => {
                      setMenu(null);
                      setAddingLabel(false);
                      setAddingType(true);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                ) : null}
              </div>
              <AnimatePresence>
                {menu === 'type' ? (
                  <motion.div className="tm-menu" role="listbox" {...dropdownMotion}>
                    <div className="tm-menu-list">
                      {taskTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className={`tm-option${form.type === t ? ' is-selected' : ''}`}
                          onClick={() => {
                            set('type', t);
                            closeMenus();
                          }}
                        >
                          <span>{t}</span>
                          {form.type === t ? (
                            <Check size={14} style={{ color: 'var(--color-accent)' }} />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {addingType ? (
                  <motion.div className="tm-mini-modal" {...dropdownMotion}>
                    <h4>Add Type</h4>
                    <input
                      className="ui-input"
                      placeholder="Type name"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      onKeyDown={onTypeKey}
                      autoFocus
                    />
                    <div className="tm-mini-actions">
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        onClick={() => {
                          setAddingType(false);
                          setNewType('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="ui-btn ui-btn-primary"
                        disabled={!newType.trim()}
                        onClick={createType}
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {errors.type ? <p className="tm-field-error">{errors.type}</p> : null}
            </div>

            <div className="ui-field tm-dropdown-field" ref={labelRef}>
              <label className="ui-label" htmlFor={labelId}>
                Task Label *
              </label>
              <div className="tm-type-row">
                <button
                  id={labelId}
                  type="button"
                  className={`ui-input tm-select-trigger${menu === 'label' ? ' is-open' : ''}`}
                  disabled={readOnly}
                  onClick={() => {
                    if (readOnly) return;
                    setMenu((m) => (m === 'label' ? null : 'label'));
                    setAddingType(false);
                  }}
                >
                  {selectedLabel ? (
                    <span className="tm-trigger-person">
                      <span className="tm-label-dot" style={{ background: selectedLabel.color }} />
                      <span>{selectedLabel.name}</span>
                    </span>
                  ) : (
                    <span className="tm-placeholder">Select label</span>
                  )}
                  <ChevronDown size={16} />
                </button>
                {!readOnly ? (
                  <button
                    type="button"
                    className="ui-btn ui-btn-outline tm-add-mini"
                    aria-label="Add new label"
                    title="Add New Label"
                    onClick={() => {
                      setMenu(null);
                      setAddingType(false);
                      setAddingLabel(true);
                    }}
                  >
                    <Plus size={16} />
                  </button>
                ) : null}
              </div>
              <AnimatePresence>
                {menu === 'label' ? (
                  <motion.div className="tm-menu" role="listbox" {...dropdownMotion}>
                    <div className="tm-menu-list">
                      {labels.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          className={`tm-option${form.label === l.name ? ' is-selected' : ''}`}
                          onClick={() => {
                            set('label', l.name);
                            closeMenus();
                          }}
                        >
                          <span className="tm-label-dot" style={{ background: l.color }} />
                          <span>{l.name}</span>
                          {form.label === l.name ? (
                            <Check size={14} style={{ color: 'var(--color-accent)' }} />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {addingLabel ? (
                  <motion.div className="tm-mini-modal" {...dropdownMotion}>
                    <h4>Add Label</h4>
                    <input
                      className="ui-input"
                      placeholder="Label name"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      onKeyDown={onLabelKey}
                      autoFocus
                    />
                    <div className="ui-field">
                      <label className="ui-label">Color</label>
                      <input
                        type="color"
                        className="ui-input"
                        value={newLabelColor}
                        onChange={(e) => setNewLabelColor(e.target.value)}
                        style={{ height: 44, padding: 4 }}
                      />
                    </div>
                    <div className="tm-mini-actions">
                      <button
                        type="button"
                        className="ui-btn ui-btn-outline"
                        onClick={() => {
                          setAddingLabel(false);
                          setNewLabel('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="ui-btn ui-btn-primary"
                        disabled={!newLabel.trim()}
                        onClick={createLabel}
                      >
                        Save
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              {errors.label ? <p className="tm-field-error">{errors.label}</p> : null}
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={priorityId}>
                Priority
              </label>
              <select
                id={priorityId}
                className="ui-select"
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as FormState['priority'])}
                disabled={readOnly}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor={statusId}>
                Status
              </label>
              <select
                id={statusId}
                className="ui-select"
                value={form.status}
                onChange={(e) => set('status', e.target.value as FormState['status'])}
                disabled={readOnly || (mode === 'create' && !simpleStatus)}
              >
                {simpleStatus ? (
                  <>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Mark as Done</option>
                    {form.status === 'Cancelled' ? (
                      <option value="Cancelled">Cancelled</option>
                    ) : null}
                  </>
                ) : (
                  <>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="tm-section">
          <p className="tm-section-title">Task Description</p>
          <div className="ui-field">
            <label className="ui-label" htmlFor={descId}>
              Description
            </label>
            <textarea
              id={descId}
              ref={descRef}
              className="ui-textarea tm-desc-area"
              placeholder="Write complete task description..."
              maxLength={DESC_MAX}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              readOnly={readOnly}
            />
            <div className="tm-char-count">
              {form.description.length}/{DESC_MAX}
            </div>
          </div>
        </div>

        <div className="tm-section">
          <p className="tm-section-title">Optional</p>
          <div className="tm-upload" aria-hidden={readOnly}>
            <Upload size={22} style={{ marginBottom: 8, color: 'var(--color-accent)' }} />
            <strong>Attachment placeholder</strong>
            Drag & drop files here, or click to upload (UI only)
          </div>
        </div>

        {form.assignedTo ? (
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
            Department: {departmentOf(form.assignedTo)}
          </p>
        ) : null}
      </div>
    </Modal>
  );
});
