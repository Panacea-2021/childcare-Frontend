import {
  formatDisplayDate,
  formatInr,
  type CenterInvoice,
  type InvoiceLine,
} from '@/lib/billing-accounting/invoiceStore';

export const INVOICE_BRAND = {
  product: 'Panacea Childcare',
  center: 'Hams Kids Home | Daycare',
  address: ['12 Sunrise Avenue', 'Hyderabad, Telangana 500081', 'India'],
  phone: '+91 98765 43210',
  email: 'billing@panaceachildcare.com',
  website: 'www.panaceachildcare.com',
  thankYou: 'Thank you for trusting Panacea Childcare.',
  paymentNote: 'Please include the invoice number in your payment reference.',
  terms: 'Payment is due by the date shown. Late balances may incur a reminder fee.',
};

export type InvoiceLineView = InvoiceLine & {
  taxAmount: number;
  taxLabel: string;
};

export type InvoiceViewModel = {
  invoice: CenterInvoice;
  lines: InvoiceLineView[];
  period: string;
  subtotal: number;
  discount: number;
  taxTotal: number;
  paid: number;
  balance: number;
  amountDue: number;
  dueLabel: string;
  generatedAt: string;
};

export function getInvoiceLines(invoice: CenterInvoice): InvoiceLine[] {
  if (invoice.lines?.length) return invoice.lines;
  return [
    {
      id: `${invoice.id}-fallback`,
      name: invoice.billingPlan || 'Fee',
      quantity: 1,
      unitPrice: invoice.invoicedAmount,
      taxPercent: 0,
      amount: invoice.invoicedAmount,
    },
  ];
}

export function buildInvoiceViewModel(invoice: CenterInvoice): InvoiceViewModel {
  const raw = getInvoiceLines(invoice);
  const lines: InvoiceLineView[] = raw.map((line) => {
    const base = line.quantity * line.unitPrice;
    const taxAmount =
      line.taxPercent > 0 ? (base * line.taxPercent) / 100 : Math.max(0, line.amount - base);
    return {
      ...line,
      taxAmount,
      taxLabel: line.taxPercent > 0 ? `${line.taxPercent}%` : taxAmount > 0 ? formatInr(taxAmount) : '—',
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const taxTotal = lines.reduce((sum, line) => sum + line.taxAmount, 0);
  const discount = Math.max(0, subtotal + taxTotal - invoice.invoicedAmount);
  const paid = invoice.paidAmount;
  const balance = invoice.pendingAmount;
  const amountDue = invoice.pendingAmount;

  const period = `${formatDisplayDate(invoice.billingPeriodStart || invoice.invoiceDate)} – ${formatDisplayDate(
    invoice.billingPeriodEnd || invoice.dueDate,
  )}`;

  const dueLabel =
    amountDue <= 0
      ? 'Paid in full'
      : `${formatInr(amountDue)} due on ${formatDisplayDate(invoice.dueDate)}`;

  return {
    invoice,
    lines,
    period,
    subtotal: invoice.invoicedAmount > 0 ? Math.max(subtotal, invoice.invoicedAmount - taxTotal) : subtotal,
    discount,
    taxTotal,
    paid,
    balance,
    amountDue,
    dueLabel,
    generatedAt: new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
