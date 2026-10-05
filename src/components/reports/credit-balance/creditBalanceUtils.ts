import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type CreditBalanceColumnMode = 'all' | 'custom';

export type CreditBalanceColumnId =
  | 'centerCode'
  | 'centerName'
  | 'student'
  | 'admissionNo'
  | 'transactionType'
  | 'directCreditIssued'
  | 'transferredFromDeposit'
  | 'creditUsed'
  | 'creditRefunded'
  | 'date'
  | 'creditBalanceNo'
  | 'reason'
  | 'invoiceNo'
  | 'recordedBy'
  | 'currentBalance';

/** UI order — page 1 (10) then page 2 (5). */
export const CREDIT_BALANCE_COLUMNS: { id: CreditBalanceColumnId; label: string }[] = [
  { id: 'centerCode', label: 'Center Code' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'student', label: 'Student' },
  { id: 'admissionNo', label: 'Admission No' },
  { id: 'transactionType', label: 'Transaction Type' },
  { id: 'directCreditIssued', label: 'Direct Credit Balance Issued' },
  { id: 'transferredFromDeposit', label: 'Transferred From Deposit' },
  { id: 'creditUsed', label: 'Credit Balance Used' },
  { id: 'creditRefunded', label: 'Credit Balance Refunded' },
  { id: 'date', label: 'Date' },
  { id: 'creditBalanceNo', label: 'Credit Balance No' },
  { id: 'reason', label: 'Reason' },
  { id: 'invoiceNo', label: 'Invoice No' },
  { id: 'recordedBy', label: 'Recorded By' },
  { id: 'currentBalance', label: 'Current Balance' },
];

export type CreditBalanceFormValues = {
  startDate: string;
  endDate: string;
  studentIds: string[];
  columnMode: CreditBalanceColumnMode;
  selectedColumns: CreditBalanceColumnId[];
};

type TxSeed = {
  transactionType: string;
  directCreditIssued: number;
  transferredFromDeposit: number;
  creditUsed: number;
  creditRefunded: number;
  creditBalanceNo: string;
  reason: string;
  invoiceNo: string;
  recordedBy: string;
  currentBalance: number;
  dayOffset: number;
};

const TRANSACTIONS: Record<string, TxSeed> = {
  s1: {
    transactionType: 'Credit Issued',
    directCreditIssued: 2500,
    transferredFromDeposit: 0,
    creditUsed: 500,
    creditRefunded: 0,
    creditBalanceNo: 'CB-10421',
    reason: 'Promotional credit',
    invoiceNo: 'INV-22901',
    recordedBy: 'Malika Thimisetty',
    currentBalance: 2000,
    dayOffset: 3,
  },
  s2: {
    transactionType: 'Transfer From Deposit',
    directCreditIssued: 0,
    transferredFromDeposit: 1500,
    creditUsed: 0,
    creditRefunded: 0,
    creditBalanceNo: 'CB-10488',
    reason: 'Deposit conversion',
    invoiceNo: '—',
    recordedBy: 'Priya Nair',
    currentBalance: 1500,
    dayOffset: 8,
  },
  s3: {
    transactionType: 'Credit Used',
    directCreditIssued: 1000,
    transferredFromDeposit: 0,
    creditUsed: 1000,
    creditRefunded: 0,
    creditBalanceNo: 'CB-10502',
    reason: 'Applied to invoice',
    invoiceNo: 'INV-23014',
    recordedBy: 'Rahul Mehta',
    currentBalance: 0,
    dayOffset: 12,
  },
  s4: {
    transactionType: 'Credit Refunded',
    directCreditIssued: 3000,
    transferredFromDeposit: 0,
    creditUsed: 0,
    creditRefunded: 1200,
    creditBalanceNo: 'CB-10540',
    reason: 'Partial refund',
    invoiceNo: 'INV-23088',
    recordedBy: 'Anita Kapoor',
    currentBalance: 1800,
    dayOffset: 5,
  },
  s5: {
    transactionType: 'Credit Issued',
    directCreditIssued: 800,
    transferredFromDeposit: 200,
    creditUsed: 0,
    creditRefunded: 0,
    creditBalanceNo: 'CB-10577',
    reason: 'Goodwill adjustment',
    invoiceNo: '—',
    recordedBy: 'Malika Thimisetty',
    currentBalance: 1000,
    dayOffset: 1,
  },
  s7: {
    transactionType: 'Transfer From Deposit',
    directCreditIssued: 0,
    transferredFromDeposit: 2200,
    creditUsed: 700,
    creditRefunded: 0,
    creditBalanceNo: 'CB-10601',
    reason: 'Deposit transfer',
    invoiceNo: 'INV-23110',
    recordedBy: 'Priya Nair',
    currentBalance: 1500,
    dayOffset: 15,
  },
  s12: {
    transactionType: 'Credit Issued',
    directCreditIssued: 5000,
    transferredFromDeposit: 0,
    creditUsed: 2500,
    creditRefunded: 0,
    creditBalanceNo: 'CB-10644',
    reason: 'Sibling discount credit',
    invoiceNo: 'INV-23155',
    recordedBy: 'Rahul Mehta',
    currentBalance: 2500,
    dayOffset: 6,
  },
};

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function defaultCreditBalanceForm(): CreditBalanceFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    studentIds: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: CreditBalanceFormValues) {
  if (values.columnMode === 'all') return CREDIT_BALANCE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return CREDIT_BALANCE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildCreditBalanceRows(
  values: CreditBalanceFormValues,
): Record<string, string>[] {
  let students = MOCK_STUDENTS.filter((s) => TRANSACTIONS[s.id]);

  if (values.studentIds.length) {
    students = students.filter((s) => values.studentIds.includes(s.id));
  }

  const cols = activeColumns(values);

  return students
    .map((student) => {
      const tx = TRANSACTIONS[student.id];
      const txDate = addDays(values.startDate, tx.dayOffset);
      if (txDate < values.startDate || txDate > values.endDate) return null;

      const full: Record<CreditBalanceColumnId, string> = {
        centerCode: 'CTR-001',
        centerName: 'Main Campus',
        student: student.name,
        admissionNo: student.admissionNo,
        transactionType: tx.transactionType,
        directCreditIssued: inr(tx.directCreditIssued),
        transferredFromDeposit: inr(tx.transferredFromDeposit),
        creditUsed: inr(tx.creditUsed),
        creditRefunded: inr(tx.creditRefunded),
        date: toDisplayDate(txDate),
        creditBalanceNo: tx.creditBalanceNo,
        reason: tx.reason,
        invoiceNo: tx.invoiceNo,
        recordedBy: tx.recordedBy,
        currentBalance: inr(tx.currentBalance),
      };

      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      return row;
    })
    .filter((row): row is Record<string, string> => !!row);
}

export function createCreditBalanceReport(
  values: CreditBalanceFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildCreditBalanceRows(values);
  const now = new Date();

  const selectedStudents = values.studentIds.length
    ? values.studentIds
        .map((id) => MOCK_STUDENTS.find((s) => s.id === id)?.name)
        .filter(Boolean)
        .join(', ')
    : 'All students';

  return {
    id: `cbr-${now.getTime()}`,
    kind: 'credit-balance',
    name: `Credit_Balance_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'student',
    selectedLabel: selectedStudents,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
