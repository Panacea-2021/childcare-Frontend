'use client';

import { memo, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  CALENDAR_OPTIONS,
  FACULTY,
  TIME_SLOTS,
  addMinutes,
} from '@/lib/appointments/mockData';
import type { AppointmentRecord } from '@/lib/appointments/types';
import { upsertAppointment } from '@/lib/appointments/appointmentsStore';

export type AppointmentFormPrefill = {
  childName?: string;
  parentName?: string;
  phone?: string;
  email?: string;
  gender?: string;
  facultyName?: string;
};

type FormState = {
  calendarId: string;
  date: string;
  startTime: string;
  facultyName: string;
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  gender: string;
  notes: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (record: AppointmentRecord) => void;
  prefill?: AppointmentFormPrefill | null;
  editing?: AppointmentRecord | null;
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formFromEditing(item: AppointmentRecord): FormState {
  return {
    calendarId: item.calendarId,
    date: item.date,
    startTime: item.startTime,
    facultyName: item.facultyName,
    parentName: item.parentName,
    phone: item.parentPhone ?? '',
    email: item.parentEmail ?? '',
    childName: item.studentName,
    gender: item.gender ?? '',
    notes: item.notes ?? '',
  };
}

function emptyForm(prefill?: AppointmentFormPrefill | null): FormState {
  return {
    calendarId: CALENDAR_OPTIONS[0]?.id ?? '',
    date: todayIso(),
    startTime: '10:30',
    facultyName: prefill?.facultyName || FACULTY[0]?.name || '',
    parentName: prefill?.parentName || '',
    phone: prefill?.phone || '',
    email: prefill?.email || '',
    childName: prefill?.childName || '',
    gender: prefill?.gender || '',
    notes: '',
  };
}

export const CreateAppointmentModal = memo(function CreateAppointmentModal({
  open,
  onClose,
  onSaved,
  prefill,
  editing = null,
}: Props) {
  const [form, setForm] = useState<FormState>(() => emptyForm(prefill));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    setForm(editing ? formFromEditing(editing) : emptyForm(prefill));
  }, [open, prefill, editing]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const slots = useMemo(
    () => [...TIME_SLOTS.Morning, ...TIME_SLOTS.Afternoon, ...TIME_SLOTS.Evening],
    [],
  );

  const calendar = CALENDAR_OPTIONS.find((c) => c.id === form.calendarId);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.calendarId) next.calendarId = 'Select a calendar';
    if (!form.date) next.date = 'Date is required';
    if (!form.startTime) next.startTime = 'Time is required';
    if (!form.facultyName) next.facultyName = 'Assign faculty';
    if (!form.parentName.trim()) next.parentName = 'Parent name is required';
    if (!form.phone.trim() || form.phone.trim().length < 8) next.phone = 'Valid phone is required';
    if (!form.childName.trim()) next.childName = 'Child name is required';
    if (!form.gender) next.gender = 'Gender is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 380));
      const duration = calendar?.bookingDurationMin ?? 30;
      const record: AppointmentRecord = {
        id: editing?.id ?? `a-${Date.now()}`,
        studentName: form.childName.trim(),
        parentName: form.parentName.trim(),
        parentPhone: form.phone.trim(),
        parentEmail: form.email.trim() || undefined,
        facultyName: form.facultyName,
        calendarId: form.calendarId,
        calendarName: calendar?.name ?? 'Calendar',
        date: form.date,
        startTime: form.startTime,
        endTime: addMinutes(form.startTime, duration),
        appointmentType: calendar?.meetingType ?? editing?.appointmentType ?? 'Campus Tour',
        status: editing?.status ?? 'Scheduled',
        priority: editing?.priority ?? 'medium',
        audience: editing?.audience ?? 'enquiry',
        notes: form.notes.trim() || undefined,
        gender: form.gender,
        course: editing?.course,
        campus: editing?.campus,
        batch: editing?.batch,
        repeat: editing?.repeat ?? 'never',
        taskCount: editing?.taskCount ?? 0,
        createdAt: editing?.createdAt ?? todayIso(),
      };
      upsertAppointment(record);
      onSaved(record);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={editing ? 'Edit Appointment' : 'New Appointment'}
      subtitle={editing ? 'Update tour booking details' : 'Schedule a campus tour or visit'}
      onClose={onClose}
      wide
      autoHeight
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Appointment'}
          </button>
        </>
      }
    >
      <div className="mod-form-card appt-modal-form">
        <h2>Appointment details</h2>
        <p>Fill in the booking information below.</p>

        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-calendar">
              Calendar *
            </label>
            <select
              id="appt-form-calendar"
              className="ui-select"
              value={form.calendarId}
              onChange={(e) => set('calendarId', e.target.value)}
            >
              {CALENDAR_OPTIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.calendarId ? <p className="appt-field-error">{errors.calendarId}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-faculty">
              Faculty *
            </label>
            <select
              id="appt-form-faculty"
              className="ui-select"
              value={form.facultyName}
              onChange={(e) => set('facultyName', e.target.value)}
            >
              {FACULTY.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name} · {f.department}
                </option>
              ))}
            </select>
            {errors.facultyName ? <p className="appt-field-error">{errors.facultyName}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-date">
              Date *
            </label>
            <input
              id="appt-form-date"
              type="date"
              className="ui-input"
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
            />
            {errors.date ? <p className="appt-field-error">{errors.date}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-time">
              Start Time *
            </label>
            <select
              id="appt-form-time"
              className="ui-select"
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            >
              {slots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.startTime ? <p className="appt-field-error">{errors.startTime}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-parent">
              Parent / Client Name *
            </label>
            <input
              id="appt-form-parent"
              className="ui-input"
              value={form.parentName}
              onChange={(e) => set('parentName', e.target.value)}
              placeholder="Parent name"
            />
            {errors.parentName ? <p className="appt-field-error">{errors.parentName}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-phone">
              Phone *
            </label>
            <input
              id="appt-form-phone"
              className="ui-input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="Phone number"
            />
            {errors.phone ? <p className="appt-field-error">{errors.phone}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-child">
              Child Name *
            </label>
            <input
              id="appt-form-child"
              className="ui-input"
              value={form.childName}
              onChange={(e) => set('childName', e.target.value)}
              placeholder="Student name"
            />
            {errors.childName ? <p className="appt-field-error">{errors.childName}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-gender">
              Child Gender *
            </label>
            <select
              id="appt-form-gender"
              className="ui-select"
              value={form.gender}
              onChange={(e) => set('gender', e.target.value)}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer Not to Say">Prefer Not to Say</option>
            </select>
            {errors.gender ? <p className="appt-field-error">{errors.gender}</p> : null}
          </div>

          <div className="ui-field">
            <label className="ui-label" htmlFor="appt-form-email">
              Email (Optional)
            </label>
            <input
              id="appt-form-email"
              type="email"
              className="ui-input"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="parent@email.com"
            />
          </div>

          <div className="ui-field appt-span-2">
            <label className="ui-label" htmlFor="appt-form-notes">
              Notes (Optional)
            </label>
            <textarea
              id="appt-form-notes"
              className="ui-textarea"
              rows={3}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any preferences or talking points…"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
});
