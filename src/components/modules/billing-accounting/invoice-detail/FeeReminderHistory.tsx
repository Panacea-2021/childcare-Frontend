'use client';

import { Bell } from 'lucide-react';
import {
  formatFeeReminderLine,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';
import { GlassCard, SectionTitle } from './GlassCard';

type Props = {
  invoice: CenterInvoice;
};

export function FeeReminderHistory({ invoice }: Props) {
  const reminders = [...(invoice.feeReminders ?? [])].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
  );

  return (
    <GlassCard className="ivd-reminder-history" delay={0.2}>
      <SectionTitle title="Fee Reminder History" />
      {reminders.length === 0 ? (
        <p className="ivd-reminder-empty">No fee reminders sent for this invoice yet.</p>
      ) : (
        <ul className="ivd-reminder-list">
          {reminders.map((entry) => (
            <li key={entry.id} className="ivd-reminder-item">
              <span className="ivd-reminder-dot" aria-hidden>
                <Bell size={12} />
              </span>
              <span>{formatFeeReminderLine(entry)}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
