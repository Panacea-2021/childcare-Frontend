import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type {
  GeneratedExcelReport,
  ReportExportFormat,
} from '@/components/reports/shared/generatedReport';

export type CustomerStatementColumnMode = 'all' | 'custom';

export type CustomerStatementColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'classroom'
  | 'date'
  | 'transactionType'
  | 'documentNumber'
  | 'feePlan'
  | 'description'
  | 'charge'
  | 'payments'
  | 'balance'
  | 'centerName';

/** Page 1 (10) then page 2 (2) — 12 total. */
export const CUSTOMER_STATEMENT_COLUMNS: {
  id: CustomerStatementColumnId;
  label: string;
}[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'date', label: 'Date' },
  { id: 'transactionType', label: 'Transaction Type' },
  { id: 'documentNumber', label: 'Document Number' },
  { id: 'feePlan', label: 'Fee Plan' },
  { id: 'description', label: 'Description' },
  { id: 'charge', label: 'Charge' },
  { id: 'payments', label: 'Payments' },
  { id: 'balance', label: 'Balance' },
  { id: 'centerName', label: 'Center Name' },
];

export type CustomerStatementFormValues = {
  studentIds: string[];
  format: ReportExportFormat;
  columnMode: CustomerStatementColumnMode;
  selectedColumns: CustomerStatementColumnId[];
};

type StatementSeed = {
  studentId: string;
  date: string;
  transactionType: string;
  documentNumber: string;
  feePlan: string;
  description: string;
  charge: number;
  payments: number;
  balance: number;
};

const STATEMENTS: StatementSeed[] = [
  {
    studentId: 's1',
    date: '2026-07-03',
    transactionType: 'Invoice',
    documentNumber: 'INV-2026-0142',
    feePlan: 'Full Day Premium',
    description: 'July tuition',
    charge: 18500,
    payments: 15000,
    balance: 3500,
  },
  {
    studentId: 's1',
    date: '2026-07-10',
    transactionType: 'Payment',
    documentNumber: 'PAY-2026-0881',
    feePlan: 'Full Day Premium',
    description: 'Online payment',
    charge: 0,
    payments: 3500,
    balance: 0,
  },
  {
    studentId: 's2',
    date: '2026-07-05',
    transactionType: 'Invoice',
    documentNumber: 'INV-2026-0148',
    feePlan: 'Half Day Standard',
    description: 'July tuition',
    charge: 9800,
    payments: 9800,
    balance: 0,
  },
  {
    studentId: 's3',
    date: '2026-07-08',
    transactionType: 'Invoice',
    documentNumber: 'INV-2026-0155',
    feePlan: 'Full Day Standard',
    description: 'July tuition + materials',
    charge: 15200,
    payments: 10000,
    balance: 5200,
  },
  {
    studentId: 's5',
    date: '2026-07-12',
    transactionType: 'Credit',
    documentNumber: 'CR-2026-0170',
    feePlan: 'Extended Care',
    description: 'Sibling discount credit',
    charge: 0,
    payments: 3000,
    balance: -3000,
  },
  {
    studentId: 's7',
    date: '2026-07-15',
    transactionType: 'Invoice',
    documentNumber: 'INV-2026-0175',
    feePlan: 'Full Day Standard',
    description: 'July tuition',
    charge: 14200,
    payments: 5000,
    balance: 9200,
  },
  {
    studentId: 's8',
    date: '2026-07-20',
    transactionType: 'Payment',
    documentNumber: 'PAY-2026-0912',
    feePlan: 'Full Day Premium',
    description: 'Card payment',
    charge: 0,
    payments: 8000,
    balance: 0,
  },
];

export function defaultCustomerStatementForm(): CustomerStatementFormValues {
  return {
    studentIds: [],
    format: 'excel',
    columnMode: 'custom',
    selectedColumns: [],
  };
}

/** PDF is only allowed when exactly one student is selected. */
export function isPdfAllowed(studentIds: string[]) {
  return studentIds.length === 1;
}

function money(n: number) {
  const abs = Math.abs(n).toLocaleString('en-IN');
  return n < 0 ? `-₹${abs}` : `₹${abs}`;
}

function activeColumns(values: CustomerStatementFormValues) {
  if (values.columnMode === 'all') return CUSTOMER_STATEMENT_COLUMNS;
  const set = new Set(values.selectedColumns);
  return CUSTOMER_STATEMENT_COLUMNS.filter((c) => set.has(c.id));
}

export function buildCustomerStatementRows(
  values: CustomerStatementFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const selected = new Set(values.studentIds);
  const cols = activeColumns(values);

  return STATEMENTS.filter((row) => {
    if (!selected.size) return true;
    return selected.has(row.studentId);
  }).map((row) => {
    const student = byId.get(row.studentId);
    const full: Record<CustomerStatementColumnId, string> = {
      studentName: student?.name ?? '—',
      admissionNumber: student?.admissionNo ?? '—',
      classroom: student?.room ?? '—',
      date: toDisplayDate(row.date),
      transactionType: row.transactionType,
      documentNumber: row.documentNumber,
      feePlan: row.feePlan,
      description: row.description,
      charge: money(row.charge),
      payments: money(row.payments),
      balance: money(row.balance),
      centerName: 'Hams Kids Home | Daycare',
    };

    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createCustomerStatementReport(
  values: CustomerStatementFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildCustomerStatementRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isPdf = values.format === 'pdf';

  const studentsLabel = values.studentIds.length
    ? MOCK_STUDENTS.filter((s) => values.studentIds.includes(s.id))
        .map((s) => s.name)
        .join(', ')
    : 'All students';

  return {
    id: `cs-${now.getTime()}`,
    kind: 'customer-statement',
    name: isPdf
      ? `Customer_Statement_${toFileDate(today)}.pdf`
      : `Customer_Statement_${toFileDate(today)}.xlsx`,
    format: values.format,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'student',
    selectedLabel: studentsLabel,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
