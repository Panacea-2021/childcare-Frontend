import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type {
  GeneratedExcelReport,
  ReportExportFormat,
} from '@/components/reports/shared/generatedReport';

export type PaymentColumnMode = 'all' | 'custom';

export type PaymentColumnId =
  | 'invoiceNumber'
  | 'receiptNumber'
  | 'studentName'
  | 'preferredName'
  | 'admissionNumber'
  | 'classList'
  | 'groups'
  | 'paymentDate'
  | 'transactionDate'
  | 'recordedOn'
  | 'branch'
  | 'amount'
  | 'mode'
  | 'updatedBy'
  | 'billingPeriod'
  | 'referenceNumber'
  | 'studentId';

export const PAYMENT_COLUMNS: { id: PaymentColumnId; label: string }[] = [
  { id: 'invoiceNumber', label: 'Invoice Number' },
  { id: 'receiptNumber', label: 'Receipt Number' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classList', label: 'Class List' },
  { id: 'groups', label: 'Groups' },
  { id: 'paymentDate', label: 'Payment Date' },
  { id: 'transactionDate', label: 'Transaction Date' },
  { id: 'recordedOn', label: 'Recorded On' },
  { id: 'branch', label: 'Branch' },
  { id: 'amount', label: 'Amount' },
  { id: 'mode', label: 'Mode' },
  { id: 'updatedBy', label: 'Updated By' },
  { id: 'billingPeriod', label: 'Billing Period' },
  { id: 'referenceNumber', label: 'Reference Number' },
  { id: 'studentId', label: 'Student ID' },
];

export type PaymentFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  format: ReportExportFormat;
  columnMode: PaymentColumnMode;
  selectedColumns: PaymentColumnId[];
};

type PaymentSeed = {
  studentId: string;
  invoiceNumber: string;
  receiptNumber: string;
  preferredName: string;
  groups: string;
  paymentDate: string;
  transactionDate: string;
  recordedOn: string;
  amount: number;
  mode: string;
  updatedBy: string;
  billingPeriod: string;
  referenceNumber: string;
};

const PAYMENTS: PaymentSeed[] = [
  {
    studentId: 's1',
    invoiceNumber: 'INV-2026-0142',
    receiptNumber: 'RCP-2026-0891',
    preferredName: 'Em',
    groups: 'Full Day',
    paymentDate: '2026-07-03',
    transactionDate: '2026-07-03',
    recordedOn: '2026-07-03',
    amount: 17575,
    mode: 'UPI',
    updatedBy: 'Malika Thimisetty',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'UPI260703891',
  },
  {
    studentId: 's2',
    invoiceNumber: 'INV-2026-0151',
    receiptNumber: 'RCP-2026-0904',
    preferredName: 'Aaru',
    groups: 'Half Day',
    paymentDate: '2026-07-08',
    transactionDate: '2026-07-08',
    recordedOn: '2026-07-09',
    amount: 9800,
    mode: 'Card',
    updatedBy: 'Priya Nair',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'CARD260708904',
  },
  {
    studentId: 's3',
    invoiceNumber: 'INV-2026-0158',
    receiptNumber: 'RCP-2026-0912',
    preferredName: 'Mia',
    groups: 'Toddlers',
    paymentDate: '2026-07-12',
    transactionDate: '2026-07-12',
    recordedOn: '2026-07-12',
    amount: 13490,
    mode: 'Net Banking',
    updatedBy: 'Front Desk',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'NB260712912',
  },
  {
    studentId: 's5',
    invoiceNumber: 'INV-2026-0170',
    receiptNumber: 'RCP-2026-0933',
    preferredName: 'Sofi',
    groups: 'Full Day',
    paymentDate: '2026-07-18',
    transactionDate: '2026-07-18',
    recordedOn: '2026-07-18',
    amount: 16650,
    mode: 'Cash',
    updatedBy: 'Rahul Mehta',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'CASH260718933',
  },
  {
    studentId: 's7',
    invoiceNumber: 'INV-2026-0180',
    receiptNumber: 'RCP-2026-0948',
    preferredName: 'Avi',
    groups: 'Pre Nursery',
    paymentDate: '2026-07-25',
    transactionDate: '2026-07-25',
    recordedOn: '2026-07-26',
    amount: 11200,
    mode: 'UPI',
    updatedBy: 'Priya Nair',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'UPI260725948',
  },
  {
    studentId: 's9',
    invoiceNumber: 'INV-2026-0192',
    receiptNumber: 'RCP-2026-0961',
    preferredName: 'Liv',
    groups: 'Infants',
    paymentDate: '2026-07-30',
    transactionDate: '2026-07-30',
    recordedOn: '2026-07-30',
    amount: 15400,
    mode: 'Card',
    updatedBy: 'Malika Thimisetty',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'CARD260730961',
  },
  {
    studentId: 's12',
    invoiceNumber: 'INV-2026-0198',
    receiptNumber: 'RCP-2026-0975',
    preferredName: 'Mace',
    groups: 'Full Day',
    paymentDate: '2026-08-02',
    transactionDate: '2026-08-02',
    recordedOn: '2026-08-02',
    amount: 18500,
    mode: 'Cheque',
    updatedBy: 'Front Desk',
    billingPeriod: 'Aug 2026',
    referenceNumber: 'CHQ260802975',
  },
  {
    studentId: 's4',
    invoiceNumber: 'INV-2026-0164',
    receiptNumber: 'RCP-2026-0920',
    preferredName: 'Li',
    groups: 'Junior KG',
    paymentDate: '2026-07-15',
    transactionDate: '2026-07-15',
    recordedOn: '2026-07-15',
    amount: 12800,
    mode: 'UPI',
    updatedBy: 'Rahul Mehta',
    billingPeriod: 'Jul 2026',
    referenceNumber: 'UPI260715920',
  },
];

export function defaultPaymentForm(): PaymentFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    rooms: [],
    format: 'excel',
    columnMode: 'all',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: PaymentFormValues) {
  if (values.columnMode === 'all') return PAYMENT_COLUMNS;
  const set = new Set(values.selectedColumns);
  return PAYMENT_COLUMNS.filter((c) => set.has(c.id));
}

export function buildPaymentRows(values: PaymentFormValues): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const roomSet = new Set(values.rooms);
  const cols = activeColumns(values);

  return PAYMENTS.filter((p) => {
    if (p.paymentDate < values.startDate || p.paymentDate > values.endDate) return false;
    if (!roomSet.size) return true;
    const student = byId.get(p.studentId);
    return student ? roomSet.has(student.room) : false;
  }).map((p) => {
    const student = byId.get(p.studentId);
    const full: Record<PaymentColumnId, string> = {
      invoiceNumber: p.invoiceNumber,
      receiptNumber: p.receiptNumber,
      studentName: student?.name ?? '—',
      preferredName: p.preferredName,
      admissionNumber: student?.admissionNo ?? '—',
      classList: student?.room ?? '—',
      groups: p.groups,
      paymentDate: toDisplayDate(p.paymentDate),
      transactionDate: toDisplayDate(p.transactionDate),
      recordedOn: toDisplayDate(p.recordedOn),
      branch: 'Main Campus',
      amount: money(p.amount),
      mode: p.mode,
      updatedBy: p.updatedBy,
      billingPeriod: p.billingPeriod,
      referenceNumber: p.referenceNumber,
      studentId: p.studentId.toUpperCase(),
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createPaymentReport(
  values: PaymentFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildPaymentRows(values);
  const now = new Date();
  const ext = values.format === 'pdf' ? 'pdf' : 'xlsx';
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';

  return {
    id: `pay-${now.getTime()}`,
    kind: 'payment',
    name: `Payment_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.${ext}`,
    format: values.format,
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
