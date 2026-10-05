'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { StaffInstallationRecord } from './types';
import { isDuplicateEmail, isValidEmail } from './mockData';

type Props = {
  open: boolean;
  record: StaffInstallationRecord | null;
  allRecords: StaffInstallationRecord[];
  onClose: () => void;
  onSave: (email: string, notes: string, sendInvite: boolean) => void;
};

export function EditStaffEmailModal({ open, record, allRecords, onClose, onSave }: Props) {
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open || !record) return;
    setEmail(record.email);
    setNotes('');
    setError(undefined);
  }, [open, record]);

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required.');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return false;
    }
    if (isDuplicateEmail(email, allRecords, record?.id)) {
      setError('This email is already used by another staff member.');
      return false;
    }
    setError(undefined);
    return true;
  };

  const submit = (sendInvite: boolean) => {
    if (!validate()) return;
    onSave(email.trim(), notes.trim(), sendInvite);
  };

  return (
    <Modal
      open={open && !!record}
      title="Edit Staff Email"
      subtitle={record ? `Update email for ${record.staffName}` : undefined}
      icon={<Mail size={18} />}
      elevated
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-secondary" onClick={() => submit(false)}>
            Save
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={() => submit(true)}>
            Save & Send Invitation
          </button>
        </>
      }
    >
      <motion.div
        className="pai-glass-form"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="ui-field">
          <label className="ui-label" htmlFor="sai-staff-email">
            Staff Email <span className="req">*</span>
          </label>
          <input
            id="sai-staff-email"
            className="ui-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!error}
          />
          {error ? <p className="pai-field-error">{error}</p> : null}
        </div>

        <div className="ui-field">
          <label className="ui-label" htmlFor="sai-email-notes">
            Optional Notes
          </label>
          <textarea
            id="sai-email-notes"
            className="ui-textarea"
            rows={3}
            placeholder="Optional notes for this update"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </motion.div>
    </Modal>
  );
}
