'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Bell, XCircle } from 'lucide-react';
import { formatInr, type CenterInvoice } from '@/lib/billing-accounting/invoiceStore';

type ConfirmProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function FeeReminderConfirmModal({ open, busy, onClose, onConfirm }: ConfirmProps) {
  return (
    <Modal
      open={open}
      title="Are you sure ?"
      onClose={busy ? () => undefined : onClose}
      icon={
        <span className="ivd-action-modal-icon" aria-hidden>
          <Bell size={18} />
        </span>
      }
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            No
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={onConfirm} disabled={busy}>
            {busy ? 'Sending…' : 'Yes'}
          </button>
        </>
      }
    >
      <p className="ivd-action-modal-copy">Confirm to send reminder</p>
    </Modal>
  );
}

type BulkRemindProps = {
  open: boolean;
  busy?: boolean;
  mode: 'overdue' | 'unpaid';
  invoices: CenterInvoice[];
  onClose: () => void;
  onConfirm: () => void;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Illumine-style list: students who'll receive the bulk fee reminder. */
export function BulkFeeReminderModal({
  open,
  busy,
  mode,
  invoices,
  onClose,
  onConfirm,
}: BulkRemindProps) {
  const title =
    mode === 'overdue'
      ? 'Students list to send fee reminder'
      : 'Students list to send fee reminder';
  const subtitle =
    mode === 'overdue'
      ? `${invoices.length} overdue invoice${invoices.length === 1 ? '' : 's'} with outstanding balances`
      : `${invoices.length} unpaid invoice${invoices.length === 1 ? '' : 's'} with outstanding balances`;

  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? () => undefined : onClose}
      wide
      icon={
        <span className="ivd-action-modal-icon bi-remind-modal-icon" aria-hidden>
          <Bell size={18} />
        </span>
      }
      footer={
        <>
          <button
            type="button"
            className="ui-btn ui-btn-outline bi-remind-cancel"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={onConfirm}
            disabled={busy || invoices.length === 0}
          >
            {busy ? 'Sending…' : 'Send'}
          </button>
        </>
      }
    >
      <p className="bi-remind-subtitle">{subtitle}</p>
      {invoices.length === 0 ? (
        <div className="bi-remind-empty">
          <Bell size={22} aria-hidden />
          <strong>No matching invoices</strong>
          <span>There is nothing to remind for this selection right now.</span>
        </div>
      ) : (
        <ul className="bi-remind-list">
          {invoices.map((inv, i) => (
            <li
              key={inv.id}
              className="bi-remind-row"
              style={{ animationDelay: `${40 + i * 45}ms` }}
            >
              <span className="bi-remind-avatar" aria-hidden>
                {inv.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inv.photoUrl} alt="" />
                ) : (
                  initials(inv.studentName)
                )}
              </span>
              <div className="bi-remind-meta">
                <strong>{inv.studentName}</strong>
                <span>
                  Invoice <em>{inv.invoiceId}</em>
                  <span className="bi-remind-sep" aria-hidden>
                    ·
                  </span>
                  Pending {formatInr(inv.pendingAmount)}
                </span>
              </div>
              <span className={`bi-badge ${inv.status === 'Overdue' ? 'is-overdue' : 'is-due'}`}>
                {inv.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

type CancelProps = {
  open: boolean;
  busy?: boolean;
  invoiceLabel: string;
  onClose: () => void;
  onConfirm: (note: string) => void;
};

export function CancelInvoiceModal({
  open,
  busy,
  invoiceLabel,
  onClose,
  onConfirm,
}: CancelProps) {
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setNote('');
      setError(null);
    }
  }, [open]);

  const close = () => {
    if (busy) return;
    onClose();
  };

  const submit = () => {
    const value = note.trim();
    if (!value) {
      setError('Please leave a note before cancelling.');
      return;
    }
    onConfirm(value);
  };

  return (
    <Modal
      open={open}
      title={`Are you sure you want to cancel ${invoiceLabel}?`}
      onClose={close}
      icon={
        <span className="ivd-action-modal-icon is-danger" aria-hidden>
          <XCircle size={18} />
        </span>
      }
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={close} disabled={busy}>
            No
          </button>
          <button type="button" className="ui-btn ui-btn-danger" onClick={submit} disabled={busy}>
            {busy ? 'Cancelling…' : 'Yes'}
          </button>
        </>
      }
    >
      <div className="ui-field">
        <label className="ui-label" htmlFor="cancel-invoice-note">
          NOTE <span className="ivd-req">*</span>
        </label>
        <textarea
          id="cancel-invoice-note"
          className="ui-textarea"
          rows={4}
          value={note}
          maxLength={500}
          placeholder="Leave a note"
          onChange={(e) => {
            setNote(e.target.value);
            if (error) setError(null);
          }}
          disabled={busy}
        />
        {error ? <p className="ivd-action-modal-error">{error}</p> : null}
      </div>
    </Modal>
  );
}
