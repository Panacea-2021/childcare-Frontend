import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type CreditHistoryColumnMode = 'all' | 'custom';

export type CreditHistoryColumnId =
  | 'studentId'
  | 'studentName'
  | 'preferredName'
  | 'admissionNumber'
  | 'classList'
  | 'description'
  | 'amountAdded'
  | 'dateAdded'
  | 'amountWithdrawn'
  | 'addedBy'
  | 'approvedBy'
  | 'reason'
  | 'centerName'
  | 'centerCode'
  | 'enrolledProgram'
  | 'programLabels'
  | 'creditNo'
  | 'invoiceId';

/** Page 1 (10) then page 2 (8) — 18 total. */
export const CREDIT_HISTORY_COLUMNS: { id: CreditHistoryColumnId; label: string }[] = [
  { id: 'studentId', label: 'Student ID' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classList', label: 'Class List' },
  { id: 'description', label: 'Description' },
  { id: 'amountAdded', label: 'Amount Added' },
  { id: 'dateAdded', label: 'Date Added' },
  { id: 'amountWithdrawn', label: 'Amount Withdrawn' },
  { id: 'addedBy', label: 'Added By' },
  { id: 'approvedBy', label: 'Approved By' },
  { id: 'reason', label: 'Reason' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'centerCode', label: 'Center Code' },
  { id: 'enrolledProgram', label: 'Enrolled Program' },
  { id: 'programLabels', label: 'Program Labels' },
  { id: 'creditNo', label: 'Credit No' },
  { id: 'invoiceId', label: 'Invoice ID' },
];

export type CreditHistoryFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  columnMode: CreditHistoryColumnMode;
  selectedColumns: CreditHistoryColumnId[];
};

type CreditHistorySeed = {
  studentId: string;
  preferredName: string;
  description: string;
  amountAdded: number;
  dateAdded: string;
  amountWithdrawn: number;
  addedBy: string;
  approvedBy: string;
  reason: string;
  enrolledProgram: string;
  programLabels: string;
  creditNo: string;
  invoiceId: string;
};

const CREDIT_HISTORY: CreditHistorySeed[] = [
  {
    studentId: 's1',
    preferredName: 'Em',
    description: 'Tuition credit applied',
    amountAdded: 2500,
    dateAdded: '2026-07-03',
    amountWithdrawn: 0,
    addedBy: 'Malika Thimisetty',
    approvedBy: 'Priya Nair',
    reason: 'Overpayment adjustment',
    enrolledProgram: 'Full Day',
    programLabels: 'Toddlers',
    creditNo: 'CR-2026-0142',
    invoiceId: 'INV-2026-0140',
  },
  {
    studentId: 's2',
    preferredName: 'Aaru',
    description: 'Fee waiver credit',
    amountAdded: 1200,
    dateAdded: '2026-07-08',
    amountWithdrawn: 0,
    addedBy: 'Priya Nair',
    approvedBy: 'Malika Thimisetty',
    reason: 'Promotional credit',
    enrolledProgram: 'Half Day',
    programLabels: 'Nursery',
    creditNo: 'CR-2026-0151',
    invoiceId: 'INV-2026-0148',
  },
  {
    studentId: 's3',
    preferredName: 'Mia',
    description: 'Credit withdrawn against invoice',
    amountAdded: 0,
    dateAdded: '2026-07-12',
    amountWithdrawn: 800,
    addedBy: 'Front Desk',
    approvedBy: 'Rahul Mehta',
    reason: 'Invoice settlement',
    enrolledProgram: 'Full Day',
    programLabels: 'Pre Nursery',
    creditNo: 'CR-2026-0158',
    invoiceId: 'INV-2026-0155',
  },
  {
    studentId: 's5',
    preferredName: 'Sofi',
    description: 'Sibling discount credit',
    amountAdded: 3000,
    dateAdded: '2026-07-18',
    amountWithdrawn: 500,
    addedBy: 'Rahul Mehta',
    approvedBy: 'Malika Thimisetty',
    reason: 'Sibling scholarship',
    enrolledProgram: 'Extended Care',
    programLabels: 'Junior KG',
    creditNo: 'CR-2026-0170',
    invoiceId: 'INV-2026-0166',
  },
  {
    studentId: 's7',
    preferredName: 'Avi',
    description: 'Goodwill credit',
    amountAdded: 1500,
    dateAdded: '2026-07-22',
    amountWithdrawn: 0,
    addedBy: 'Priya Nair',
    approvedBy: 'Front Desk',
    reason: 'Service recovery',
    enrolledProgram: 'Full Day',
    programLabels: 'Grade 1',
    creditNo: 'CR-2026-0180',
    invoiceId: 'INV-2026-0175',
  },
  {
    studentId: 's4',
    preferredName: 'Li',
    description: 'Plan change credit',
    amountAdded: 2000,
    dateAdded: '2026-07-15',
    amountWithdrawn: 2000,
    addedBy: 'Malika Thimisetty',
    approvedBy: 'Priya Nair',
    reason: 'Prorated plan change',
    enrolledProgram: 'Full Day Premium',
    programLabels: 'Infants',
    creditNo: 'CR-2026-0164',
    invoiceId: 'INV-2026-0160',
  },
  {
    studentId: 's8',
    preferredName: 'Eth',
    description: 'Enrollment credit',
    amountAdded: 4000,
    dateAdded: '2026-07-25',
    amountWithdrawn: 0,
    addedBy: 'Front Desk',
    approvedBy: 'Malika Thimisetty',
    reason: 'New enrollment offer',
    enrolledProgram: 'Full Day',
    programLabels: 'Toddlers',
    creditNo: 'CR-2026-0188',
    invoiceId: 'INV-2026-0182',
  },
  {
    studentId: 's6',
    preferredName: 'Noah',
    description: 'Duplicate charge credit',
    amountAdded: 900,
    dateAdded: '2026-07-28',
    amountWithdrawn: 0,
    addedBy: 'Rahul Mehta',
    approvedBy: 'Priya Nair',
    reason: 'Billing correction',
    enrolledProgram: 'Half Day',
    programLabels: 'Senior KG',
    creditNo: 'CR-2026-0192',
    invoiceId: 'INV-2026-0189',
  },
];

export function defaultCreditHistoryForm(): CreditHistoryFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    rooms: [],
    columnMode: 'custom',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: CreditHistoryFormValues) {
  if (values.columnMode === 'all') return CREDIT_HISTORY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return CREDIT_HISTORY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildCreditHistoryRows(
  values: CreditHistoryFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const roomSet = new Set(values.rooms);
  const cols = activeColumns(values);

  return CREDIT_HISTORY.filter((row) => {
    if (row.dateAdded < values.startDate || row.dateAdded > values.endDate) return false;
    if (!roomSet.size) return true;
    const student = byId.get(row.studentId);
    return student ? roomSet.has(student.room) : false;
  }).map((row) => {
    const student = byId.get(row.studentId);
    const full: Record<CreditHistoryColumnId, string> = {
      studentId: row.studentId.toUpperCase(),
      studentName: student?.name ?? '—',
      preferredName: row.preferredName,
      admissionNumber: student?.admissionNo ?? '—',
      classList: student?.room ?? '—',
      description: row.description,
      amountAdded: money(row.amountAdded),
      dateAdded: toDisplayDate(row.dateAdded),
      amountWithdrawn: money(row.amountWithdrawn),
      addedBy: row.addedBy,
      approvedBy: row.approvedBy,
      reason: row.reason,
      centerName: 'Hams Kids Home | Daycare',
      centerCode: 'HKH-01',
      enrolledProgram: row.enrolledProgram,
      programLabels: row.programLabels,
      creditNo: row.creditNo,
      invoiceId: row.invoiceId,
    };

    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createCreditHistoryReport(
  values: CreditHistoryFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildCreditHistoryRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';

  return {
    id: `ch-${now.getTime()}`,
    kind: 'credit-history',
    name: `Credit_History_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
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
