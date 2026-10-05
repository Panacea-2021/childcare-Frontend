'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock3, AlertTriangle, CircleDot, FilePenLine, RotateCcw } from 'lucide-react';
import type { CenterInvoiceStatus } from '@/lib/billing-accounting/invoiceStore';

const STATUS_CLASS: Record<CenterInvoiceStatus, string> = {
  Due: 'is-due',
  Paid: 'is-paid',
  Overdue: 'is-overdue',
  Pending: 'is-pending',
  Upcoming: 'is-upcoming',
  Draft: 'is-draft',
  Refund: 'is-refund',
  Cancelled: 'is-draft',
};

const STATUS_ICON: Record<CenterInvoiceStatus, ReactNode> = {
  Paid: <CheckCircle2 size={13} strokeWidth={2.4} />,
  Due: <Clock3 size={13} strokeWidth={2.4} />,
  Overdue: <AlertTriangle size={13} strokeWidth={2.4} />,
  Pending: <CircleDot size={13} strokeWidth={2.4} />,
  Upcoming: <Clock3 size={13} strokeWidth={2.4} />,
  Draft: <FilePenLine size={13} strokeWidth={2.4} />,
  Refund: <RotateCcw size={13} strokeWidth={2.4} />,
  Cancelled: <AlertTriangle size={13} strokeWidth={2.4} />,
};

export function StatusBadge({ status }: { status: CenterInvoiceStatus }) {
  const pulse = status === 'Overdue' || status === 'Due';
  return (
    <motion.span
      className={`ivd-status ${STATUS_CLASS[status] ?? 'is-draft'}`}
      animate={pulse ? { scale: [1, 1.04, 1], opacity: [1, 0.9, 1] } : undefined}
      transition={pulse ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      <span className="ivd-status-icon" aria-hidden>
        {STATUS_ICON[status] ?? STATUS_ICON.Draft}
      </span>
      {status}
    </motion.span>
  );
}
