'use client';

import { CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentInvoice } from './types';
import { formatRupeeAmount } from './mockData';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  busy?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function ParentPaymentConfirmModal({
  open,
  invoice,
  busy = false,
  errorMessage = null,
  onClose,
  onConfirm,
}: Props) {
  if (!invoice) {
    return (
      <Modal open={false} title="Confirm Payment" onClose={onClose}>
        {null}
      </Modal>
    );
  }

  const payAmount = invoice.balance > 0 ? invoice.balance : invoice.amount;

  return (
    <Modal
      open={open}
      title="Confirm Payment"
      subtitle="Review before continuing"
      onClose={busy ? () => undefined : onClose}
      icon={<CreditCard size={18} />}
      elevated
      className="pi-pay-modal"
      iconClose
      footer={
        <>
          <button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? 'Processing…' : 'Continue to Payment'}
          </button>
        </>
      }
    >
      <div className="pi-confirm">
        <p className="pi-confirm-msg">
          You&apos;re about to proceed with the payment for this invoice.
        </p>
        <div className="pi-confirm-card">
          <div className="pi-confirm-row">
            <span>Invoice</span>
            <strong>{invoice.invoiceNumber}</strong>
          </div>
          <div className="pi-confirm-row">
            <span>Description</span>
            <strong>{invoice.description}</strong>
          </div>
          <div className="pi-confirm-row pi-confirm-row--amount">
            <span>Amount</span>
            <strong>{formatRupeeAmount(payAmount)}</strong>
          </div>
        </div>
        {errorMessage ? (
          <p className="pi-confirm-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
