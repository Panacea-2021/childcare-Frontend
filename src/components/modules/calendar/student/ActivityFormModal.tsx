'use client';

import { useEffect, useId, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { StudentActivity, StudentActivityFormState } from './types';
import { ACTIVITY_TYPE_OPTIONS } from './types';
import {
  activityToForm,
  emptyActivityForm,
  scheduleRooms,
  scheduleStaff,
} from './mockData';
import { StaffMultiSelect } from './StaffMultiSelect';

type Props = {
  open: boolean;
  editing: StudentActivity | null;
  initialDate: string;
  onClose: () => void;
  onSave: (form: StudentActivityFormState) => Promise<void> | void;
};

export function ActivityFormModal({ open, editing, initialDate, onClose, onSave }: Props) {
  const staffLabelId = useId();
  const [form, setForm] = useState<StudentActivityFormState>(() => emptyActivityForm(initialDate));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    setForm(editing ? activityToForm(editing) : emptyActivityForm(initialDate));
  }, [open, editing, initialDate]);

  const set = <K extends keyof StudentActivityFormState>(key: K, value: StudentActivityFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.date) next.date = 'Date is required';
    if (!form.startTime) next.startTime = 'Time is required';
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.type) next.type = 'Activity type is required';
    if (!form.room) next.room = 'Room is required';
    if (!form.durationMinutes || form.durationMinutes < 5) next.durationMinutes = 'Min 5 minutes';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit Schedule' : 'Add Schedule'}
      subtitle={editing ? 'Update classroom activity details' : 'Create a classroom activity entry'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <div className="ss-form mod-form-card">
        <h2>Activity details</h2>
        <p>Fill in the schedule information below.</p>

        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label" htmlFor="ss-form-date">
              Date
            </label>
            <input
              id="ss-form-date"
              type="date"
              className="ui-input"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
            {errors.date ? <p className="ss-form-error">{errors.date}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="ss-form-time">
              Time
            </label>
            <input
              id="ss-form-time"
              type="time"
              className="ui-input"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
            {errors.startTime ? <p className="ss-form-error">{errors.startTime}</p> : null}
          </div>

          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="ss-form-title">
              Title
            </label>
            <input
              id="ss-form-title"
              type="text"
              className="ui-input"
              placeholder="e.g. Morning Circle"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            {errors.title ? <p className="ss-form-error">{errors.title}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="ss-form-type">
              Activity Type
            </label>
            <select
              id="ss-form-type"
              className="ui-select"
              value={form.type}
              onChange={(e) => set('type', e.target.value as StudentActivityFormState['type'])}
            >
              <option value="">Select type</option>
              {ACTIVITY_TYPE_OPTIONS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.type ? <p className="ss-form-error">{errors.type}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="ss-form-room">
              Room
            </label>
            <select
              id="ss-form-room"
              className="ui-select"
              value={form.room}
              onChange={(e) => set('room', e.target.value)}
            >
              <option value="">Select room</option>
              {scheduleRooms.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.room ? <p className="ss-form-error">{errors.room}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="ss-form-duration">
              Duration (minutes)
            </label>
            <input
              id="ss-form-duration"
              type="number"
              min={5}
              step={5}
              className="ui-input"
              value={form.durationMinutes}
              onChange={(e) => set('durationMinutes', Number(e.target.value))}
            />
            {errors.durationMinutes ? <p className="ss-form-error">{errors.durationMinutes}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" id={staffLabelId}>
              Staff
            </label>
            <StaffMultiSelect
              staff={scheduleStaff}
              values={form.staffIds}
              onChange={(staffIds) => set('staffIds', staffIds)}
              labelledBy={staffLabelId}
            />
          </div>

          <div className="ui-field" style={{ gridColumn: '1 / -1' }}>
            <label className="ui-label" htmlFor="ss-form-notes">
              Description
            </label>
            <textarea
              id="ss-form-notes"
              className="ui-textarea"
              rows={3}
              placeholder="Optional notes for this activity"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
