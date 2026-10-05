'use client';

import { memo, useEffect, useId, useState } from 'react';
import { Ban } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { TaskRecord } from '@/lib/tasks/types';

type Props = {
  open: boolean;
  task: TaskRecord | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export const CancelTaskModal = memo(function CancelTaskModal({
  open,
  task,
  onClose,
  onConfirm,
}: Props) {
  const reasonId = useId();
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setReason('');
    setError('');
  }, [open, task?.id]);

  const submit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please enter a cancellation reason');
      return;
    }
    onConfirm(trimmed);
  };

  return (
    <Modal
      open={open}
      title="Cancel Task"
      subtitle={task ? `Provide a reason for cancelling “${task.name}”` : undefined}
      onClose={onClose}
      icon={<Ban size={18} />}
      iconClose
      autoHeight
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Keep Task
          </button>
          <button type="button" className="ui-btn ui-btn-danger" onClick={submit}>
            Cancel Task
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label" htmlFor={reasonId}>
          Reason <span className="req">*</span>
        </label>
        <textarea
          id={reasonId}
          className={`ui-textarea${error ? ' is-invalid' : ''}`}
          rows={4}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
          placeholder="Explain why this task is being cancelled…"
        />
        {error ? <p className="tm-field-error">{error}</p> : null}
      </div>
    </Modal>
  );
});
