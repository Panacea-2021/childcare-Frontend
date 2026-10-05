'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AppSelect } from '@/components/modules/center-management/ui';
import {
  formatInr,
  type CenterInvoice,
  type InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';

const REFUND_MODES = [
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Card', label: 'Card' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Other', label: 'Other' },
];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type RefundProps = {
  open: boolean;
  busy?: boolean;
  invoice: CenterInvoice;
  onClose: () => void;
  onConfirm: (input: {
    amount: number;
    mode: string;
    date: string;
    reference?: string;
    addAsCredit: boolean;
  }) => void;
};

export function RefundInvoiceModal({ open, busy, invoice, onClose, onConfirm }: RefundProps) {
  const [amount, setAmount] = useState(String(invoice.paidAmount || 0));
  const [mode, setMode] = useState('');
  const [date, setDate] = useState(todayIso());
  const [addAsCredit, setAddAsCredit] = useState(false);
  const [reference, setReference] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setAmount(String(invoice.paidAmount || 0));
    setMode('');
    setDate(todayIso());
    setAddAsCredit(false);
    setReference('');
    setError(null);
  }, [open, invoice.id, invoice.paidAmount]);

  const submit = () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter a valid refund amount');
      return;
    }
    if (value > invoice.paidAmount) {
      setError(`Refund cannot exceed paid amount (${formatInr(invoice.paidAmount)})`);
      return;
    }
    if (!mode) {
      setError('Select a payment mode');
      return;
    }
    if (!date) {
      setError('Select a payment date');
      return;
    }
    onConfirm({
      amount: value,
      mode,
      date,
      reference: reference.trim() || undefined,
      addAsCredit,
    });
  };

  return (
    <Modal
      open={open}
      title="Refund"
      onClose={busy ? () => undefined : onClose}
      icon={
        <span className="ivd-action-modal-icon" aria-hidden>
          <RotateCcw size={18} />
        </span>
      }
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button type="button" className="ui-btn ui-btn-primary" onClick={submit} disabled={busy}>
            {busy ? 'Recording…' : 'Record Refund'}
          </button>
        </>
      }
    >
      <div className="ui-grid-2">
        <div className="ui-field">
          <label className="ui-label" htmlFor="rf-amount">
            <span className="ivd-req">*</span> Refund Amount
          </label>
          <input
            id="rf-amount"
            className="ui-input"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="ui-field">
          <label className="ui-label">
            <span className="ivd-req">*</span> Payment Mode
          </label>
          <AppSelect
            value={mode}
            onChange={setMode}
            options={REFUND_MODES}
            placeholder="Select mode"
          />
        </div>
      </div>

      <div className="ui-field" style={{ marginTop: 14 }}>
        <label className="ui-label" htmlFor="rf-date">
          <span className="ivd-req">*</span> Payment Date
        </label>
        <input
          id="rf-date"
          type="date"
          className="ui-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <label className="ivd-credit-check" style={{ marginTop: 12 }}>
        <input
          type="checkbox"
          checked={addAsCredit}
          onChange={(e) => setAddAsCredit(e.target.checked)}
        />
        <span>Add Refund as Credit</span>
      </label>

      <div className="ui-field" style={{ marginTop: 14 }}>
        <label className="ui-label" htmlFor="rf-ref">
          Reference Number
        </label>
        <textarea
          id="rf-ref"
          className="ui-textarea"
          rows={3}
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Transaction Ref. Number(Optional)"
        />
      </div>

      {error ? (
        <p className="ivd-pay-error" role="alert">
          {error}
        </p>
      ) : null}
    </Modal>
  );
}

type SelectReceiptProps = {
  open: boolean;
  receipts: { invoice: CenterInvoice; payment: InvoicePayment }[];
  onClose: () => void;
  onSelect: (invoice: CenterInvoice, payment: InvoicePayment) => void;
};

export function SelectReceiptModal({ open, receipts, onClose, onSelect }: SelectReceiptProps) {
  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    setSelectedId(receipts[0]?.payment.id ?? '');
  }, [open, receipts]);

  const selected = useMemo(
    () => receipts.find((r) => r.payment.id === selectedId) ?? null,
    [receipts, selectedId],
  );

  return (
    <Modal
      open={open}
      title="Select receipt to view"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!selected}
            onClick={() => selected && onSelect(selected.invoice, selected.payment)}
          >
            OK
          </button>
        </>
      }
    >
      {receipts.length === 0 ? (
        <p className="ivd-action-modal-copy">No receipts found for this student yet.</p>
      ) : (
        <ul className="ivd-receipt-pick-list">
          {receipts.map(({ payment, invoice }) => (
            <li key={payment.id}>
              <button
                type="button"
                className={`ivd-receipt-pick${selectedId === payment.id ? ' is-selected' : ''}`}
                onClick={() => setSelectedId(payment.id)}
              >
                <FileText size={16} aria-hidden />
                <span>
                  <strong>{payment.receiptId}</strong>
                  <em>
                    {invoice.invoiceId} · {formatInr(payment.amount)}
                  </em>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
