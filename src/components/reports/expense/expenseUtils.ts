import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type ExpenseColumnMode = 'all' | 'custom';

export type ExpenseColumnId =
  | 'expenseDate'
  | 'category'
  | 'expenseType'
  | 'description'
  | 'vendor'
  | 'amount'
  | 'paymentMode'
  | 'recordedBy'
  | 'center'
  | 'status'
  | 'referenceNo'
  | 'notes';

export const EXPENSE_COLUMNS: { id: ExpenseColumnId; label: string }[] = [
  { id: 'expenseDate', label: 'Expense Date' },
  { id: 'category', label: 'Category' },
  { id: 'expenseType', label: 'Expense Type' },
  { id: 'description', label: 'Description' },
  { id: 'vendor', label: 'Vendor' },
  { id: 'amount', label: 'Amount' },
  { id: 'paymentMode', label: 'Payment Mode' },
  { id: 'recordedBy', label: 'Recorded By' },
  { id: 'center', label: 'Center' },
  { id: 'status', label: 'Status' },
  { id: 'referenceNo', label: 'Reference No' },
  { id: 'notes', label: 'Notes' },
];

export type ExpenseFormValues = {
  startDate: string;
  endDate: string;
  columnMode: ExpenseColumnMode;
  selectedColumns: ExpenseColumnId[];
};

type ExpenseSeed = {
  expenseDate: string;
  category: string;
  expenseType: string;
  description: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  recordedBy: string;
  center: string;
  status: string;
  referenceNo: string;
  notes: string;
};

const EXPENSES: ExpenseSeed[] = [
  {
    expenseDate: '2026-07-05',
    category: 'Utilities',
    expenseType: 'Electricity',
    description: 'July electricity bill',
    vendor: 'City Power Co.',
    amount: 18450,
    paymentMode: 'Net Banking',
    recordedBy: 'Malika Thimisetty',
    center: 'Main Campus',
    status: 'Paid',
    referenceNo: 'EXP-22041',
    notes: 'Auto-debit',
  },
  {
    expenseDate: '2026-07-08',
    category: 'Supplies',
    expenseType: 'Classroom Materials',
    description: 'Art & craft restock',
    vendor: 'Bright Kids Supplies',
    amount: 6250,
    paymentMode: 'UPI',
    recordedBy: 'Priya Nair',
    center: 'Main Campus',
    status: 'Paid',
    referenceNo: 'EXP-22058',
    notes: '—',
  },
  {
    expenseDate: '2026-07-12',
    category: 'Maintenance',
    expenseType: 'Repairs',
    description: 'AC service – toddler wing',
    vendor: 'CoolAir Services',
    amount: 3900,
    paymentMode: 'Cash',
    recordedBy: 'Rahul Mehta',
    center: 'East Wing',
    status: 'Paid',
    referenceNo: 'EXP-22077',
    notes: 'Warranty check done',
  },
  {
    expenseDate: '2026-07-18',
    category: 'Food & Nutrition',
    expenseType: 'Catering',
    description: 'Weekly meal supplies',
    vendor: 'FreshBite Caterers',
    amount: 14200,
    paymentMode: 'Card',
    recordedBy: 'Anita Kapoor',
    center: 'Main Campus',
    status: 'Paid',
    referenceNo: 'EXP-22102',
    notes: 'Includes snack packs',
  },
  {
    expenseDate: '2026-07-22',
    category: 'Staff',
    expenseType: 'Training',
    description: 'CPR certification workshop',
    vendor: 'SafeCare Academy',
    amount: 8500,
    paymentMode: 'UPI',
    recordedBy: 'Malika Thimisetty',
    center: 'Main Campus',
    status: 'Approved',
    referenceNo: 'EXP-22118',
    notes: '6 staff members',
  },
  {
    expenseDate: '2026-07-28',
    category: 'Admin',
    expenseType: 'Software',
    description: 'Subscription renewal',
    vendor: 'CloudSchool SaaS',
    amount: 9990,
    paymentMode: 'Net Banking',
    recordedBy: 'Priya Nair',
    center: 'Main Campus',
    status: 'Paid',
    referenceNo: 'EXP-22140',
    notes: 'Annual plan',
  },
  {
    expenseDate: '2026-08-01',
    category: 'Transport',
    expenseType: 'Fuel',
    description: 'Van fuel refill',
    vendor: 'Highway Fuels',
    amount: 4200,
    paymentMode: 'Cash',
    recordedBy: 'Rahul Mehta',
    center: 'East Wing',
    status: 'Paid',
    referenceNo: 'EXP-22155',
    notes: '—',
  },
  {
    expenseDate: '2026-08-03',
    category: 'Supplies',
    expenseType: 'Cleaning',
    description: 'Hygiene & cleaning stock',
    vendor: 'CleanNest Traders',
    amount: 2750,
    paymentMode: 'UPI',
    recordedBy: 'Anita Kapoor',
    center: 'Main Campus',
    status: 'Pending',
    referenceNo: 'EXP-22162',
    notes: 'Awaiting invoice copy',
  },
];

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function defaultExpenseForm(): ExpenseFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: ExpenseFormValues) {
  if (values.columnMode === 'all') return EXPENSE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return EXPENSE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildExpenseRows(values: ExpenseFormValues): Record<string, string>[] {
  const cols = activeColumns(values);

  return EXPENSES.filter(
    (row) => row.expenseDate >= values.startDate && row.expenseDate <= values.endDate,
  ).map((row) => {
    const full: Record<ExpenseColumnId, string> = {
      expenseDate: toDisplayDate(row.expenseDate),
      category: row.category,
      expenseType: row.expenseType,
      description: row.description,
      vendor: row.vendor,
      amount: inr(row.amount),
      paymentMode: row.paymentMode,
      recordedBy: row.recordedBy,
      center: row.center,
      status: row.status,
      referenceNo: row.referenceNo,
      notes: row.notes,
    };

    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createExpenseReport(
  values: ExpenseFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildExpenseRows(values);
  const now = new Date();

  return {
    id: `exp-${now.getTime()}`,
    kind: 'expense',
    name: `Expense_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${toDisplayDate(values.startDate)} – ${toDisplayDate(values.endDate)}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
