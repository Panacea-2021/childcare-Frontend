'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Student, StudentStatus } from '@/lib/center-management/types';
import {
  GENDER_OPTIONS,
  ROOM_OPTIONS,
  STUDENT_STATUSES,
  todayLabel,
} from '@/lib/center-management/studentsStore';
import { AppMultiSelect, AppSelect } from './ui';

type Props = {
  open: boolean;
  source: Student | null;
  onClose: () => void;
  onSave: (payload: {
    name: string;
    preferredName: string;
    gender: (typeof GENDER_OPTIONS)[number];
    status: StudentStatus;
    admissionDate: string;
    roomId: string;
    parentIds: string[];
    copyEmergency: boolean;
    copyPickup: boolean;
  }) => void;
};

export function AddSiblingModal({ open, source, onClose, onSave }: Props) {
  const [name, setName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState<StudentStatus>('Active');
  const [admissionDate, setAdmissionDate] = useState(todayLabel());
  const [setAsToday, setSetAsToday] = useState(true);
  const [roomId, setRoomId] = useState('');
  const [parentIds, setParentIds] = useState<string[]>([]);
  const [copyEmergency, setCopyEmergency] = useState(true);
  const [copyPickup, setCopyPickup] = useState(true);

  const parents = source?.parents ?? [];

  useEffect(() => {
    if (!open || !source) return;
    setName('');
    setPreferredName('');
    setGender('');
    setStatus('Active');
    setAdmissionDate(todayLabel());
    setSetAsToday(true);
    setRoomId(source.roomIds[0] ?? '');
    setParentIds(source.parents.map((p) => p.id));
    setCopyEmergency(true);
    setCopyPickup(true);
  }, [open, source]);

  const submit = () => {
    if (!name.trim() || !gender || !parentIds.length) return;
    onSave({
      name,
      preferredName,
      gender: gender as (typeof GENDER_OPTIONS)[number],
      status,
      admissionDate: setAsToday ? todayLabel() : admissionDate,
      roomId,
      parentIds,
      copyEmergency,
      copyPickup,
    });
  };

  return (
    <Modal
      open={open}
      title="Add Sibling"
      wide
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit}>
            Save
          </button>
        </>
      }
    >
      <div className="cm-modal-form">
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Student Name <span className="req">*</span>
            </label>
            <input
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name"
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">Preferred Name</label>
            <input
              className="ui-input"
              value={preferredName}
              onChange={(e) => setPreferredName(e.target.value)}
              placeholder="Preferred name"
            />
          </div>
        </div>
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">
              Gender <span className="req">*</span>
            </label>
            <AppSelect
              value={gender}
              onChange={setGender}
              placeholder="Gender"
              options={GENDER_OPTIONS.map((g) => ({ value: g, label: g }))}
            />
          </div>
          <div className="ui-field">
            <label className="ui-label">
              Status <span className="req">*</span>
            </label>
            <AppSelect
              value={status}
              onChange={(v) => setStatus(v as StudentStatus)}
              options={STUDENT_STATUSES.map((s) => ({ value: s, label: s }))}
            />
          </div>
        </div>
        <div className="ui-grid-2">
          <div className="ui-field">
            <label className="ui-label">Admission Date</label>
            <input
              className="ui-input"
              value={admissionDate}
              onChange={(e) => {
                setAdmissionDate(e.target.value);
                setSetAsToday(false);
              }}
            />
            <label className="cm-today">
              <input
                className="cm-check"
                type="checkbox"
                checked={setAsToday}
                onChange={(e) => {
                  setSetAsToday(e.target.checked);
                  if (e.target.checked) setAdmissionDate(todayLabel());
                }}
              />
              Set as Today
            </label>
          </div>
          <div className="ui-field">
            <label className="ui-label">Select Room</label>
            <AppSelect
              value={roomId}
              onChange={setRoomId}
              placeholder="Select Room"
              searchable
              options={ROOM_OPTIONS.map((r) => ({ value: r.id, label: r.name }))}
            />
          </div>
        </div>
        <div className="ui-field">
          <label className="ui-label">
            Select Parent <span className="req">*</span>
          </label>
          {parents.length ? (
            <AppMultiSelect
              values={parentIds}
              onChange={setParentIds}
              placeholder="Select parent"
              searchPlaceholder="Search parent"
              options={parents.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.role})`,
              }))}
            />
          ) : (
            <p className="cm-muted" style={{ margin: '6px 0 0' }}>
              No parents on this student to copy. Add Mother/Father first.
            </p>
          )}
        </div>
        <div className="cm-toggle-row">
          <span>Copy Emergency Contact</span>
          <button
            type="button"
            className={`cm-switch${copyEmergency ? ' is-on' : ''}`}
            aria-pressed={copyEmergency}
            onClick={() => setCopyEmergency((v) => !v)}
          />
        </div>
        <div className="cm-toggle-row">
          <span>Copy Authorized Pickup</span>
          <button
            type="button"
            className={`cm-switch${copyPickup ? ' is-on' : ''}`}
            aria-pressed={copyPickup}
            onClick={() => setCopyPickup((v) => !v)}
          />
        </div>
      </div>
    </Modal>
  );
}
