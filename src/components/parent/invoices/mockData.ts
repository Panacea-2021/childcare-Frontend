import { loadInvoices } from '@/lib/students/profileStore';
import type { StudentInvoice } from '@/lib/students/profileTypes';
import type {
  ParentInvoice,
  ParentInvoiceFilter,
  ParentInvoiceLine,
  ParentInvoicePayment,
  ParentInvoiceSort,
  ParentInvoiceSummaryStats,
  ParentInvoiceTotals,
  ParentInvoiceUiStatus,
} from './types';
import {
  loadParentInvoiceComments,
  visibleParentComments,
} from './parentCommentsStore';

/**
 * Toggle for visual development when `loadInvoices` returns no rows
 * (e.g. parent student IDs don't match profile seed keys).
 * Set to `false` once a real parent invoices API is wired.
 */
export const USE_PARENT_INVOICE_FALLBACK = true;

/** Demo cards matching the Student Invoices reference layout. */
export const FALLBACK_PARENT_INVOICES: ParentInvoice[] = [
  {
    id: 'pi-inv-9',
    invoiceNumber: 'INV-9',
    description: 'First Term Tuition Fees',
    invoiceDate: '2026-08-08',
    dueDate: '2026-08-09',
    amount: 9440,
    paid: 0,
    balance: 9440,
    paymentStatus: 'Pending',
    commentsCount: 0,
    lines: [
      {
        id: 'pi-inv-9-l1',
        name: 'First Term Tuition Fees',
        quantity: 1,
        unitPrice: 8000,
        taxPercent: 18,
        amount: 8000,
      },
    ],
    payments: [],
  },
  {
    id: 'pi-inv-8',
    invoiceNumber: 'INV-8',
    description: 'Fee',
    invoiceDate: '2026-08-07',
    dueDate: '2026-08-14',
    amount: 100,
    paid: 100,
    balance: 0,
    paymentStatus: 'Paid',
    commentsCount: 0,
    lines: [
      {
        id: 'pi-inv-8-l1',
        name: 'Fee',
        quantity: 1,
        unitPrice: 100,
        taxPercent: 0,
        amount: 100,
      },
    ],
    payments: [
      {
        id: 'pi-inv-8-p1',
        mode: 'Cash',
        date: '2026-08-07',
        reference: 'RCP-1008',
        amount: 100,
        receiptId: 'RCP-1008',
      },
    ],
  },
  {
    id: 'pi-inv-7',
    invoiceNumber: 'INV-7',
    description: 'Fee',
    invoiceDate: '2026-07-10',
    dueDate: '2026-07-18',
    amount: 100,
    paid: 100,
    balance: 0,
    paymentStatus: 'Paid',
    commentsCount: 0,
    lines: [
      {
        id: 'pi-inv-7-l1',
        name: 'Fee',
        quantity: 1,
        unitPrice: 100,
        taxPercent: 0,
        amount: 100,
      },
    ],
    payments: [
      {
        id: 'pi-inv-7-p1',
        mode: 'UPI',
        date: '2026-07-10',
        reference: 'UPI-77821',
        amount: 100,
        receiptId: 'RCP-1007',
      },
    ],
  },
  {
    id: 'pi-inv-6',
    invoiceNumber: 'INV-6',
    description: 'Fee +1 more',
    invoiceDate: '2026-06-01',
    dueDate: '2026-06-15',
    amount: 1100,
    paid: 0,
    balance: 1100,
    paymentStatus: 'Pending',
    commentsCount: 0,
    lines: [
      {
        id: 'pi-inv-6-l1',
        name: 'Fee',
        quantity: 1,
        unitPrice: 1000,
        taxPercent: 0,
        amount: 1000,
      },
      {
        id: 'pi-inv-6-l2',
        name: 'Activity Fee',
        quantity: 1,
        unitPrice: 100,
        taxPercent: 0,
        amount: 100,
      },
    ],
    payments: [],
  },
  {
    id: 'pi-inv-3',
    invoiceNumber: 'INV-3',
    description: 'Fee',
    invoiceDate: '2026-05-01',
    dueDate: '2026-05-10',
    amount: 100,
    paid: 100,
    balance: 0,
    paymentStatus: 'Paid',
    commentsCount: 0,
    lines: [
      {
        id: 'pi-inv-3-l1',
        name: 'Fee',
        quantity: 1,
        unitPrice: 100,
        taxPercent: 0,
        amount: 100,
      },
    ],
    payments: [
      {
        id: 'pi-inv-3-p1',
        mode: 'Card',
        date: '2026-05-02',
        reference: 'CARD-3301',
        amount: 100,
        receiptId: 'RCP-1003',
      },
    ],
  },
  {
    id: 'pi-inv-2',
    invoiceNumber: 'INV-2',
    description: 'Activity Fee',
    invoiceDate: '2026-04-01',
    dueDate: '2026-04-12',
    amount: 2500,
    paid: 500,
    balance: 2000,
    paymentStatus: 'Overdue',
    commentsCount: 0,
    lines: [
      {
        id: 'pi-inv-2-l1',
        name: 'Activity Fee',
        quantity: 1,
        unitPrice: 2500,
        taxPercent: 0,
        amount: 2500,
      },
    ],
    payments: [
      {
        id: 'pi-inv-2-p1',
        mode: 'Bank Transfer',
        date: '2026-04-05',
        reference: 'NEFT-5521',
        amount: 500,
        receiptId: 'RCP-1002',
      },
    ],
  },
];

const DESCRIPTION_HINTS: Record<string, string> = {
  'INV-2026-1042': 'Annual Tuition Fees',
  'INV-2026-1188': 'Second Term Tuition Fees',
  'INV-2026-1301': 'Term Tuition Fees',
  'INV-2026-0988': 'First Term Tuition Fees',
  'INV-2026-1210': 'Second Term Tuition Fees',
  'INV-2026-0877': 'Annual Tuition Fees',
  'INV-2026-1402': 'Term Tuition Fees',
};

function synthesizeLine(inv: StudentInvoice, description: string): ParentInvoiceLine {
  return {
    id: `${inv.id}-line-1`,
    name: description,
    quantity: 1,
    unitPrice: inv.amount,
    taxPercent: 0,
    amount: inv.amount,
  };
}

function synthesizePayment(inv: StudentInvoice): ParentInvoicePayment | null {
  if (inv.paid <= 0) return null;
  return {
    id: `${inv.id}-pay-1`,
    mode: 'Online',
    date: inv.invoiceDate,
    reference: undefined,
    amount: inv.paid,
    receiptId: `RCP-${inv.invoiceNumber}`,
  };
}

export function hydrateParentInvoiceComments(inv: ParentInvoice): ParentInvoice {
  const stored = loadParentInvoiceComments(inv.id);
  const merged = visibleParentComments([...(inv.comments ?? []), ...stored]);
  // Dedupe by id (stored wins over seed duplicates).
  const byId = new Map(merged.map((c) => [c.id, c]));
  const comments = Array.from(byId.values()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  return {
    ...inv,
    comments,
    commentsCount: comments.length,
  };
}

export function toParentInvoice(inv: StudentInvoice): ParentInvoice {
  const description = DESCRIPTION_HINTS[inv.invoiceNumber] ?? 'Fee';
  const payment = synthesizePayment(inv);
  return hydrateParentInvoiceComments({
    ...inv,
    description,
    commentsCount: 0,
    comments: [],
    lines: [synthesizeLine(inv, description)],
    payments: payment ? [payment] : [],
  });
}

/**
 * Prefer real/profile store invoices for the selected student.
 * Falls back to isolated mock data only when the store has nothing.
 */
export function resolveParentInvoices(studentId: string | null | undefined): ParentInvoice[] {
  const hydrateList = (rows: ParentInvoice[]) => rows.map(hydrateParentInvoiceComments);
  if (!studentId) {
    return USE_PARENT_INVOICE_FALLBACK ? hydrateList([...FALLBACK_PARENT_INVOICES]) : [];
  }
  const fromStore = loadInvoices(studentId).map(toParentInvoice);
  if (fromStore.length > 0) return fromStore;
  return USE_PARENT_INVOICE_FALLBACK ? hydrateList([...FALLBACK_PARENT_INVOICES]) : [];
}

export function formatInvoiceAmount(amount: number) {
  return `INR ${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatRupeeAmount(amount: number) {
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)}`;
}

/** Compact due/created dates: 09/08/26 */
export function formatCompactDate(iso: string) {
  if (!iso || iso === '—') return '—';
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function isInvoiceOverdue(inv: ParentInvoice, today = startOfDay()) {
  if (inv.paymentStatus === 'Paid' || inv.balance <= 0) return false;
  if (inv.paymentStatus === 'Overdue') return true;
  const due = new Date(inv.dueDate.length <= 10 ? `${inv.dueDate}T00:00:00` : inv.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  due.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

export function resolveUiStatus(inv: ParentInvoice, today = startOfDay()): ParentInvoiceUiStatus {
  if (inv.paymentStatus === 'Paid' || inv.balance <= 0) return 'Paid';
  if (isInvoiceOverdue(inv, today)) return 'Overdue';
  if (inv.paymentStatus === 'Partial' || (inv.paid > 0 && inv.balance > 0)) return 'Partial';
  return 'Pending';
}

export function isInvoicePayable(inv: ParentInvoice) {
  return inv.balance > 0 && resolveUiStatus(inv) !== 'Paid';
}

export function isInvoiceFullyPaid(inv: ParentInvoice) {
  return inv.balance <= 0 || inv.paymentStatus === 'Paid';
}

export function hasInvoiceReceipts(inv: ParentInvoice) {
  return (inv.payments ?? []).some((p) => Boolean(p.receiptId) || p.amount > 0);
}

export function getInvoiceLines(inv: ParentInvoice): ParentInvoiceLine[] {
  if (inv.lines && inv.lines.length > 0) return inv.lines;
  return [
    {
      id: `${inv.id}-fallback-line`,
      name: inv.description || 'Fee',
      quantity: 1,
      unitPrice: inv.amount,
      taxPercent: 0,
      amount: inv.amount,
    },
  ];
}

export function computeInvoiceTotals(inv: ParentInvoice): ParentInvoiceTotals {
  const lines = getInvoiceLines(inv);
  const subTotal = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
  const tax = lines.reduce((sum, line) => {
    if (line.taxPercent <= 0) return sum;
    return sum + (line.quantity * line.unitPrice * line.taxPercent) / 100;
  }, 0);

  const taxedTotal = subTotal + tax;
  const amountExcludesTax =
    tax > 0 && Math.abs(taxedTotal - inv.amount) < 0.5;

  const primaryTax = lines.find((l) => l.taxPercent > 0)?.taxPercent ?? null;
  const taxLabel =
    tax > 0 && primaryTax != null ? `GST (${primaryTax}%)` : tax > 0 ? 'Tax' : null;

  return {
    subTotal,
    tax,
    taxLabel,
    totalAmount: inv.amount,
    paidAmount: inv.paid,
    amountDue: inv.balance,
    amountExcludesTax,
  };
}

export function computeSummaryStats(
  invoices: ParentInvoice[],
  today = startOfDay(),
): ParentInvoiceSummaryStats {
  let pendingAmount = 0;
  let paidAmount = 0;
  let overdueCount = 0;

  for (const inv of invoices) {
    paidAmount += inv.paid;
    if (inv.balance > 0) pendingAmount += inv.balance;
    if (isInvoiceOverdue(inv, today)) overdueCount += 1;
  }

  return {
    total: invoices.length,
    pendingAmount,
    paidAmount,
    overdueCount,
  };
}

export function filterParentInvoices(
  invoices: ParentInvoice[],
  filter: ParentInvoiceFilter,
  search: string,
  today = startOfDay(),
): ParentInvoice[] {
  const q = search.trim().toLowerCase();

  return invoices.filter((inv) => {
    const status = resolveUiStatus(inv, today);

    if (filter === 'paid' && status !== 'Paid') return false;
    if (filter === 'pending' && status !== 'Pending' && status !== 'Partial') return false;
    if (filter === 'overdue' && status !== 'Overdue') return false;

    if (!q) return true;
    const amountStr = String(inv.amount);
    const amountFmt = formatInvoiceAmount(inv.amount).toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.description.toLowerCase().includes(q) ||
      amountStr.includes(q) ||
      amountFmt.includes(q) ||
      formatRupeeAmount(inv.amount).toLowerCase().includes(q)
    );
  });
}

export function sortParentInvoices(invoices: ParentInvoice[], sort: ParentInvoiceSort): ParentInvoice[] {
  const list = [...invoices];
  const time = (iso: string) => {
    const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
    return Number.isNaN(d.getTime()) ? 0 : d.getTime();
  };

  switch (sort) {
    case 'oldest':
      return list.sort((a, b) => time(a.invoiceDate) - time(b.invoiceDate));
    case 'amount-high':
      return list.sort((a, b) => b.amount - a.amount);
    case 'amount-low':
      return list.sort((a, b) => a.amount - b.amount);
    case 'due-date':
      return list.sort((a, b) => time(a.dueDate) - time(b.dueDate));
    case 'newest':
    default:
      return list.sort((a, b) => time(b.invoiceDate) - time(a.invoiceDate));
  }
}

export function markInvoicePaid(inv: ParentInvoice): ParentInvoice {
  const today = new Date();
  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const payAmount = inv.balance > 0 ? inv.balance : inv.amount;
  const nextPayment: ParentInvoicePayment = {
    id: `${inv.id}-pay-${Date.now()}`,
    mode: 'Online',
    date: iso,
    reference: `PAY-${inv.invoiceNumber}`,
    amount: payAmount,
    receiptId: `RCP-${inv.invoiceNumber}`,
  };

  return {
    ...inv,
    paid: inv.amount,
    balance: 0,
    paymentStatus: 'Paid',
    payments: [...(inv.payments ?? []), nextPayment],
  };
}
