'use client';

import { AlertTriangle, CheckCircle2, FileText, Wallet } from 'lucide-react';
import type { ParentInvoiceSummaryStats } from './types';
import { formatInvoiceAmount } from './mockData';

type Props = {
  stats: ParentInvoiceSummaryStats;
};

const CARDS = [
  {
    key: 'total',
    label: 'Total Invoices',
    icon: FileText,
    tone: 'accent',
    getValue: (s: ParentInvoiceSummaryStats) => String(s.total),
  },
  {
    key: 'pending',
    label: 'Pending Amount',
    icon: Wallet,
    tone: 'pending',
    getValue: (s: ParentInvoiceSummaryStats) => formatInvoiceAmount(s.pendingAmount),
  },
  {
    key: 'paid',
    label: 'Paid Amount',
    icon: CheckCircle2,
    tone: 'paid',
    getValue: (s: ParentInvoiceSummaryStats) => formatInvoiceAmount(s.paidAmount),
  },
  {
    key: 'overdue',
    label: 'Overdue',
    icon: AlertTriangle,
    tone: 'overdue',
    getValue: (s: ParentInvoiceSummaryStats) => String(s.overdueCount),
  },
] as const;

export function ParentInvoiceSummary({ stats }: Props) {
  return (
    <section className="pi-summary" aria-label="Invoice summary">
      {CARDS.map(({ key, label, icon: Icon, tone, getValue }) => (
        <article key={key} className={`pi-summary-card pi-summary-card--${tone}`}>
          <span className="pi-summary-icon" aria-hidden>
            <Icon size={16} strokeWidth={2} />
          </span>
          <div className="pi-summary-copy">
            <p className="pi-summary-label">{label}</p>
            <p className="pi-summary-value">{getValue(stats)}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
