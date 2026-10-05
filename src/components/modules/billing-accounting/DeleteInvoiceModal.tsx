'use client';

import { Modal } from '@/components/ui/Modal';
import { Trash2 } from 'lucide-react';

type Props = {
  open: boolean;
  invoiceLabel: string;
  studentName?: string;
  count?: number;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteInvoiceModal({
  open,
  invoiceLabel,
  studentName,
  count = 1,
  busy = false,
  onClose,
  onConfirm,
}: Props) {
  const multi = count > 1;
  return (
    <Modal
      open={open}
      title="Are you sure ?"
      onClose={busy ? () => undefined : onClose}
      icon={
        <span className="bi-delete-icon" aria-hidden>
          <Trash2 size={18} />
        </span>
      }
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : multi ? `Delete ${count}` : 'Delete'}
          </button>
        </>
      }
    >
      <p className="bi-delete-copy">
        {multi ? (
          <>
            You are about to permanently delete <strong>{count} invoices</strong>. This action cannot be
            undone.
          </>
        ) : (
          <>
            You are about to permanently delete invoice <strong>{invoiceLabel}</strong>
            {studentName ? (
              <>
                {' '}
                for <strong>{studentName}</strong>
              </>
            ) : null}
            . This action cannot be undone.
          </>
        )}
      </p>
    </Modal>
  );
}
