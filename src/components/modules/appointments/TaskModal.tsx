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
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardList,
  Loader2,
  Plus,
  Search,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { taskSchema, type TaskFormValues } from '@/lib/appointments/schema';
import {
  FACULTY,
  LABEL_OPTIONS,
  TASK_TYPES,
  initialsOf,
} from '@/lib/appointments/mockData';
import type { AppointmentRecord } from '@/lib/appointments/types';
import { btnMotion, dropdownMotion } from './animations';

type LabelOption = { id: string; name: string; color: string };

type Props = {
  open: boolean;
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
};

type ActiveMenu = 'assignee' | 'type' | 'label' | null;

const DESC_MAX = 2000;

function TaskIcon() {
  return <ClipboardList size={18} strokeWidth={1.75} aria-hidden />;
}

function Avatar({ name, initials }: { name: string; initials?: string }) {
  const letters = initials || initialsOf(name);
  return (
    <span className="appt-task-avatar" aria-hidden title={name}>
      {letters}
    </span>
  );
}

export const TaskModal = memo(function TaskModal({
  open,
  appointment,
  onClose,
  onSave,
}: Props) {
  const [taskTypes, setTaskTypes] = useState<string[]>(TASK_TYPES);
  const [labels, setLabels] = useState<LabelOption[]>(LABEL_OPTIONS);
  const [menu, setMenu] = useState<ActiveMenu>(null);
  const [assigneeQuery, setAssigneeQuery] = useState('');
  const [typeQuery, setTypeQuery] = useState('');
  const [labelQuery, setLabelQuery] = useState('');
  const [addingType, setAddingType] = useState(false);
  const [addingLabel, setAddingLabel] = useState(false);
  const [newType, setNewType] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#5D5FEF');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  const assigneeRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      assignedTo: '',
      dueDate: '',
      taskType: '',
      labels: [],
      description: '',
      title: '',
    },
  });

  const assignedTo = form.watch('assignedTo');
  const taskType = form.watch('taskType');
  const selectedLabels = form.watch('labels') ?? [];
  const description = form.watch('description') ?? '';
  const selectedLabel = selectedLabels[0] ?? '';

  const closeMenus = useCallback(() => {
    setMenu(null);
    setAssigneeQuery('');
    setTypeQuery('');
    setLabelQuery('');
    setAddingType(false);
    setAddingLabel(false);
    setNewType('');
    setNewLabel('');
  }, []);

  useEffect(() => {
    if (!open) return;
    form.reset({
      assignedTo: appointment?.facultyName || FACULTY[0]?.name || '',
      dueDate: '',
      taskType: '',
      labels: [],
      description: '',
      title: '',
    });
    setTaskTypes(TASK_TYPES);
    setLabels(LABEL_OPTIONS);
    setSaving(false);
    setSavedOk(false);
    closeMenus();
  }, [open, appointment, form, closeMenus]);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (assigneeRef.current?.contains(t)) return;
      if (typeRef.current?.contains(t)) return;
      if (labelRef.current?.contains(t)) return;
      closeMenus();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menu, closeMenus]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(220, Math.max(110, el.scrollHeight))}px`;
  }, [description, open]);

  const filteredFaculty = useMemo(() => {
    const q = assigneeQuery.trim().toLowerCase();
    if (!q) return FACULTY;
    return FACULTY.filter(
      (f) =>
        f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q),
    );
  }, [assigneeQuery]);

  const filteredTypes = useMemo(() => {
    const q = typeQuery.trim().toLowerCase();
    if (!q) return taskTypes;
    return taskTypes.filter((t) => t.toLowerCase().includes(q));
  }, [taskTypes, typeQuery]);

  const filteredLabels = useMemo(() => {
    const q = labelQuery.trim().toLowerCase();
    if (!q) return labels;
    return labels.filter((l) => l.name.toLowerCase().includes(q));
  }, [labels, labelQuery]);

  const selectedFaculty = FACULTY.find((f) => f.name === assignedTo);
  const selectedLabelMeta = labels.find((l) => l.name === selectedLabel);

  const displayName = appointment?.studentName || appointment?.parentName || 'Enquiry';
  const leadOwner = appointment?.facultyName || 'Unassigned';

  const createType = () => {
    const v = newType.trim();
    if (!v) return;
    setTaskTypes((prev) => (prev.includes(v) ? prev : [...prev, v]));
    form.setValue('taskType', v, { shouldValidate: true });
    setNewType('');
    setAddingType(false);
    closeMenus();
  };

  const createLabel = () => {
    const v = newLabel.trim();
    if (!v) return;
    setLabels((prev) =>
      prev.some((p) => p.name.toLowerCase() === v.toLowerCase())
        ? prev
        : [...prev, { id: `lb-${Date.now()}`, name: v, color: newLabelColor }],
    );
    form.setValue('labels', [v], { shouldValidate: true });
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

  const submit = form.handleSubmit(async (values) => {
    if (saving) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 520));
    const title =
      values.title?.trim() ||
      `${values.taskType} · ${appointment?.studentName ?? 'Enquiry'}`;
    onSave({
      ...values,
      title,
      labels: values.labels ?? [],
      description: values.description ?? '',
    });
    setSaving(false);
    setSavedOk(true);
    await new Promise((r) => setTimeout(r, 700));
    setSavedOk(false);
    onClose();
  });

  const onSaveClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      key: Date.now(),
    });
    void submit();
  };

  const assigneeId = useId();
  const typeId = useId();
  const labelId = useId();
  const dateId = useId();
  const descId = useId();
  const { ref: descriptionRef, ...descriptionField } = form.register('description');

  return (
    <Modal
      open={open}
      title="Task"
      subtitle="Associate with enquiry record"
      onClose={onClose}
      wide
      autoHeight
      iconClose
      icon={<TaskIcon />}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <motion.button
            type="button"
            className="ui-btn ui-btn-primary appt-task-save-btn"
            onClick={onSaveClick}
            disabled={saving || savedOk}
            {...btnMotion}
          >
            {ripple ? (
              <span
                key={ripple.key}
                className="appt-ripple"
                style={{ left: ripple.x, top: ripple.y, width: 18, height: 18, marginLeft: -9, marginTop: -9 }}
                onAnimationEnd={() => setRipple(null)}
              />
            ) : null}
            <AnimatePresence mode="wait" initial={false}>
              {savedOk ? (
                <motion.span
                  key="ok"
                  className="appt-task-save-inner"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                >
                  <Check size={16} strokeWidth={2.5} />
                  Saved
                </motion.span>
              ) : saving ? (
                <motion.span
                  key="saving"
                  className="appt-task-save-inner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Loader2 size={16} className="appt-task-spin" />
                  Saving…
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  className="appt-task-save-inner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Save Task
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </>
      }
    >
      <div className="appt-task-modal">
        <div className="appt-task-enquiry">
          <Avatar name={displayName} />
          <div className="appt-task-enquiry-copy">
            <strong>{displayName}</strong>
            <span>Lead Owner : {leadOwner}</span>
          </div>
        </div>

        <div className="ui-grid-2 appt-task-grid">
          {/* Assigned To */}
          <div className="ui-field appt-dropdown-field" ref={assigneeRef}>
            <label className="ui-label" htmlFor={assigneeId}>
              Assigned To *
            </label>
            <button
              id={assigneeId}
              type="button"
              className={`ui-input appt-select-trigger appt-task-trigger${menu === 'assignee' ? ' is-open' : ''}`}
              aria-expanded={menu === 'assignee'}
              aria-haspopup="listbox"
              onClick={() => {
                setMenu((m) => (m === 'assignee' ? null : 'assignee'));
                setAddingType(false);
                setAddingLabel(false);
              }}
            >
              {selectedFaculty ? (
                <span className="appt-task-trigger-person">
                  <Avatar name={selectedFaculty.name} initials={selectedFaculty.initials} />
                  <span>{selectedFaculty.name}</span>
                </span>
              ) : assignedTo ? (
                <span>{assignedTo}</span>
              ) : (
                <span className="appt-task-placeholder">Select assignee</span>
              )}
              {assignedTo ? <Check size={16} className="appt-task-check" /> : <ChevronDown size={16} />}
            </button>
            <AnimatePresence>
              {menu === 'assignee' ? (
                <motion.div
                  className="appt-task-menu"
                  role="listbox"
                  {...dropdownMotion}
                >
                  <div className="appt-task-menu-search">
                    <Search size={14} aria-hidden />
                    <input
                      className="ui-input"
                      placeholder="Search staff…"
                      value={assigneeQuery}
                      onChange={(e) => setAssigneeQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="appt-task-menu-list">
                    {filteredFaculty.length ? (
                      filteredFaculty.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          role="option"
                          aria-selected={assignedTo === f.name}
                          className={`appt-task-option${assignedTo === f.name ? ' is-selected' : ''}`}
                          onClick={() => {
                            form.setValue('assignedTo', f.name, { shouldValidate: true });
                            closeMenus();
                          }}
                        >
                          <Avatar name={f.name} initials={f.initials} />
                          <span className="appt-task-option-copy">
                            <strong>{f.name}</strong>
                            <span>{f.department}</span>
                          </span>
                          {assignedTo === f.name ? <Check size={14} className="appt-task-check" /> : null}
                        </button>
                      ))
                    ) : (
                      <p className="appt-task-empty">No staff found</p>
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {form.formState.errors.assignedTo ? (
              <p className="appt-field-error">{form.formState.errors.assignedTo.message}</p>
            ) : null}
          </div>

          {/* Due Date */}
          <div className="ui-field">
            <label className="ui-label" htmlFor={dateId}>
              Due Date *
            </label>
            <div className="appt-task-date-wrap">
              <input
                id={dateId}
                type="date"
                className="ui-input appt-task-date"
                {...form.register('dueDate')}
              />
              <CalendarDays size={16} className="appt-task-date-icon" aria-hidden />
            </div>
            {form.formState.errors.dueDate ? (
              <p className="appt-field-error">{form.formState.errors.dueDate.message}</p>
            ) : null}
          </div>

          {/* Task Type */}
          <div className="ui-field appt-dropdown-field" ref={typeRef}>
            <label className="ui-label" htmlFor={typeId}>
              Task Type *
            </label>
            <button
              id={typeId}
              type="button"
              className={`ui-input appt-select-trigger appt-task-trigger${menu === 'type' ? ' is-open' : ''}`}
              aria-expanded={menu === 'type'}
              aria-haspopup="listbox"
              onClick={() => {
                setMenu((m) => (m === 'type' ? null : 'type'));
                setAddingLabel(false);
                setAddingType(false);
              }}
            >
              <span className={taskType ? undefined : 'appt-task-placeholder'}>
                {taskType || 'Select type'}
              </span>
              <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {menu === 'type' ? (
                <motion.div className="appt-task-menu" role="listbox" {...dropdownMotion}>
                  <div className="appt-task-menu-search">
                    <Search size={14} aria-hidden />
                    <input
                      className="ui-input"
                      placeholder="Search task types…"
                      value={typeQuery}
                      onChange={(e) => setTypeQuery(e.target.value)}
                      autoFocus={!addingType}
                    />
                  </div>
                  <div className="appt-task-menu-list">
                    {filteredTypes.length ? (
                      filteredTypes.map((t) => (
                        <button
                          key={t}
                          type="button"
                          role="option"
                          aria-selected={taskType === t}
                          className={`appt-task-option${taskType === t ? ' is-selected' : ''}`}
                          onClick={() => {
                            form.setValue('taskType', t, { shouldValidate: true });
                            closeMenus();
                          }}
                        >
                          <span>{t}</span>
                          {taskType === t ? <Check size={14} className="appt-task-check" /> : null}
                        </button>
                      ))
                    ) : (
                      <p className="appt-task-empty">No types found</p>
                    )}
                  </div>
                  <div className="appt-task-create-slot">
                    <AnimatePresence mode="wait" initial={false}>
                      {addingType ? (
                        <motion.div
                          key="type-form"
                          className="appt-task-inline-form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <label className="ui-label">Task Type Name</label>
                          <input
                            className="ui-input"
                            placeholder="Enter task type name"
                            value={newType}
                            onChange={(e) => setNewType(e.target.value)}
                            onKeyDown={onTypeKey}
                            autoFocus
                          />
                          <div className="appt-task-inline-actions">
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
                              onClick={createType}
                              disabled={!newType.trim()}
                            >
                              Create
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="type-add"
                          type="button"
                          className="appt-task-add-btn"
                          onClick={() => {
                            setAddingType(true);
                            setTypeQuery('');
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Plus size={15} />
                          Add New Task Type
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {form.formState.errors.taskType ? (
              <p className="appt-field-error">{form.formState.errors.taskType.message}</p>
            ) : null}
          </div>

          {/* Label */}
          <div className="ui-field appt-dropdown-field" ref={labelRef}>
            <label className="ui-label" htmlFor={labelId}>
              Label
            </label>
            <button
              id={labelId}
              type="button"
              className={`ui-input appt-select-trigger appt-task-trigger${menu === 'label' ? ' is-open' : ''}`}
              aria-expanded={menu === 'label'}
              aria-haspopup="listbox"
              onClick={() => {
                setMenu((m) => (m === 'label' ? null : 'label'));
                setAddingType(false);
                setAddingLabel(false);
              }}
            >
              {selectedLabelMeta ? (
                <span className="appt-task-trigger-person">
                  <span className="appt-label-dot" style={{ background: selectedLabelMeta.color }} />
                  <span>{selectedLabelMeta.name}</span>
                </span>
              ) : (
                <span className="appt-task-placeholder">Select label</span>
              )}
              <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {menu === 'label' ? (
                <motion.div className="appt-task-menu" role="listbox" {...dropdownMotion}>
                  <div className="appt-task-menu-search">
                    <Search size={14} aria-hidden />
                    <input
                      className="ui-input"
                      placeholder="Search labels…"
                      value={labelQuery}
                      onChange={(e) => setLabelQuery(e.target.value)}
                      autoFocus={!addingLabel}
                    />
                  </div>
                  <div className="appt-task-menu-list">
                    {filteredLabels.length ? (
                      filteredLabels.map((l) => (
                        <button
                          key={l.id}
                          type="button"
                          role="option"
                          aria-selected={selectedLabel === l.name}
                          className={`appt-task-option${selectedLabel === l.name ? ' is-selected' : ''}`}
                          onClick={() => {
                            form.setValue('labels', [l.name], { shouldValidate: true });
                            closeMenus();
                          }}
                        >
                          <span className="appt-label-dot" style={{ background: l.color }} />
                          <span>{l.name}</span>
                          {selectedLabel === l.name ? (
                            <Check size={14} className="appt-task-check" />
                          ) : null}
                        </button>
                      ))
                    ) : (
                      <p className="appt-task-empty">No labels found</p>
                    )}
                  </div>
                  <div className="appt-task-create-slot">
                    <AnimatePresence mode="wait" initial={false}>
                      {addingLabel ? (
                        <motion.div
                          key="label-form"
                          className="appt-task-inline-form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.18 }}
                        >
                          <label className="ui-label">Label Name</label>
                          <div className="appt-task-label-create-row">
                            <input
                              className="ui-input"
                              placeholder="Enter label name"
                              value={newLabel}
                              onChange={(e) => setNewLabel(e.target.value)}
                              onKeyDown={onLabelKey}
                              autoFocus
                            />
                            <input
                              type="color"
                              className="appt-color-input"
                              value={newLabelColor}
                              onChange={(e) => setNewLabelColor(e.target.value)}
                              aria-label="Label color"
                            />
                          </div>
                          <div className="appt-task-inline-actions">
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
                              onClick={createLabel}
                              disabled={!newLabel.trim()}
                            >
                              Create
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="label-add"
                          type="button"
                          className="appt-task-add-btn"
                          onClick={() => {
                            setAddingLabel(true);
                            setLabelQuery('');
                          }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Plus size={15} />
                          Add New Label
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        <div className="ui-field appt-task-desc-field">
          <label className="ui-label" htmlFor={descId}>
            Description
          </label>
          <textarea
            id={descId}
            className="ui-textarea appt-desc-area"
            placeholder="Enter task description..."
            maxLength={DESC_MAX}
            {...descriptionField}
            ref={(node) => {
              descRef.current = node;
              descriptionRef(node);
            }}
          />
          <div className="appt-char-count">
            {description.length}/{DESC_MAX}
          </div>
        </div>
      </div>
    </Modal>
  );
});
