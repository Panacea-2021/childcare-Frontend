import type {
  CenterInvoice,
  CenterInvoiceStatus,
  InvoicePayment,
} from '@/lib/billing-accounting/invoiceStore';
import { createInvoicePdfBlob, createReceiptPdfBlob } from '@/components/modules/billing-accounting/invoice-pdf';
import type { ParentInvoice, ParentInvoicePayment } from './types';
import { getInvoiceLines, resolveUiStatus } from './mockData';

export type ParentInvoiceStudentContext = {
  studentId?: string;
  studentName?: string;
  roomName?: string;
  programName?: string;
  photoUrl?: string;
};

function mapStatus(invoice: ParentInvoice): CenterInvoiceStatus {
  const ui = resolveUiStatus(invoice);
  if (ui === 'Paid') return 'Paid';
  if (ui === 'Overdue') return 'Overdue';
  if (ui === 'Partial') return 'Pending';
  return 'Due';
}

export function mapParentPaymentToCenter(payment: ParentInvoicePayment): InvoicePayment {
  const receiptId =
    payment.receiptId?.trim() ||
    payment.reference?.trim() ||
    `RCP-${payment.id}`;
  return {
    id: payment.id,
    receiptId,
    amount: payment.amount,
    mode: payment.mode || 'Online',
    date: payment.date,
    reference: payment.reference,
    recordedBy: 'Parent portal',
    recordedAt: payment.date,
  };
}

/** Maps parent portal invoice → admin `CenterInvoice` for shared PDF / InvoiceCard reuse. */
export function mapParentInvoiceToCenter(
  invoice: ParentInvoice,
  ctx: ParentInvoiceStudentContext = {},
): CenterInvoice {
  const lines = getInvoiceLines(invoice).map((line) => ({
    id: line.id,
    name: line.name,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    taxPercent: line.taxPercent,
    amount: line.amount,
  }));

  const payments = (invoice.payments ?? []).map(mapParentPaymentToCenter);

  return {
    id: invoice.id,
    invoiceId: invoice.invoiceNumber,
    studentId: ctx.studentId || 'parent-student',
    studentName: ctx.studentName || 'Student',
    billingPlan: ctx.programName || invoice.description || 'Fee',
    dueDate: invoice.dueDate,
    invoicedAmount: invoice.amount,
    paidAmount: invoice.paid,
    pendingAmount: invoice.balance,
    status: mapStatus(invoice),
    invoiceDate: invoice.invoiceDate,
    kind: 'invoice',
    roomId: ctx.roomName,
    photoUrl: ctx.photoUrl,
    billingPeriodStart: invoice.invoiceDate,
    billingPeriodEnd: invoice.dueDate,
    createdBy: 'Billing',
    lines,
    payments,
    comments: invoice.comments,
  };
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
}

export async function downloadParentInvoicePdf(center: CenterInvoice) {
  const blob = await createInvoicePdfBlob(center);
  triggerBlobDownload(blob, `Invoice_${center.invoiceId}.pdf`);
  return blob;
}

export async function downloadParentReceiptPdf(center: CenterInvoice, payment: InvoicePayment) {
  const blob = await createReceiptPdfBlob(center, payment);
  const receiptKey = payment.receiptId || center.invoiceId;
  triggerBlobDownload(blob, `Receipt_${receiptKey}.pdf`);
  return blob;
}
