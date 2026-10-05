'use client';

import { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatCompactDate, formatRupeeAmount } from './mockData';
import type { ParentInvoice, ParentInvoicePayment } from './types';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  onClose: () => void;
  onSelect: (payment: ParentInvoicePayment) => void;
};

export function ParentSelectReceiptModal({ open, invoice, onClose, onSelect }: Props) {
  const payments = (invoice?.payments ?? []).filter((p) => Boolean(p.receiptId) || p.amount > 0);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedId(payments[0]?.id ?? '');
  }, [open, invoice?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- reset on open/invoice

  const selected = payments.find((p) => p.id === selectedId) ?? null;

  if (!invoice) {
    return (
      <Modal open={false} title="Select receipt to view" onClose={onClose} elevated>
        {null}
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      title="Select receipt to view"
      onClose={onClose}
      elevated
      icon={<FileText size={18} />}
      iconClose
      className="pi-select-receipt-modal"
      footer={
        <>
          <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            disabled={!selected}
            onClick={() => selected && onSelect(selected)}
          >
            View Receipt
          </button>
        </>
      }
    >
      {payments.length === 0 ? (
        <p className="pi-select-receipt-empty">No receipts found for this invoice.</p>
      ) : (
        <ul className="pi-select-receipt-list" role="listbox" aria-label="Receipts">
          {payments.map((payment) => {
            const label = payment.receiptId || payment.reference || payment.id;
            const selected = selectedId === payment.id;
            return (
              <li key={payment.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`pi-select-receipt-item${selected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedId(payment.id)}
                >
                  <FileText size={16} aria-hidden />
                  <span>
                    <strong>{label}</strong>
                    <em>
                      {payment.mode} · {formatCompactDate(payment.date)} ·{' '}
                      {formatRupeeAmount(payment.amount)}
                    </em>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
