'use client';

import {
  formatDisplayDate,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { AnimatedAmount } from './AnimatedAmount';
import { GlassCard } from './GlassCard';

export function InvoiceSummary({ invoice }: { invoice: CenterInvoice }) {
  const period = `${formatDisplayDate(invoice.billingPeriodStart || invoice.invoiceDate)} – ${formatDisplayDate(
    invoice.billingPeriodEnd || invoice.dueDate,
  )}`;

  const meta =
    invoice.kind === 'debit'
      ? [
          { label: 'Debit Date', value: formatDisplayDate(invoice.invoiceDate) },
          { label: 'Billing Period', value: period },
          { label: 'Due Date', value: formatDisplayDate(invoice.dueDate) },
        ]
      : [
          { label: 'Invoice Date', value: formatDisplayDate(invoice.invoiceDate) },
          { label: 'Billing Period', value: period },
          { label: 'Due Date', value: formatDisplayDate(invoice.dueDate) },
          { label: 'Created By', value: invoice.createdBy || '—' },
          { label: 'Created On', value: formatDisplayDate(invoice.createdOn || invoice.invoiceDate) },
        ];

  return (
    <GlassCard className="ivd-summary" delay={0.1}>
      <dl className="ivd-meta-list">
        {meta.map((item) => (
          <div key={item.label} className="ivd-meta-row">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="ivd-due-banner">
        <span className="ivd-due-label">Amount Due</span>
        <div className="ivd-due-value">
          <AnimatedAmount value={invoice.pendingAmount} />
        </div>
      </div>
    </GlassCard>
  );
}
