'use client';

import { motion } from 'framer-motion';
import { Download, Eye, Printer, Receipt } from 'lucide-react';
import type { InvoicePaymentStatus, StudentInvoice } from '@/lib/students/profileTypes';
import { formatCurrency, formatDisplayDate } from '@/lib/students/profileStore';
import { tableMotion } from './animations';

type Props = { invoices: StudentInvoice[] };

const STATUS_CLASS: Record<InvoicePaymentStatus, string> = {
  Paid: 'mint',
  Partial: 'lavender',
  Pending: 'amber',
  Overdue: 'coral',
};

export function InvoicesTab({ invoices }: Props) {
  return (
    <div className="sp-panel">
      <div className="sp-panel-toolbar">
        <div>
          <h3 className="sp-panel-title">Invoices</h3>
          <p className="sp-panel-sub">Every invoice created for this student</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="sp-empty">
          <div className="sp-empty-art" aria-hidden>
            <Receipt size={34} />
          </div>
          <h4>No invoices yet</h4>
          <p>Invoices generated for this student will appear here.</p>
        </div>
      ) : (
        <motion.div className="sp-table-wrap" {...tableMotion}>
          <table className="ui-table sp-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Invoice Date</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Payment Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>
                    <strong>{inv.invoiceNumber}</strong>
                  </td>
                  <td>{formatDisplayDate(inv.invoiceDate)}</td>
                  <td>{formatCurrency(inv.amount)}</td>
                  <td>{formatCurrency(inv.paid)}</td>
                  <td>{formatCurrency(inv.balance)}</td>
                  <td>
                    <span className={`sp-status-pill ${STATUS_CLASS[inv.paymentStatus]}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td>{formatDisplayDate(inv.dueDate)}</td>
                  <td>
                    <div className="sp-inline-actions">
                      <button
                        type="button"
                        className="tm-icon-btn"
                        data-tip="View Invoice"
                        aria-label="View Invoice"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="tm-icon-btn"
                        data-tip="Download"
                        aria-label="Download"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        type="button"
                        className="tm-icon-btn"
                        data-tip="Print"
                        aria-label="Print"
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
