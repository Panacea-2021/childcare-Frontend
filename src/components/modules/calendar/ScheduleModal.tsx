'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlignLeft,
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Layers,
  Tag,
  UserRound,
  X,
} from 'lucide-react';
import type { ScheduleFormState, ScheduleShift, ScheduleStaff, ShiftStatus, ShiftType } from './types';
import { WEEKDAY_OPTIONS } from './types';
import { parseISODate, scheduleCategories, scheduleLessons, scheduleRooms } from './mockData';
import { PremiumSelect } from './PremiumSelect';
import { PremiumDateField } from './PremiumDateField';
import { PremiumTimeField } from './PremiumTimeField';

type Props = {
  open: boolean;
  onClose: () => void;
  staff: ScheduleStaff[];
  initialDate: string;
  /** When set, modal opens in edit mode for this shift. */
  editingShift?: ScheduleShift | null;
  onSave: (form: ScheduleFormState, editingId?: string) => Promise<void> | void;
};

const DAY_IDS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const emptyForm = (): ScheduleFormState => ({
  title: '',
  startDate: '',
  endDate: '',
  startTime: '',
  endTime: '',
  staffId: '',
  category: '',
  lesson: '',
  daysOfWeek: [],
  room: '',
  notes: '',
  status: '',
  shiftType: '',
});

function formFromShift(shift: ScheduleShift): ScheduleFormState {
  const dayId = DAY_IDS[parseISODate(shift.date).getDay()] ?? 'mon';
  return {
    title: shift.title,
    startDate: shift.date,
    endDate: shift.date,
    startTime: shift.startTime,
    endTime: shift.endTime,
    staffId: shift.staffId,
    category: shift.category,
    lesson: shift.lesson,
    daysOfWeek: [dayId],
    room: shift.room,
    notes: shift.notes ?? '',
    status: shift.status,
    shiftType: shift.shiftType,
  };
}

function FloatingText({
  id,
  label,
  icon,
  error,
  className = '',
  children,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`cal-float-field ${className}`}>
      <div className="cal-float-shell">
        <span className="cal-float-icon" aria-hidden>
          {icon}
        </span>
        <div className="cal-float-control">
          {children}
          <label htmlFor={id} className="cal-float-label">
            {label}
          </label>
        </div>
      </div>
      {error ? <p className="cal-field-error">{error}</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  icon,
  children,
  delay = 0,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      className="cal-form-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.28 }}
      whileHover={{ y: -1 }}
    >
      <header className="cal-form-section-head">
        <motion.span
          className="cal-form-section-ico"
          aria-hidden
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
        >
          {icon}
        </motion.span>
        <h3>{title}</h3>
      </header>
      <div className="cal-form-section-body">{children}</div>
    </motion.section>
  );
}

export function ScheduleModal({ open, onClose, staff, editingShift = null, onSave }: Props) {
  const titleId = useId();
  const [form, setForm] = useState<ScheduleFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isEdit = Boolean(editingShift);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setForm(editingShift ? formFromShift(editingShift) : emptyForm());
      setErrors({});
      setSaving(false);
      setSaved(false);
    }
  }, [open, editingShift]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const set = <K extends keyof ScheduleFormState>(key: K, value: ScheduleFormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const toggleDay = (id: string) => {
    setForm((f) => ({
      ...f,
      daysOfWeek: f.daysOfWeek.includes(id) ? f.daysOfWeek.filter((d) => d !== id) : [...f.daysOfWeek, id],
    }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Shift name is required';
    if (!form.shiftType) next.shiftType = 'Select shift type';
    if (!form.status) next.status = 'Select status';
    if (!form.startDate) next.startDate = 'Select start date';
    if (!isEdit && !form.endDate) next.endDate = 'Select repeat till date';
    if (!form.startTime) next.startTime = 'Select start time';
    if (!form.endTime) next.endTime = 'Select end time';
    if (!form.staffId) next.staffId = 'Select staff';
    if (!form.room) next.room = 'Select room';
    if (!isEdit && !form.daysOfWeek.length) next.daysOfWeek = 'Select at least one day';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave(form, editingShift?.id);
      setSaved(true);
      await new Promise((r) => setTimeout(r, 450));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="cal-dialog-backdrop"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onClose}
        >
          <motion.div
            className="cal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cal-dialog-header">
              <div className="cal-dialog-title-block">
                <span className="cal-dialog-emoji" aria-hidden>
                  📅
                </span>
                <div>
                  <h2 id={titleId}>{isEdit ? 'Edit Staff Schedule' : 'Add Staff Schedule'}</h2>
                  <p>{isEdit ? 'Update this staff shift' : 'Create a new staff schedule'}</p>
                </div>
              </div>
              <button type="button" className="cal-dialog-close" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            </header>

            <div className="cal-dialog-body">
              <SectionCard title="Shift Information" icon={<Layers size={15} />} delay={0.04}>
                <div className="cal-modal-grid">
                  <FloatingText id="shift-name" label="Shift Name *" icon={<Tag size={16} />} error={errors.title} className="cal-span-2">
                    <input
                      id="shift-name"
                      className="cal-float-input"
                      placeholder=" "
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                      aria-invalid={Boolean(errors.title)}
                    />
                  </FloatingText>
                  <PremiumSelect
                    id="shift-type"
                    placeholder="Select Shift Type"
                    icon={<Clock3 size={16} />}
                    value={form.shiftType}
                    error={errors.shiftType}
                    onChange={(v) => set('shiftType', v as ShiftType | '')}
                    options={[
                      { value: 'morning', label: 'Morning' },
                      { value: 'afternoon', label: 'Afternoon' },
                      { value: 'evening', label: 'Evening' },
                    ]}
                  />
                  <PremiumSelect
                    id="status"
                    placeholder="Select Status"
                    icon={<CheckCircle2 size={16} />}
                    value={form.status}
                    error={errors.status}
                    onChange={(v) => set('status', v as ShiftStatus | '')}
                    options={[
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Schedule Information" icon={<CalendarRange size={15} />} delay={0.08}>
                <div className="cal-modal-grid">
                  <PremiumDateField
                    id="start-date"
                    className={isEdit ? 'cal-span-2' : undefined}
                    placeholder="Select Date"
                    value={form.startDate}
                    error={errors.startDate}
                    onChange={(v) => {
                      set('startDate', v);
                      if (isEdit) set('endDate', v);
                    }}
                  />
                  {!isEdit ? (
                    <PremiumDateField
                      id="end-date"
                      placeholder="Select Date"
                      value={form.endDate}
                      error={errors.endDate}
                      onChange={(v) => set('endDate', v)}
                    />
                  ) : null}
                  <PremiumTimeField
                    id="start-time"
                    placeholder="Select Time"
                    value={form.startTime}
                    error={errors.startTime}
                    onChange={(v) => set('startTime', v)}
                  />
                  <PremiumTimeField
                    id="end-time"
                    placeholder="Select Time"
                    value={form.endTime}
                    error={errors.endTime}
                    onChange={(v) => set('endTime', v)}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Assignment" icon={<UserRound size={15} />} delay={0.12}>
                <div className="cal-modal-grid">
                  <PremiumSelect
                    id="select-staff"
                    className="cal-span-2"
                    placeholder="Select Staff"
                    icon={<UserRound size={16} />}
                    value={form.staffId}
                    error={errors.staffId}
                    searchable
                    onChange={(v) => set('staffId', v)}
                    options={staff.map((s) => ({ value: s.id, label: `${s.name} — ${s.role}` }))}
                  />
                  <PremiumSelect
                    id="category"
                    placeholder="Select Category"
                    icon={<Layers size={16} />}
                    value={form.category}
                    onChange={(v) => set('category', v)}
                    options={scheduleCategories.map((c) => ({ value: c, label: c }))}
                  />
                  <PremiumSelect
                    id="lesson"
                    placeholder="Select Lesson"
                    icon={<BookOpen size={16} />}
                    value={form.lesson}
                    onChange={(v) => set('lesson', v)}
                    options={scheduleLessons.map((l) => ({ value: l, label: l }))}
                  />
                  <PremiumSelect
                    id="room"
                    className="cal-span-2"
                    placeholder="Select Room"
                    icon={<Layers size={16} />}
                    value={form.room}
                    error={errors.room}
                    onChange={(v) => set('room', v)}
                    options={scheduleRooms.map((r) => ({ value: r, label: r }))}
                  />
                  <FloatingText id="notes" label="Notes" icon={<AlignLeft size={16} />} className="cal-span-2">
                    <textarea
                      id="notes"
                      className={`cal-float-input cal-float-textarea ${form.notes ? 'has-value' : ''}`}
                      rows={3}
                      placeholder=" "
                      value={form.notes}
                      onChange={(e) => set('notes', e.target.value)}
                    />
                  </FloatingText>
                </div>
              </SectionCard>

              {!isEdit ? (
                <SectionCard title="Repeat Options" icon={<CalendarDays size={15} />} delay={0.16}>
                  <span className="cal-days-label" id="days-label">
                    Select Days
                  </span>
                  <div className="cal-days" role="group" aria-labelledby="days-label">
                    {WEEKDAY_OPTIONS.map((d) => {
                      const on = form.daysOfWeek.includes(d.id);
                      return (
                        <motion.button
                          key={d.id}
                          type="button"
                          className={`cal-day-chip ${on ? 'is-on' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggleDay(d.id)}
                          whileTap={{ scale: 0.94 }}
                        >
                          {d.label}
                        </motion.button>
                      );
                    })}
                  </div>
                  {errors.daysOfWeek ? <p className="cal-field-error">{errors.daysOfWeek}</p> : null}
                </SectionCard>
              ) : null}
            </div>

            <footer className="cal-dialog-footer">
              <button type="button" className="cal-btn-ghost" onClick={onClose} disabled={saving}>
                Cancel
              </button>
              <button type="button" className="cal-btn-save" onClick={submit} disabled={saving}>
                <span className="cal-btn-save-shine" aria-hidden />
                {saving ? (
                  <span className="cal-saving">
                    <span className="cal-spinner" aria-hidden />
                    Saving…
                  </span>
                ) : saved ? (
                  'Saved ✓'
                ) : isEdit ? (
                  'Update Schedule'
                ) : (
                  'Save Schedule'
                )}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
