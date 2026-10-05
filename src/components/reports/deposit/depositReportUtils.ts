import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type DepositReportColumnMode = 'all' | 'custom';

export type DepositReportColumnId =
  | 'center'
  | 'admissionNumber'
  | 'studentName'
  | 'studentStatus'
  | 'withdrawnDate'
  | 'paymentDueDate'
  | 'depositBilled'
  | 'collection'
  | 'depositOutstanding'
  | 'offsetToOutstanding'
  | 'refund'
  | 'totalFeesOutstanding'
  | 'totalWithheld';

/** Page 1 (10) then page 2 (3) — 13 total. */
export const DEPOSIT_REPORT_COLUMNS: { id: DepositReportColumnId; label: string }[] = [
  { id: 'center', label: 'Center' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'studentStatus', label: 'Student Status' },
  { id: 'withdrawnDate', label: 'Withdrawn Date' },
  { id: 'paymentDueDate', label: 'Payment Due Date' },
  { id: 'depositBilled', label: 'Deposit Billed' },
  { id: 'collection', label: 'Collection' },
  { id: 'depositOutstanding', label: 'Deposit Outstanding' },
  { id: 'offsetToOutstanding', label: 'Offset to Outstanding' },
  { id: 'refund', label: 'Refund' },
  { id: 'totalFeesOutstanding', label: 'Total Fees Outstanding' },
  { id: 'totalWithheld', label: 'Total Withheld' },
];

export type DepositReportFormValues = {
  startDate: string;
  endDate: string;
  columnMode: DepositReportColumnMode;
  selectedColumns: DepositReportColumnId[];
};

type DepositSeed = {
  studentId: string;
  withdrawnDate: string;
  paymentDueDate: string;
  depositDate: string;
  depositBilled: number;
  collection: number;
  depositOutstanding: number;
  offsetToOutstanding: number;
  refund: number;
  totalFeesOutstanding: number;
  totalWithheld: number;
};

const DEPOSITS: DepositSeed[] = [
  {
    studentId: 's1',
    withdrawnDate: '',
    paymentDueDate: '2026-07-15',
    depositDate: '2026-07-03',
    depositBilled: 10000,
    collection: 10000,
    depositOutstanding: 0,
    offsetToOutstanding: 0,
    refund: 0,
    totalFeesOutstanding: 2500,
    totalWithheld: 0,
  },
  {
    studentId: 's2',
    withdrawnDate: '',
    paymentDueDate: '2026-07-20',
    depositDate: '2026-07-08',
    depositBilled: 8000,
    collection: 5000,
    depositOutstanding: 3000,
    offsetToOutstanding: 1000,
    refund: 0,
    totalFeesOutstanding: 0,
    totalWithheld: 500,
  },
  {
    studentId: 's3',
    withdrawnDate: '2026-07-28',
    paymentDueDate: '2026-07-10',
    depositDate: '2026-07-05',
    depositBilled: 12000,
    collection: 12000,
    depositOutstanding: 0,
    offsetToOutstanding: 2000,
    refund: 4000,
    totalFeesOutstanding: 0,
    totalWithheld: 1500,
  },
  {
    studentId: 's4',
    withdrawnDate: '',
    paymentDueDate: '2026-07-25',
    depositDate: '2026-07-12',
    depositBilled: 10000,
    collection: 0,
    depositOutstanding: 10000,
    offsetToOutstanding: 0,
    refund: 0,
    totalFeesOutstanding: 8500,
    totalWithheld: 0,
  },
  {
    studentId: 's5',
    withdrawnDate: '',
    paymentDueDate: '2026-07-18',
    depositDate: '2026-07-15',
    depositBilled: 15000,
    collection: 15000,
    depositOutstanding: 0,
    offsetToOutstanding: 3500,
    refund: 0,
    totalFeesOutstanding: 1200,
    totalWithheld: 0,
  },
  {
    studentId: 's7',
    withdrawnDate: '2026-07-22',
    paymentDueDate: '2026-07-08',
    depositDate: '2026-07-02',
    depositBilled: 9000,
    collection: 9000,
    depositOutstanding: 0,
    offsetToOutstanding: 500,
    refund: 2500,
    totalFeesOutstanding: 0,
    totalWithheld: 800,
  },
  {
    studentId: 's8',
    withdrawnDate: '',
    paymentDueDate: '2026-07-30',
    depositDate: '2026-07-25',
    depositBilled: 10000,
    collection: 7000,
    depositOutstanding: 3000,
    offsetToOutstanding: 0,
    refund: 0,
    totalFeesOutstanding: 4500,
    totalWithheld: 0,
  },
];

export function defaultDepositReportForm(): DepositReportFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    columnMode: 'custom',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: DepositReportFormValues) {
  if (values.columnMode === 'all') return DEPOSIT_REPORT_COLUMNS;
  const set = new Set(values.selectedColumns);
  return DEPOSIT_REPORT_COLUMNS.filter((c) => set.has(c.id));
}

export function buildDepositReportRows(
  values: DepositReportFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const cols = activeColumns(values);

  return DEPOSITS.filter(
    (d) => d.depositDate >= values.startDate && d.depositDate <= values.endDate,
  ).map((d) => {
    const student = byId.get(d.studentId);
    const full: Record<DepositReportColumnId, string> = {
      center: 'Hams Kids Home | Daycare',
      admissionNumber: student?.admissionNo ?? '—',
      studentName: student?.name ?? '—',
      studentStatus: student?.status ?? '—',
      withdrawnDate: d.withdrawnDate ? toDisplayDate(d.withdrawnDate) : '—',
      paymentDueDate: toDisplayDate(d.paymentDueDate),
      depositBilled: money(d.depositBilled),
      collection: money(d.collection),
      depositOutstanding: money(d.depositOutstanding),
      offsetToOutstanding: money(d.offsetToOutstanding),
      refund: money(d.refund),
      totalFeesOutstanding: money(d.totalFeesOutstanding),
      totalWithheld: money(d.totalWithheld),
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createDepositReport(
  values: DepositReportFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildDepositReportRows(values);
  const now = new Date();

  return {
    id: `dep-rpt-${now.getTime()}`,
    kind: 'deposit',
    name: `Deposit_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${toDisplayDate(values.startDate)} → ${toDisplayDate(values.endDate)}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
