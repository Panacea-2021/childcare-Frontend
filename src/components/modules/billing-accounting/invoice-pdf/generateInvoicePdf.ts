import { createElement, type ReactElement } from 'react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import type { CenterInvoice } from '@/lib/billing-accounting/invoiceStore';
import { InvoicePdfDocument } from './InvoicePdfDocument';

export async function createInvoicePdfBlob(invoice: CenterInvoice): Promise<Blob> {
  const doc = createElement(InvoicePdfDocument, { invoice }) as ReactElement<DocumentProps>;
  return pdf(doc).toBlob();
}

export async function downloadInvoicePdf(invoice: CenterInvoice): Promise<Blob> {
  const blob = await createInvoicePdfBlob(invoice);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${invoice.invoiceId}.pdf`;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2500);
  return blob;
}
