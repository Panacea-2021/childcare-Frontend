'use client';

import { m } from 'framer-motion';
import {
  Check,
  FileText,
  MessageSquare,
  Receipt,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import type { ParentInvoice } from './types';
import {
  computeInvoiceTotals,
  formatCompactDate,
  formatRupeeAmount,
  getInvoiceLines,
  hasInvoiceReceipts,
  isInvoiceFullyPaid,
  isInvoicePayable,
} from './mockData';

type Props = {
  open: boolean;
  invoice: ParentInvoice | null;
  onClose: () => void;
  onPay?: (invoice: ParentInvoice) => void;
  onViewInvoice?: (invoice: ParentInvoice) => void;
  onViewReceipt?: (invoice: ParentInvoice) => void;
  onOpenComments?: (invoice: ParentInvoice) => void;
};

export function ParentInvoiceDetailModal({
  open,
  invoice,
  onClose,
  onPay,
  onViewInvoice,
  onViewReceipt,
  onOpenComments,
}: Props) {
  if (!invoice) {
    return (
      <Modal open={false} title="Invoice Detail" onClose={onClose}>
        {null}
      </Modal>
    );
  }

  const lines = getInvoiceLines(invoice);
  const totals = computeInvoiceTotals(invoice);
  const payments = invoice.payments ?? [];
  const fullyPaid = isInvoiceFullyPaid(invoice);
  const payable = isInvoicePayable(invoice);
  const showReceipt = hasInvoiceReceipts(invoice);
  const commentsCount = invoice.commentsCount ?? invoice.comments?.length ?? 0;
  const amountColLabel = totals.amountExcludesTax ? 'Amount (Excl. Tax)' : 'Amount';
  const commentLabel = `${commentsCount} Comment${commentsCount === 1 ? '' : 's'}`;

  return (
    <Modal
      open={open}
      title="Invoice Detail"
      onClose={onClose}
      icon={<FileText size={18} />}
      xl
      autoHeight
      iconClose
      className="pi-detail-modal"
      footer={
        payable ? (
          <>
            <span className="pi-detail-footer-spacer" aria-hidden />
            <button type="button" className="ui-btn ui-btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="ui-btn ui-btn-primary"
              onClick={() => onPay?.(invoice)}
              aria-label={`Pay ${formatRupeeAmount(totals.amountDue)} for invoice ${invoice.invoiceNumber}`}
            >
              Pay Now
            </button>
          </>
        ) : undefined
      }
    >
      <div className="pi-ivd">
        <div className="pi-ivd-meta">
          <div className="pi-ivd-meta-left">
            <p className="pi-ivd-meta-row">
              <span className="pi-ivd-meta-label">Invoice ID:</span>
              <strong>{invoice.invoiceNumber}</strong>
            </p>
            <p className="pi-ivd-meta-row">
              <span className="pi-ivd-meta-label">Due:</span>
              <span>{formatCompactDate(invoice.dueDate)}</span>
            </p>
            <p className="pi-ivd-meta-row">
              <span className="pi-ivd-meta-label">Created:</span>
              <span>{formatCompactDate(invoice.invoiceDate)}</span>
            </p>
          </div>

          <div className="pi-ivd-actions">
            <button
              type="button"
              className="pi-ivd-action"
              onClick={() => onOpenComments?.(invoice)}
              aria-label={commentLabel}
              title="Comments"
            >
              <MessageSquare size={15} strokeWidth={2} aria-hidden />
              <span>{commentLabel}</span>
            </button>

            <button
              type="button"
              className="pi-ivd-action"
              onClick={() => onViewInvoice?.(invoice)}
              aria-label={`View invoice ${invoice.invoiceNumber}`}
            >
              <FileText size={15} strokeWidth={2} aria-hidden />
              <span>View Invoice</span>
            </button>

            {showReceipt ? (
              <button
                type="button"
                className="pi-ivd-action"
                onClick={() => onViewReceipt?.(invoice)}
                aria-label={`View receipt for ${invoice.invoiceNumber}`}
              >
                <Receipt size={15} strokeWidth={2} aria-hidden />
                <span>View Receipt</span>
              </button>
            ) : null}
          </div>
        </div>

        <section className="pi-ivd-charges" aria-label="Invoice items">
          <div className="pi-ivd-table-wrap">
            <table className="pi-ivd-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax</th>
                  <th>{amountColLabel}</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td>
                      <strong>{line.name}</strong>
                    </td>
                    <td>{line.quantity}</td>
                    <td>{formatRupeeAmount(line.unitPrice)}</td>
                    <td>{line.taxPercent > 0 ? `${line.taxPercent}%` : '—'}</td>
                    <td className="pi-ivd-num">{formatRupeeAmount(line.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totals.tax > 0 && totals.taxLabel ? (
            <div className="pi-ivd-tax-block" aria-label="Taxes">
              <p className="pi-ivd-tax-heading">Taxes</p>
              <div className="pi-ivd-tax-row">
                <span>{totals.taxLabel}</span>
                <strong>+ {formatRupeeAmount(totals.tax)}</strong>
              </div>
            </div>
          ) : null}

          <div className="pi-ivd-totals" aria-label="Financial summary">
            <div>
              <span>Sub Total</span>
              <strong>{formatRupeeAmount(totals.subTotal)}</strong>
            </div>
            {totals.tax > 0 ? (
              <div>
                <span>Taxes</span>
                <strong>+ {formatRupeeAmount(totals.tax)}</strong>
              </div>
            ) : null}
            <div>
              <span>Total Amount</span>
              <strong>{formatRupeeAmount(totals.totalAmount)}</strong>
            </div>
            <div>
              <span>Total paid amount</span>
              <strong>{formatRupeeAmount(totals.paidAmount)}</strong>
            </div>
            <div className="pi-ivd-totals-due">
              <span>Amount Due</span>
              <strong>{formatRupeeAmount(totals.amountDue)}</strong>
            </div>
          </div>
        </section>

        {payments.length > 0 ? (
          <section className="pi-ivd-payments" aria-label="Payment records">
            <h3 className="pi-ivd-section-title">Payment records</h3>
            <div className="pi-ivd-table-wrap">
              <table className="pi-ivd-table pi-ivd-table--payments">
                <thead>
                  <tr>
                    <th>Mode</th>
                    <th>Date</th>
                    <th>Reference Number</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.mode || '—'}</td>
                      <td>{formatCompactDate(payment.date)}</td>
                      <td>{payment.reference?.trim() || '—'}</td>
                      <td className="pi-ivd-num">{formatRupeeAmount(payment.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : fullyPaid ? (
          <section className="pi-ivd-payments" aria-label="Payment records">
            <h3 className="pi-ivd-section-title">Payment records</h3>
            <p className="pi-ivd-empty">No payment records available</p>
          </section>
        ) : null}

        {fullyPaid ? (
          <m.div
            className="pi-ivd-success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <span className="pi-ivd-success-icon" aria-hidden>
              <Check size={26} strokeWidth={2.5} />
            </span>
            <p className="pi-ivd-success-label">Payment Successful</p>
          </m.div>
        ) : null}
      </div>
    </Modal>
  );
}
