'use client';

import { memo } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { AppointmentRecord } from '@/lib/appointments/types';

type Props = {
  open: boolean;
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onEdit?: (item: AppointmentRecord) => void;
  onTask?: (item: AppointmentRecord) => void;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="ui-field">
      <label className="ui-label">{label}</label>
      <input className="ui-input" value={value || '—'} readOnly disabled />
    </div>
  );
}

export const AppointmentDetailsModal = memo(function AppointmentDetailsModal({
  open,
  appointment,
  onClose,
  onEdit,
  onTask,
}: Props) {
  if (!appointment) {
    return (
      <Modal open={open} title="Appointment" onClose={onClose}>
        <p className="appt-muted">No appointment selected.</p>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="Appointment details"
      subtitle={`${appointment.studentName} · ${appointment.date}`}
      onClose={onClose}
      wide
      autoHeight
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Close
          </button>
          {onTask ? (
            <button type="button" className="ui-btn ui-btn-outline" onClick={() => onTask(appointment)}>
              Task
            </button>
          ) : null}
          {onEdit ? (
            <button type="button" className="ui-btn ui-btn-primary" onClick={() => onEdit(appointment)}>
              Edit
            </button>
          ) : null}
        </>
      }
    >
      <div className="mod-form-card appt-modal-form">
        <h2>Tour appointment</h2>
        <p>All fields are read-only. Use Edit to make changes.</p>
        <div className="ui-grid-2">
          <Field label="Student" value={appointment.studentName} />
          <Field label="Parent" value={appointment.parentName} />
          <Field label="Phone" value={appointment.parentPhone ?? ''} />
          <Field label="Email" value={appointment.parentEmail ?? ''} />
          <Field label="Faculty" value={appointment.facultyName} />
          <Field label="Calendar" value={appointment.calendarName} />
          <Field label="Date" value={appointment.date} />
          <Field label="Time" value={`${appointment.startTime} – ${appointment.endTime}`} />
          <Field label="Type" value={appointment.appointmentType} />
          <Field label="Status" value={appointment.status} />
          <Field label="Priority" value={appointment.priority} />
          <Field label="Audience" value={appointment.audience} />
          <Field label="Gender" value={appointment.gender ?? ''} />
          <Field label="Campus" value={appointment.campus ?? ''} />
          <Field label="Course" value={appointment.course ?? ''} />
          <Field label="Tasks" value={String(appointment.taskCount)} />
          <div className="ui-field appt-span-2">
            <label className="ui-label">Notes</label>
            <textarea
              className="ui-textarea"
              rows={3}
              value={appointment.notes ?? ''}
              readOnly
              disabled
            />
          </div>
        </div>
      </div>
    </Modal>
  );
});
