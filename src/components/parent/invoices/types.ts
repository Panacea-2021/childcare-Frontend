import type { InvoiceComment } from '@/lib/billing-accounting/invoiceStore';
import type { InvoicePaymentStatus, StudentInvoice } from '@/lib/students/profileTypes';

export type ParentInvoiceFilter = 'all' | 'pending' | 'paid' | 'overdue';

export type ParentInvoiceSort =
  | 'newest'
  | 'oldest'
  | 'amount-high'
  | 'amount-low'
  | 'due-date';

/** Line item — mirrors admin `InvoiceLine` fields used in the detail table. */
export type ParentInvoiceLine = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  /** Row amount (excl. tax when taxPercent > 0 and totals include tax separately). */
  amount: number;
};

/** Payment record — mirrors admin `InvoicePayment` fields used in the records table. */
export type ParentInvoicePayment = {
  id: string;
  mode: string;
  date: string;
  reference?: string;
  amount: number;
  receiptId?: string;
};

/** UI model — extends profile invoice with optional display/detail fields. */
export type ParentInvoice = StudentInvoice & {
  /** Fee / line description shown on cards. Not always present from backend. */
  description: string;
  lines?: ParentInvoiceLine[];
  payments?: ParentInvoicePayment[];
  /** Same shape as admin `InvoiceComment` (local persistence until API exists). */
  comments?: InvoiceComment[];
  commentsCount?: number;
};

export type { InvoiceComment };

export type ParentInvoiceSummaryStats = {
  total: number;
  pendingAmount: number;
  paidAmount: number;
  overdueCount: number;
};

export type ParentInvoiceUiStatus = 'Paid' | 'Pending' | 'Partial' | 'Overdue';

export type ParentInvoiceTotals = {
  subTotal: number;
  tax: number;
  taxLabel: string | null;
  totalAmount: number;
  paidAmount: number;
  amountDue: number;
  amountExcludesTax: boolean;
};

export type { InvoicePaymentStatus, StudentInvoice };
