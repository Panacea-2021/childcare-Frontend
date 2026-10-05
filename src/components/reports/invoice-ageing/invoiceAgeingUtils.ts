import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type InvoiceAgeingColumnMode = 'all' | 'custom';

export type InvoiceAgeingStatusOption = 'overdue-only' | 'all-invoices';

export type InvoiceAgeingColumnId =
  | 'studentName'
  | 'invoiceNumber'
  | 'pendingAmount'
  | 'total'
  | 'dueSinceDays'
  | 'raisedOn'
  | 'classrooms'
  | 'fatherEmail'
  | 'fatherNumber'
  | 'motherEmail'
  | 'motherNumber'
  | 'status'
  | 'dueOn'
  | 'admissionNumber'
  | 'centerName'
  | 'centerCode'
  | 'centerGroup'
  | 'studentCode';

export const INVOICE_AGEING_COLUMNS: { id: InvoiceAgeingColumnId; label: string }[] = [
  // Page 1
  { id: 'studentName', label: 'Student Name' },
  { id: 'invoiceNumber', label: 'Invoice Number' },
  { id: 'pendingAmount', label: 'Pending Amount' },
  { id: 'total', label: 'Total' },
  { id: 'dueSinceDays', label: 'Due Since(days)' },
  { id: 'raisedOn', label: 'Raised On' },
  { id: 'classrooms', label: 'Classrooms' },
  { id: 'fatherEmail', label: 'Father Email' },
  { id: 'fatherNumber', label: 'Father Number' },
  { id: 'motherEmail', label: 'Mother Email' },
  // Page 2
  { id: 'motherNumber', label: 'Mother Number' },
  { id: 'status', label: 'Status' },
  { id: 'dueOn', label: 'Due On' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'centerCode', label: 'Center Code' },
  { id: 'centerGroup', label: 'Center Group' },
  { id: 'studentCode', label: 'Student Code' },
];

/** Page sizes matching Illumine: 10 + 8 = 18 */
export const INVOICE_AGEING_PAGE_CHUNKS = [10, 8] as const;

export const INVOICE_AGEING_STATUS_OPTIONS: {
  value: InvoiceAgeingStatusOption;
  label: string;
}[] = [
  { value: 'overdue-only', label: 'Show only overdue invoices' },
  { value: 'all-invoices', label: 'Show all invoices' },
];

export const INVOICE_AGEING_LAST_GENERATED = {
  dateLabel: '30/07/2026',
  timeLabel: '04:22:09 PM',
  by: 'Malika Thimisetty',
};

export type InvoiceAgeingFormValues = {
  startDate: string;
  endDate: string;
  asOfDate: string;
  rooms: string[];
  invoiceStatus: InvoiceAgeingStatusOption;
  columnMode: InvoiceAgeingColumnMode;
  selectedColumns: InvoiceAgeingColumnId[];
};

export function defaultInvoiceAgeingForm(): InvoiceAgeingFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    asOfDate: '2026-07-30',
    rooms: [],
    invoiceStatus: 'overdue-only',
    columnMode: 'all',
    selectedColumns: INVOICE_AGEING_COLUMNS.map((c) => c.id),
  };
}

type AgeingSeed = {
  invoiceNumber: string;
  raisedOn: string;
  dueOn: string;
  total: number;
  pendingAmount: number;
  status: 'Overdue' | 'Due' | 'Paid';
  fatherEmail: string;
  fatherNumber: string;
  motherEmail: string;
  motherNumber: string;
  studentCode: string;
};

const AGEING_SEEDS: { studentId: string; invoice: AgeingSeed }[] = [
  {
    studentId: 's1',
    invoice: {
      invoiceNumber: 'INV-2026-0142',
      raisedOn: '2026-07-05',
      dueOn: '2026-07-15',
      total: 18500,
      pendingAmount: 13500,
      status: 'Overdue',
      fatherEmail: 'david.chen@email.com',
      fatherNumber: '+1 555-0201',
      motherEmail: 'sarah.chen@email.com',
      motherNumber: '+1 555-0101',
      studentCode: 'STU-1025',
    },
  },
  {
    studentId: 's2',
    invoice: {
      invoiceNumber: 'INV-2026-0143',
      raisedOn: '2026-07-10',
      dueOn: '2026-08-05',
      total: 9800,
      pendingAmount: 0,
      status: 'Paid',
      fatherEmail: 'raj.sharma@email.com',
      fatherNumber: '+1 555-0202',
      motherEmail: 'priya.sharma@email.com',
      motherNumber: '+1 555-0102',
      studentCode: 'STU-1042',
    },
  },
  {
    studentId: 's3',
    invoice: {
      invoiceNumber: 'INV-2026-0144',
      raisedOn: '2026-07-12',
      dueOn: '2026-07-20',
      total: 14200,
      pendingAmount: 14200,
      status: 'Overdue',
      fatherEmail: 'james.wilson@email.com',
      fatherNumber: '+1 555-0203',
      motherEmail: 'amy.wilson@email.com',
      motherNumber: '+1 555-0103',
      studentCode: 'STU-1088',
    },
  },
  {
    studentId: 's5',
    invoice: {
      invoiceNumber: 'INV-2026-0145',
      raisedOn: '2026-07-22',
      dueOn: '2026-08-08',
      total: 4500,
      pendingAmount: 4500,
      status: 'Due',
      fatherEmail: 'marco.rossi@email.com',
      fatherNumber: '+1 555-0205',
      motherEmail: 'elena.rossi@email.com',
      motherNumber: '+1 555-0105',
      studentCode: 'STU-1115',
    },
  },
  {
    studentId: 's7',
    invoice: {
      invoiceNumber: 'INV-2026-0139',
      raisedOn: '2026-07-02',
      dueOn: '2026-07-12',
      total: 8200,
      pendingAmount: 3200,
      status: 'Overdue',
      fatherEmail: 'vikram.joshi@email.com',
      fatherNumber: '+1 555-0207',
      motherEmail: 'anaya.joshi@email.com',
      motherNumber: '+1 555-0107',
      studentCode: 'STU-1133',
    },
  },
];

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function daysBetween(fromIso: string, toIso: string) {
  const from = new Date(`${fromIso}T00:00:00`);
  const to = new Date(`${toIso}T00:00:00`);
  const diff = Math.floor((to.getTime() - from.getTime()) / 86400000);
  return Math.max(0, diff);
}

function inRange(iso: string, start: string, end: string) {
  return iso >= start && iso <= end;
}

function activeColumns(values: InvoiceAgeingFormValues) {
  if (values.columnMode === 'all') return INVOICE_AGEING_COLUMNS;
  const set = new Set(values.selectedColumns);
  return INVOICE_AGEING_COLUMNS.filter((c) => set.has(c.id));
}

export function buildInvoiceAgeingRows(
  values: InvoiceAgeingFormValues,
): Record<string, string>[] {
  const cols = activeColumns(values);
  const roomSet = new Set(values.rooms);

  return AGEING_SEEDS.map((entry) => {
    const student = MOCK_STUDENTS.find((s) => s.id === entry.studentId);
    if (!student) return null;
    if (roomSet.size && !roomSet.has(student.room)) return null;

    const inv = entry.invoice;
    if (!inRange(inv.raisedOn, values.startDate, values.endDate)) return null;
    if (values.invoiceStatus === 'overdue-only' && inv.status !== 'Overdue') return null;

    const dueSince =
      inv.pendingAmount > 0 ? String(daysBetween(inv.dueOn, values.asOfDate)) : '0';

    const full: Record<InvoiceAgeingColumnId, string> = {
      studentName: student.name,
      invoiceNumber: inv.invoiceNumber,
      pendingAmount: money(inv.pendingAmount),
      total: money(inv.total),
      dueSinceDays: dueSince,
      raisedOn: toDisplayDate(inv.raisedOn),
      classrooms: student.room,
      fatherEmail: inv.fatherEmail,
      fatherNumber: inv.fatherNumber,
      motherEmail: inv.motherEmail,
      motherNumber: inv.motherNumber,
      status: inv.status,
      dueOn: toDisplayDate(inv.dueOn),
      admissionNumber: student.admissionNo,
      centerName: 'Hams Kids Home',
      centerCode: 'HKH-01',
      centerGroup: 'Daycare Group',
      studentCode: inv.studentCode,
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  }).filter((row): row is Record<string, string> => row !== null);
}

export function createInvoiceAgeingReport(
  values: InvoiceAgeingFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildInvoiceAgeingRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';
  const statusLabel =
    INVOICE_AGEING_STATUS_OPTIONS.find((o) => o.value === values.invoiceStatus)?.label ??
    values.invoiceStatus;

  return {
    id: `age-${now.getTime()}`,
    kind: 'invoice-ageing',
    name: `Invoice_Ageing_${toFileDate(values.startDate)}_${toFileDate(values.endDate)}_AsOf_${toFileDate(values.asOfDate)}.xlsx`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${roomsLabel} · As of ${toDisplayDate(values.asOfDate)} · ${statusLabel}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
    format: 'excel',
  };
}
