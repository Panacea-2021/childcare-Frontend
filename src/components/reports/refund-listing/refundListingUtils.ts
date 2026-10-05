import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type RefundColumnMode = 'all' | 'custom';

export type RefundColumnId =
  | 'admissionNumber'
  | 'studentName'
  | 'centerName'
  | 'interface'
  | 'amount'
  | 'processedBy'
  | 'refundDate';

export const REFUND_COLUMNS: { id: RefundColumnId; label: string }[] = [
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'interface', label: 'Interface' },
  { id: 'amount', label: 'Amount' },
  { id: 'processedBy', label: 'Processed By' },
  { id: 'refundDate', label: 'Refund Date' },
];

export type RefundListingFormValues = {
  startDate: string;
  endDate: string;
  columnMode: RefundColumnMode;
  selectedColumns: RefundColumnId[];
};

type RefundSeed = {
  studentId: string;
  interface: string;
  amount: number;
  processedBy: string;
  refundDate: string;
};

const REFUNDS: RefundSeed[] = [
  {
    studentId: 's1',
    interface: 'Parent Portal',
    amount: 2500,
    processedBy: 'Malika Thimisetty',
    refundDate: '2026-07-04',
  },
  {
    studentId: 's2',
    interface: 'Admin Desk',
    amount: 1200,
    processedBy: 'Priya Nair',
    refundDate: '2026-07-09',
  },
  {
    studentId: 's3',
    interface: 'UPI Settlement',
    amount: 800,
    processedBy: 'Front Desk',
    refundDate: '2026-07-14',
  },
  {
    studentId: 's5',
    interface: 'Parent Portal',
    amount: 3500,
    processedBy: 'Rahul Mehta',
    refundDate: '2026-07-19',
  },
  {
    studentId: 's7',
    interface: 'Admin Desk',
    amount: 1500,
    processedBy: 'Priya Nair',
    refundDate: '2026-07-24',
  },
  {
    studentId: 's4',
    interface: 'Bank Transfer',
    amount: 2000,
    processedBy: 'Malika Thimisetty',
    refundDate: '2026-07-16',
  },
  {
    studentId: 's9',
    interface: 'Parent Portal',
    amount: 950,
    processedBy: 'Front Desk',
    refundDate: '2026-07-28',
  },
  {
    studentId: 's12',
    interface: 'Admin Desk',
    amount: 1800,
    processedBy: 'Rahul Mehta',
    refundDate: '2026-08-01',
  },
];

export function defaultRefundListingForm(): RefundListingFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    columnMode: 'all',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: RefundListingFormValues) {
  if (values.columnMode === 'all') return REFUND_COLUMNS;
  const set = new Set(values.selectedColumns);
  return REFUND_COLUMNS.filter((c) => set.has(c.id));
}

export function buildRefundListingRows(
  values: RefundListingFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const cols = activeColumns(values);

  return REFUNDS.filter(
    (r) => r.refundDate >= values.startDate && r.refundDate <= values.endDate,
  ).map((r) => {
    const student = byId.get(r.studentId);
    const full: Record<RefundColumnId, string> = {
      admissionNumber: student?.admissionNo ?? '—',
      studentName: student?.name ?? '—',
      centerName: 'Main Campus',
      interface: r.interface,
      amount: money(r.amount),
      processedBy: r.processedBy,
      refundDate: toDisplayDate(r.refundDate),
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createRefundListingReport(
  values: RefundListingFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildRefundListingRows(values);
  const now = new Date();

  return {
    id: `ref-${now.getTime()}`,
    kind: 'refund-listing',
    name: `Refund_Listing_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: 'All centers',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
