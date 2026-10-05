'use client';

import { motion } from 'framer-motion';
import {
  formatInr,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { GlassCard, SectionTitle } from './GlassCard';
import { staggerContainer, staggerItem } from './animations';

export function ChargesTable({ invoice }: { invoice: CenterInvoice }) {
  const lines = invoice.lines ?? [];
  const isDebit = invoice.kind === 'debit';
  const subTotal = lines.reduce(
    (s, l) => s + (isDebit ? l.amount : l.quantity * l.unitPrice),
    0,
  );
  const tax = lines.reduce((s, l) => {
    if (l.taxPercent <= 0) return s;
    return s + (l.quantity * l.unitPrice * l.taxPercent) / 100;
  }, 0);

  return (
    <GlassCard className="ivd-charges" delay={0.18}>
      <SectionTitle title={isDebit ? 'Charges & Payments' : 'Charges'} />
      <div className="ivd-table-wrap">
        <motion.table className="ivd-table" variants={staggerContainer} initial="initial" animate="animate">
          <thead>
            <tr>
              {isDebit ? (
                <>
                  <th>Description</th>
                  <th>Gross Amount</th>
                  <th>Discount Description</th>
                  <th>Discount Amount</th>
                  <th>Amount</th>
                </>
              ) : (
                <>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Tax</th>
                  <th>Amount</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <motion.tr key={line.id} variants={staggerItem}>
                {isDebit ? (
                  <>
                    <td>
                      <strong>{line.name}</strong>
                    </td>
                    <td>{formatInr(line.grossAmount ?? line.unitPrice)}</td>
                    <td>{line.discountDescription || '—'}</td>
                    <td>{formatInr(line.discountAmount ?? 0)}</td>
                    <td className="ivd-num">{formatInr(line.amount)}</td>
                  </>
                ) : (
                  <>
                    <td>
                      <strong>{line.name}</strong>
                    </td>
                    <td>{line.quantity}</td>
                    <td>{formatInr(line.unitPrice)}</td>
                    <td>{line.taxPercent > 0 ? `${line.taxPercent}%` : '—'}</td>
                    <td className="ivd-num">{formatInr(line.amount)}</td>
                  </>
                )}
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
      <div className="ivd-totals">
        {isDebit ? (
          <>
            <div>
              <span>Total Amount</span>
              <strong>{formatInr(invoice.invoicedAmount)}</strong>
            </div>
            <div>
              <span>Total Paid Amount</span>
              <strong>{formatInr(invoice.paidAmount)}</strong>
            </div>
            <div className="ivd-totals-due">
              <span>Amount Due</span>
              <strong>{formatInr(invoice.pendingAmount)}</strong>
            </div>
          </>
        ) : (
          <>
            <div>
              <span>Sub Total</span>
              <strong>{formatInr(subTotal)}</strong>
            </div>
            {tax > 0 ? (
              <div>
                <span>Tax</span>
                <strong>{formatInr(tax)}</strong>
              </div>
            ) : null}
            <div>
              <span>Total Amount</span>
              <strong>{formatInr(invoice.invoicedAmount)}</strong>
            </div>
            <div>
              <span>Total paid amount</span>
              <strong>{formatInr(invoice.paidAmount)}</strong>
            </div>
            <div className="ivd-totals-due">
              <span>Final Amount Due</span>
              <strong>{formatInr(invoice.pendingAmount)}</strong>
            </div>
          </>
        )}
      </div>
    </GlassCard>
  );
}
