/**
 * Student Profile → Generated Invoice read path.
 * Single source of truth: center invoiceStore (Billing & Accounting).
 */

import {
  isInvoicePaidLike,
  latestPaymentDate,
  loadCenterInvoices,
  syncCenterInvoiceStatuses,
  type CenterInvoice,
} from '@/lib/billing-accounting/invoiceStore';

export function listStudentGeneratedInvoices(studentId: string, studentName?: string): CenterInvoice[] {
  const name = (studentName || '').trim().toLowerCase();
  return syncCenterInvoiceStatuses()
    .filter(
      (r) =>
        r.kind === 'invoice' &&
        r.status !== 'Cancelled' &&
        r.status !== 'Draft' &&
        (r.studentId === studentId ||
          (!!name && r.studentName.trim().toLowerCase() === name)),
    )
    .sort(
      (a, b) =>
        b.invoiceDate.localeCompare(a.invoiceDate) || b.invoiceId.localeCompare(a.invoiceId),
    );
}

export function generatedInvoiceBucket(inv: CenterInvoice): 'due' | 'paid' {
  if (isInvoicePaidLike(inv) || (Number(inv.pendingAmount) <= 0 && Number(inv.paidAmount) > 0)) {
    return 'paid';
  }
  return 'due';
}

export function generatedPaymentDate(inv: CenterInvoice): string | null {
  return latestPaymentDate(inv);
}

/** Live stats for Generated Invoice KPI cards (master invoices only). */
export function studentGeneratedInvoiceStats(studentId: string, studentName?: string) {
  const all = listStudentGeneratedInvoices(studentId, studentName);
  const due = all.filter((i) => generatedInvoiceBucket(i) === 'due');
  const paid = all.filter((i) => generatedInvoiceBucket(i) === 'paid');
  return {
    total: all.reduce((s, i) => s + Number(i.invoicedAmount), 0),
    dueAmount: due.reduce((s, i) => s + Number(i.pendingAmount), 0),
    dueCount: due.length,
    paidAmount: paid.reduce((s, i) => s + Number(i.paidAmount || i.invoicedAmount), 0),
    paidCount: paid.length,
    refund: all.reduce((s, i) => s + Number(i.totalRefund || 0), 0),
  };
}

export function reloadCenterInvoices(): CenterInvoice[] {
  return loadCenterInvoices();
}
