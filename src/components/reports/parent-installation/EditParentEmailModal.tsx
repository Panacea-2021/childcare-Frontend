'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { InstallationRecord } from './types';
import { isValidEmail } from './mockData';

type Props = {
  open: boolean;
  record: InstallationRecord | null;
  onClose: () => void;
  onSave: (motherEmail: string, fatherEmail: string, notes: string, sendInvite: boolean) => void;
};

export function EditParentEmailModal({ open, record, onClose, onSave }: Props) {
  const reduce = useReducedMotion();
  const [motherEmail, setMotherEmail] = useState('');
  const [fatherEmail, setFatherEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ mother?: string; father?: string; duplex?: string }>({});

  useEffect(() => {
    if (!open || !record) return;
    setMotherEmail(record.mother.email);
    setFatherEmail(record.father.email);
    setNotes('');
    setErrors({});
  }, [open, record]);

  const validate = () => {
    const next: typeof errors = {};
    if (!motherEmail.trim()) next.mother = 'Mother email is required.';
    else if (!isValidEmail(motherEmail)) next.mother = 'Enter a valid mother email.';
    if (!fatherEmail.trim()) next.father = 'Father email is required.';
    else if (!isValidEmail(fatherEmail)) next.father = 'Enter a valid father email.';
    if (
      motherEmail.trim() &&
      fatherEmail.trim() &&
      motherEmail.trim().toLowerCase() === fatherEmail.trim().toLowerCase()
    ) {
      next.duplex = 'Mother and father emails must be different.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (sendInvite: boolean) => {
    if (!validate()) return;
    onSave(motherEmail.trim(), fatherEmail.trim(), notes.trim(), sendInvite);
  };

  const btnHover = reduce ? undefined : { scale: 1.03 };
  const btnTap = reduce ? undefined : { scale: 0.97 };

  return (
    <Modal
      open={open && !!record}
      title="Edit Parent Email"
      subtitle={record ? `Update emails for ${record.studentName}` : undefined}
      icon={<Mail size={18} />}
      elevated
      onClose={onClose}
      footer={
        <>
          <m.button
            type="button"
            className="ui-btn ui-btn-outline transition-all duration-200"
            onClick={onClose}
            whileHover={btnHover}
            whileTap={btnTap}
          >
            Cancel
          </m.button>
          <m.button
            type="button"
            className="ui-btn ui-btn-secondary transition-all duration-200"
            onClick={() => submit(false)}
            whileHover={btnHover}
            whileTap={btnTap}
          >
            Save
          </m.button>
          <m.button
            type="button"
            className="ui-btn ui-btn-primary transition-all duration-200"
            onClick={() => submit(true)}
            whileHover={btnHover}
            whileTap={btnTap}
          >
            Save & Send Invitation
          </m.button>
        </>
      }
    >
      <AnimatePresence mode="wait">
        {record ? (
          <m.div
            key={record.id}
            className="pai-glass-form"
            initial={reduce ? false : { opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="ui-grid-2">
              <div className="ui-field">
                <label className="ui-label" htmlFor="pai-mother-email">
                  Mother Email <span className="req">*</span>
                </label>
                <m.input
                  id="pai-mother-email"
                  className="ui-input pai-input-glow"
                  type="email"
                  value={motherEmail}
                  onChange={(e) => setMotherEmail(e.target.value)}
                  aria-invalid={!!errors.mother}
                  whileFocus={reduce ? undefined : { scale: 1.01 }}
                />
                {errors.mother ? <p className="pai-field-error">{errors.mother}</p> : null}
              </div>
              <div className="ui-field">
                <label className="ui-label" htmlFor="pai-father-email">
                  Father Email <span className="req">*</span>
                </label>
                <m.input
                  id="pai-father-email"
                  className="ui-input pai-input-glow"
                  type="email"
                  value={fatherEmail}
                  onChange={(e) => setFatherEmail(e.target.value)}
                  aria-invalid={!!errors.father}
                  whileFocus={reduce ? undefined : { scale: 1.01 }}
                />
                {errors.father ? <p className="pai-field-error">{errors.father}</p> : null}
              </div>
            </div>

            <div className="ui-field">
              <label className="ui-label" htmlFor="pai-email-notes">
                Optional Notes
              </label>
              <m.textarea
                id="pai-email-notes"
                className="ui-textarea pai-input-glow"
                rows={3}
                placeholder="Optional notes for this update"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                whileFocus={reduce ? undefined : { scale: 1.01 }}
              />
            </div>

            {errors.duplex ? <p className="pai-field-error">{errors.duplex}</p> : null}
          </m.div>
        ) : null}
      </AnimatePresence>
    </Modal>
  );
}
