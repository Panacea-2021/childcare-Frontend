/** Billing Dashboard aggregations — derived from center invoices (local). */

import {
  formatInr,
  loadCenterInvoices,
  localTodayIso,
  resolveCenterInvoiceStatus,
  type CenterInvoice,
  type InvoicePayment,
} from './invoiceStore';

export type DashPeriod = 'this_month' | 'last_month' | 'this_year' | 'custom';

export type DashMode = 'dashboard' | 'expenses';

export type RevenueMonthPoint = {
  key: string;
  label: string;
  billed: number;
  collected: number;
  expense: number;
};

export type AgeingBucket = {
  id: string;
  label: string;
  count: number;
  amount: number;
  color: string;
};

export type RecentPaymentRow = {
  id: string;
  studentName: string;
  mode: string;
  date: string;
  amount: number;
  invoiceId: string;
};

export type OverdueRow = {
  id: string;
  studentName: string;
  dueDate: string;
  amount: number;
  invoiceId: string;
};

export type BillingDashboardModel = {
  billed: number;
  collected: number;
  overdue: number;
  outstanding: number;
  todayInvoiceCount: number;
  todayInvoiceAmount: number;
  revenue: RevenueMonthPoint[];
  recentPayments: RecentPaymentRow[];
  overdueInvoices: OverdueRow[];
  ageing: AgeingBucket[];
};

function parseIso(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
}

function daysBetween(fromIso: string, toIso: string) {
  const a = parseIso(fromIso).getTime();
  const b = parseIso(toIso).getTime();
  return Math.floor((b - a) / 86400000);
}

function isBillable(inv: CenterInvoice) {
  if (inv.kind === 'upcoming') return false;
  const status = resolveCenterInvoiceStatus(inv);
  return status !== 'Cancelled' && status !== 'Draft' && status !== 'Refund';
}

/** Lightweight synthetic expense curve for Revenue Stats (no expense ledger yet). */
function expenseForMonth(billed: number, collected: number, index: number) {
  const base = Math.max(40, Math.round(billed * 0.08 + collected * 0.04));
  return base + (index % 3) * 15;
}

export function buildBillingDashboard(
  period: DashPeriod = 'this_month',
  source?: CenterInvoice[],
): BillingDashboardModel {
  const today = localTodayIso();
  const now = parseIso(today);
  const invoices = (source ?? loadCenterInvoices())
    .map((r) => ({ ...r, status: resolveCenterInvoiceStatus(r) }))
    .filter(isBillable);

  let rangeStart = '';
  let rangeEnd = today;
  if (period === 'this_month') {
    rangeStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  } else if (period === 'last_month') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    rangeStart = `${lm.getFullYear()}-${String(lm.getMonth() + 1).padStart(2, '0')}-01`;
    rangeEnd = `${lmEnd.getFullYear()}-${String(lmEnd.getMonth() + 1).padStart(2, '0')}-${String(lmEnd.getDate()).padStart(2, '0')}`;
  } else {
    rangeStart = `${now.getFullYear()}-01-01`;
  }

  const inRange = (iso: string) => iso >= rangeStart && iso <= rangeEnd;

  const periodInvoices = invoices.filter((i) => inRange(i.invoiceDate));
  const billed = periodInvoices.reduce((s, i) => s + (i.invoicedAmount || 0), 0);
  const collected = periodInvoices.reduce((s, i) => s + (i.paidAmount || 0), 0);
  const overdue = periodInvoices
    .filter((i) => i.status === 'Overdue')
    .reduce((s, i) => s + (i.pendingAmount || 0), 0);
  const outstanding = periodInvoices.reduce((s, i) => s + (i.pendingAmount || 0), 0);

  const todayRows = invoices.filter((i) => i.invoiceDate === today);
  const todayInvoiceCount = todayRows.length;
  const todayInvoiceAmount = todayRows.reduce((s, i) => s + (i.invoicedAmount || 0), 0);

  const allMonthMap = new Map<string, RevenueMonthPoint>();
  for (const inv of invoices) {
    const key = monthKey(inv.invoiceDate);
    const row =
      allMonthMap.get(key) ||
      ({
        key,
        label: monthLabel(key),
        billed: 0,
        collected: 0,
        expense: 0,
      } satisfies RevenueMonthPoint);
    row.billed += inv.invoicedAmount || 0;
    row.collected += inv.paidAmount || 0;
    allMonthMap.set(key, row);
  }

  /** Trailing six calendar months so the chart always fills the panel. */
  const revenue: RevenueMonthPoint[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const row = allMonthMap.get(key) ?? {
      key,
      label: monthLabel(key),
      billed: 0,
      collected: 0,
      expense: 0,
    };
    revenue.push({ ...row });
  }
  const revenueWithExpense = revenue.map((r, i) => ({
    ...r,
    expense: expenseForMonth(r.billed, r.collected, i),
  }));

  const recentPayments: RecentPaymentRow[] = [];
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 14);
  const cutoffIso = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`;

  for (const inv of invoices) {
    for (const pay of inv.payments ?? ([] as InvoicePayment[])) {
      if (pay.date < cutoffIso) continue;
      recentPayments.push({
        id: pay.id,
        studentName: inv.studentName,
        mode: pay.mode || 'Cash',
        date: pay.date,
        amount: pay.amount,
        invoiceId: inv.id,
      });
    }
  }
  recentPayments.sort((a, b) => b.date.localeCompare(a.date));

  const overdueInvoices: OverdueRow[] = invoices
    .filter((i) => i.status === 'Overdue' && (i.pendingAmount || 0) > 0)
    .map((i) => ({
      id: i.id,
      studentName: i.studentName,
      dueDate: i.dueDate,
      amount: i.pendingAmount || 0,
      invoiceId: i.invoiceId,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 8);

  const buckets: AgeingBucket[] = [
    { id: 'd1', label: '1-15 days', count: 0, amount: 0, color: '#7C8CFF' },
    { id: 'd2', label: '16-30 days', count: 0, amount: 0, color: '#5DCEC8' },
    { id: 'd3', label: '31-45 days', count: 0, amount: 0, color: '#F0B35A' },
    { id: 'd4', label: '45+ days', count: 0, amount: 0, color: '#F07178' },
  ];
  for (const inv of invoices) {
    if (inv.status !== 'Overdue' || !(inv.pendingAmount > 0)) continue;
    const age = Math.max(1, daysBetween(inv.dueDate, today));
    const bucket =
      age <= 15 ? buckets[0] : age <= 30 ? buckets[1] : age <= 45 ? buckets[2] : buckets[3];
    bucket.count += 1;
    bucket.amount += inv.pendingAmount;
  }

  return {
    billed,
    collected,
    overdue,
    outstanding,
    todayInvoiceCount,
    todayInvoiceAmount,
    revenue: revenueWithExpense,
    recentPayments: recentPayments.slice(0, 6),
    overdueInvoices,
    ageing: buckets,
  };
}

export { formatInr };
