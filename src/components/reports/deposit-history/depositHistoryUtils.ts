import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type DepositColumnMode = 'all' | 'custom';

export type DepositColumnId =
  | 'studentId'
  | 'studentName'
  | 'preferredName'
  | 'admissionNumber'
  | 'classList'
  | 'transaction'
  | 'amountAdded'
  | 'status'
  | 'dateAdded'
  | 'amountWithdrawn'
  | 'addedBy'
  | 'description'
  | 'creditBalanceNumber'
  | 'branch';

export const DEPOSIT_COLUMNS: { id: DepositColumnId; label: string }[] = [
  { id: 'studentId', label: 'Student ID' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classList', label: 'Class List' },
  { id: 'transaction', label: 'Transaction' },
  { id: 'amountAdded', label: 'Amount Added' },
  { id: 'status', label: 'Status' },
  { id: 'dateAdded', label: 'Date Added' },
  { id: 'amountWithdrawn', label: 'Amount Withdrawn' },
  { id: 'addedBy', label: 'Added By' },
  { id: 'description', label: 'Description' },
  { id: 'creditBalanceNumber', label: 'Credit Balance Number' },
  { id: 'branch', label: 'Branch' },
];

export type DepositHistoryFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  columnMode: DepositColumnMode;
  selectedColumns: DepositColumnId[];
};

type DepositSeed = {
  studentId: string;
  preferredName: string;
  transaction: string;
  amountAdded: number;
  status: 'Completed' | 'Pending' | 'Reversed';
  dateAdded: string;
  amountWithdrawn: number;
  addedBy: string;
  description: string;
  creditBalanceNumber: string;
};

const DEPOSITS: DepositSeed[] = [
  {
    studentId: 's1',
    preferredName: 'Em',
    transaction: 'Deposit',
    amountAdded: 5000,
    status: 'Completed',
    dateAdded: '2026-07-03',
    amountWithdrawn: 0,
    addedBy: 'Malika Thimisetty',
    description: 'Opening security deposit',
    creditBalanceNumber: 'CB-2026-0142',
  },
  {
    studentId: 's2',
    preferredName: 'Aaru',
    transaction: 'Deposit',
    amountAdded: 3000,
    status: 'Completed',
    dateAdded: '2026-07-08',
    amountWithdrawn: 0,
    addedBy: 'Priya Nair',
    description: 'Advance tuition credit',
    creditBalanceNumber: 'CB-2026-0151',
  },
  {
    studentId: 's3',
    preferredName: 'Mia',
    transaction: 'Withdrawal',
    amountAdded: 0,
    status: 'Completed',
    dateAdded: '2026-07-12',
    amountWithdrawn: 1500,
    addedBy: 'Front Desk',
    description: 'Invoice adjustment from deposit',
    creditBalanceNumber: 'CB-2026-0158',
  },
  {
    studentId: 's5',
    preferredName: 'Sofi',
    transaction: 'Deposit',
    amountAdded: 7500,
    status: 'Completed',
    dateAdded: '2026-07-18',
    amountWithdrawn: 0,
    addedBy: 'Rahul Mehta',
    description: 'Annual deposit top-up',
    creditBalanceNumber: 'CB-2026-0170',
  },
  {
    studentId: 's7',
    preferredName: 'Avi',
    transaction: 'Deposit',
    amountAdded: 2500,
    status: 'Pending',
    dateAdded: '2026-07-25',
    amountWithdrawn: 0,
    addedBy: 'Priya Nair',
    description: 'Cheque deposit — clearing',
    creditBalanceNumber: 'CB-2026-0180',
  },
  {
    studentId: 's4',
    preferredName: 'Li',
    transaction: 'Withdrawal',
    amountAdded: 0,
    status: 'Completed',
    dateAdded: '2026-07-15',
    amountWithdrawn: 2000,
    addedBy: 'Malika Thimisetty',
    description: 'Partial refund on plan change',
    creditBalanceNumber: 'CB-2026-0164',
  },
  {
    studentId: 's9',
    preferredName: 'Liv',
    transaction: 'Deposit',
    amountAdded: 4000,
    status: 'Completed',
    dateAdded: '2026-07-30',
    amountWithdrawn: 0,
    addedBy: 'Front Desk',
    description: 'Infant enrollment deposit',
    creditBalanceNumber: 'CB-2026-0192',
  },
  {
    studentId: 's12',
    preferredName: 'Mace',
    transaction: 'Withdrawal',
    amountAdded: 0,
    status: 'Reversed',
    dateAdded: '2026-08-02',
    amountWithdrawn: 1000,
    addedBy: 'Rahul Mehta',
    description: 'Reversed duplicate withdrawal',
    creditBalanceNumber: 'CB-2026-0198',
  },
  {
    studentId: 's8',
    preferredName: 'Eth',
    transaction: 'Deposit',
    amountAdded: 6000,
    status: 'Completed',
    dateAdded: '2026-07-22',
    amountWithdrawn: 500,
    addedBy: 'Priya Nair',
    description: 'Deposit with incidental draw',
    creditBalanceNumber: 'CB-2026-0188',
  },
];

export function defaultDepositHistoryForm(): DepositHistoryFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: DepositHistoryFormValues) {
  if (values.columnMode === 'all') return DEPOSIT_COLUMNS;
  const set = new Set(values.selectedColumns);
  return DEPOSIT_COLUMNS.filter((c) => set.has(c.id));
}

export function buildDepositHistoryRows(
  values: DepositHistoryFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const roomSet = new Set(values.rooms);
  const cols = activeColumns(values);

  return DEPOSITS.filter((d) => {
    if (d.dateAdded < values.startDate || d.dateAdded > values.endDate) return false;
    if (!roomSet.size) return true;
    const student = byId.get(d.studentId);
    return student ? roomSet.has(student.room) : false;
  }).map((d) => {
    const student = byId.get(d.studentId);
    const full: Record<DepositColumnId, string> = {
      studentId: d.studentId.toUpperCase(),
      studentName: student?.name ?? '—',
      preferredName: d.preferredName,
      admissionNumber: student?.admissionNo ?? '—',
      classList: student?.room ?? '—',
      transaction: d.transaction,
      amountAdded: money(d.amountAdded),
      status: d.status,
      dateAdded: toDisplayDate(d.dateAdded),
      amountWithdrawn: money(d.amountWithdrawn),
      addedBy: d.addedBy,
      description: d.description,
      creditBalanceNumber: d.creditBalanceNumber,
      branch: 'Main Campus',
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createDepositHistoryReport(
  values: DepositHistoryFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildDepositHistoryRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';

  return {
    id: `dep-${now.getTime()}`,
    kind: 'deposit-history',
    name: `Deposit_History_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: roomsLabel,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
