'use client';

import { m } from 'framer-motion';
import { Eye } from 'lucide-react';
import type { ParentInvoice } from './types';
import {
  formatCompactDate,
  formatInvoiceAmount,
  isInvoicePayable,
  resolveUiStatus,
} from './mockData';

type Props = {
  invoice: ParentInvoice;
  onView: (invoice: ParentInvoice) => void;
  onPay: (invoice: ParentInvoice) => void;
};

const STATUS_LABEL: Record<string, string> = {
  Paid: 'PAID',
  Pending: 'PENDING',
  Partial: 'PARTIAL',
  Overdue: 'OVERDUE',
};

export function ParentInvoiceCard({ invoice, onView, onPay }: Props) {
  const status = resolveUiStatus(invoice);
  const payable = isInvoicePayable(invoice);
  const overdue = status === 'Overdue';
  const paid = status === 'Paid';
  const statusKey = status.toLowerCase();

  return (
    <m.article
      className={`pi-card${overdue ? ' pi-card--overdue' : ''}${paid ? ' pi-card--paid' : ''}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div className="pi-card-top">
        <div className="pi-card-id-block">
          <span className="pi-card-id-label">Invoice ID:</span>
          <span className="pi-card-id">{invoice.invoiceNumber}</span>
        </div>
        <button
          type="button"
          className="pi-view-btn"
          onClick={() => onView(invoice)}
          aria-label={`View invoice ${invoice.invoiceNumber}`}
        >
          <Eye size={14} strokeWidth={2} aria-hidden />
          View
        </button>
      </div>

      <div className="pi-card-main">
        <h3 className="pi-card-title">{invoice.description}</h3>
        <p className="pi-card-amount">{formatInvoiceAmount(invoice.amount)}</p>
      </div>

      <div className="pi-card-meta">
        <div className="pi-card-meta-item">
          <span className="pi-card-meta-label">Due:</span>
          <span className="pi-card-meta-value">{formatCompactDate(invoice.dueDate)}</span>
        </div>
        <div className="pi-card-meta-item">
          <span className="pi-card-meta-label">Created:</span>
          <span className="pi-card-meta-value">{formatCompactDate(invoice.invoiceDate)}</span>
        </div>
        <span className={`pi-badge pi-badge--${statusKey}`} aria-label={`Status ${status}`}>
          <span className="pi-badge-dot" aria-hidden />
          {STATUS_LABEL[status]}
        </span>
      </div>

      {overdue ? (
        <p className="pi-overdue-hint" role="status">
          Payment overdue
        </p>
      ) : null}

      {payable ? (
        <m.button
          type="button"
          className={`ui-btn pi-pay-btn${overdue ? ' pi-pay-btn--overdue' : ' ui-btn-primary'}`}
          onClick={() => onPay(invoice)}
          aria-label={`Pay invoice ${invoice.invoiceNumber} now`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15 }}
        >
          PAY NOW
        </m.button>
      ) : (
        <div className="pi-paid-pill" aria-label="Invoice paid">
          PAID ✓
        </div>
      )}
    </m.article>
  );
}
