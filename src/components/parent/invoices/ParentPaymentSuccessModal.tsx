'use client';

import { m } from 'framer-motion';
import { Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentInvoice } from './types';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  onClose: () => void;
};

export function ParentPaymentSuccessModal({ open, invoice, onClose }: Props) {
  return (
    <Modal
      open={open}
      title="Payment Successful"
      onClose={onClose}
      elevated
      className="pi-success-modal"
      iconClose
      footer={
        <button type="button" className="ui-btn ui-btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="pi-success">
        <m.div
          className="pi-success-check"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18 }}
          aria-hidden
        >
          <Check size={28} strokeWidth={2.5} />
        </m.div>
        <m.h3
          className="pi-success-title"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.28 }}
        >
          Payment Successful
        </m.h3>
        <m.p
          className="pi-success-copy"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.28 }}
        >
          Your payment has been completed successfully.
        </m.p>
        {invoice ? (
          <m.p
            className="pi-success-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.26, duration: 0.28 }}
          >
            Invoice ID: <strong>{invoice.invoiceNumber}</strong>
          </m.p>
        ) : null}
      </div>
    </Modal>
  );
}
