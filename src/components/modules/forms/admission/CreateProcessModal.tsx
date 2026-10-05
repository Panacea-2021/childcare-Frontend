'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, GitBranchPlus, Layers3, ToggleLeft } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ProcessStatus } from './types';

export type ProcessFormPayload = {
  name: string;
  dueDate: string;
  status: ProcessStatus;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: ProcessFormPayload) => void;
  /** When set, modal opens in update mode with prefilled fields. */
  initial?: {
    name: string;
    dueDate?: string;
    status: ProcessStatus;
  } | null;
};

/** Convert stored `DD/MM/YYYY` or ISO `YYYY-MM-DD` into `<input type="date">` value. */
function toDateInputValue(raw?: string): string {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const slash = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;
  return '';
}

export function CreateProcessModal({ open, onClose, onSave, initial = null }: Props) {
  const isEdit = Boolean(initial);
  const [name, setName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ProcessStatus | ''>('');

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDueDate(toDateInputValue(initial.dueDate));
      setStatus(initial.status);
    } else {
      setName('');
      setDueDate('');
      setStatus('');
    }
  }, [open, initial]);

  const canSave = Boolean(name.trim() && status);

  return (
    <Modal
      open={open}
      title={isEdit ? 'Update Process' : 'Create a New Process'}
      subtitle={
        isEdit
          ? 'Adjust process details and keep admissions on track'
          : 'Define a named admission workflow for your center'
      }
      icon={<GitBranchPlus size={18} />}
      wide
      autoHeight
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!canSave}
            onClick={() => {
              if (!canSave || !status) return;
              onSave({ name: name.trim(), dueDate, status });
            }}
          >
            {isEdit ? 'Save Changes' : 'Save & Complete'}
          </button>
        </>
      }
    >
      <div className="ap-modal-stack">
        <motion.section
          className="ap-modal-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <header className="ap-modal-section-head">
            <span className="ap-modal-section-ico" aria-hidden>
              <Layers3 size={15} />
            </span>
            <h3>Process Information</h3>
          </header>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ap-process-name">
              Process Name <em>*</em>
            </label>
            <input
              id="ap-process-name"
              className="ui-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring 2026 Admissions"
              autoFocus
            />
          </div>
        </motion.section>

        <motion.section
          className="ap-modal-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.28 }}
        >
          <header className="ap-modal-section-head">
            <span className="ap-modal-section-ico" aria-hidden>
              <CalendarDays size={15} />
            </span>
            <h3>Schedule</h3>
          </header>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ap-due-date">
              Due Date (optional)
            </label>
            <input
              id="ap-due-date"
              className="ui-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </motion.section>

        <motion.section
          className="ap-modal-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.28 }}
        >
          <header className="ap-modal-section-head">
            <span className="ap-modal-section-ico" aria-hidden>
              <ToggleLeft size={15} />
            </span>
            <h3>Publishing</h3>
          </header>
          <div className="ui-field">
            <label className="ui-label" htmlFor="ap-status">
              Status <em>*</em>
            </label>
            <select
              id="ap-status"
              className="ui-select"
              value={status}
              onChange={(e) => setStatus((e.target.value || '') as ProcessStatus | '')}
            >
              <option value="">Please select status</option>
              <option value="Live">Live</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </motion.section>
      </div>
    </Modal>
  );
}
