import { createElement, type ReactElement } from 'react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { CenterInvoice, InvoicePayment } from '@/lib/billing-accounting/invoiceStore';
import { loadStudents, roomName } from '@/lib/center-management/studentsStore';
import { ReceiptPdfDocument } from './ReceiptPdfDocument';

function parentNames(invoice: CenterInvoice) {
  const students = loadStudents();
  const student =
    students.find((s) => s.id === invoice.studentId) ||
    students.find((s) => s.name.toLowerCase() === invoice.studentName.toLowerCase());
  const mother =
    student?.parents?.find((p) => /mother|mom/i.test(p.role || ''))?.name ||
    student?.parents?.[0]?.name ||
    '—';
  const father =
    student?.parents?.find((p) => /father|dad/i.test(p.role || ''))?.name ||
    student?.parents?.[1]?.name ||
    '—';
  const room = student?.roomIds?.[0] ? roomName(student.roomIds[0]) : 'Demo Room';
  return { mother, father, room };
}

export async function createReceiptPdfBlob(
  invoice: CenterInvoice,
  payment: InvoicePayment,
): Promise<Blob> {
  const { mother, father, room } = parentNames(invoice);
  const doc = createElement(ReceiptPdfDocument, {
    invoice,
    payment,
    motherName: mother,
    fatherName: father,
    roomName: room,
  }) as ReactElement<DocumentProps>;
  return pdf(doc).toBlob();
}

export async function downloadReceiptPdf(invoice: CenterInvoice, payment: InvoicePayment) {
  const blob = await createReceiptPdfBlob(invoice, payment);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${payment.receiptId}.pdf`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
  return blob;
}
