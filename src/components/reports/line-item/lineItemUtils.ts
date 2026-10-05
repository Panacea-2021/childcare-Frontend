import {
  CURRENT_USER,
  MOCK_STUDENTS,
  STUDENT_STATUSES,
  type StudentStatus,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type LineItemReportType = 'invoice-date' | 'billing-period';

export type LineItemColumnMode = 'all' | 'custom';

export type LineItemColumnId =
  | 'invoiceId'
  | 'invoiceRaiseDate'
  | 'invoiceRaisedBy'
  | 'feePlanUsed'
  | 'studentName'
  | 'preferredName'
  | 'lineItemName'
  | 'lineItemDescription'
  | 'unitPrice'
  | 'billingPeriodStart'
  | 'admissionNumber'
  | 'invoiceNumber'
  | 'quantity'
  | 'discountType'
  | 'discountAmount'
  | 'discountPercent'
  | 'classroom'
  | 'billingPeriodEnd'
  | 'dueDate'
  | 'parentName'
  | 'taxes'
  | 'taxAmount'
  | 'invoiceTotal'
  | 'refundMode'
  | 'refundAmount'
  | 'lineItemTotal'
  | 'paymentMode'
  | 'paymentStatus'
  | 'studentId'
  | 'centerName'
  | 'invoiceStatus'
  | 'paymentDate'
  | 'branchPath'
  | 'parentEmail'
  | 'parentPhone'
  | 'amountPaid'
  | 'enrolledProgram'
  | 'programLabels'
  | 'studentStatus'
  | 'notes'
  | 'creditApplied'
  | 'outstandingAmount';

export const LINE_ITEM_COLUMNS: { id: LineItemColumnId; label: string }[] = [
  // Page 1
  { id: 'invoiceId', label: 'Invoice ID' },
  { id: 'invoiceRaiseDate', label: 'Invoice Raise Date' },
  { id: 'invoiceRaisedBy', label: 'Invoice Raised By' },
  { id: 'feePlanUsed', label: 'Fee Plan Used' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'lineItemName', label: 'Line Item Name' },
  { id: 'lineItemDescription', label: 'Line Item Description' },
  { id: 'unitPrice', label: 'Unit Price' },
  { id: 'billingPeriodStart', label: 'Billing Period Start' },
  // Page 2
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'invoiceNumber', label: 'Invoice Number' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'discountType', label: 'Discount Type' },
  { id: 'discountAmount', label: 'Discount Amount' },
  { id: 'discountPercent', label: 'Discount Percent' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'billingPeriodEnd', label: 'Billing Period End' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'parentName', label: 'Parent Name' },
  // Page 3
  { id: 'taxes', label: 'Taxes' },
  { id: 'taxAmount', label: 'Tax Amount' },
  { id: 'invoiceTotal', label: 'Invoice Total' },
  { id: 'refundMode', label: 'Refund Mode' },
  { id: 'refundAmount', label: 'Refund Amount' },
  { id: 'lineItemTotal', label: 'Line Item Total' },
  { id: 'paymentMode', label: 'Payment Mode' },
  { id: 'paymentStatus', label: 'Payment Status' },
  // Page 4
  { id: 'studentId', label: 'Student ID' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'invoiceStatus', label: 'Invoice Status' },
  { id: 'paymentDate', label: 'Payment Date' },
  { id: 'branchPath', label: 'Branch Path' },
  { id: 'parentEmail', label: 'Parent Email' },
  { id: 'parentPhone', label: 'Parent Phone' },
  { id: 'amountPaid', label: 'Amount Paid' },
  // Page 5
  { id: 'enrolledProgram', label: 'Enrolled Program' },
  { id: 'programLabels', label: 'Program Labels' },
  { id: 'studentStatus', label: 'Student Status' },
  { id: 'notes', label: 'Notes' },
  { id: 'creditApplied', label: 'Credit Applied' },
  { id: 'outstandingAmount', label: 'Outstanding Amount' },
];

/** Illumine-style pages: 10 + 10 + 8 + 8 + 6 = 42 */
export const LINE_ITEM_PAGE_CHUNKS = [10, 10, 8, 8, 6] as const;

export const LINE_ITEM_LAST_GENERATED = {
  dateLabel: '30/07/2026',
  timeLabel: '03:05:12 PM',
  by: 'Malika Thimisetty',
};

export type LineItemFormValues = {
  reportType: LineItemReportType;
  startDate: string;
  endDate: string;
  rooms: string[];
  statuses: StudentStatus[];
  columnMode: LineItemColumnMode;
  selectedColumns: LineItemColumnId[];
};

export function defaultLineItemForm(): LineItemFormValues {
  return {
    reportType: 'invoice-date',
    startDate: '2026-07-24',
    endDate: '2026-07-30',
    rooms: [],
    statuses: ['Active'],
    columnMode: 'all',
    selectedColumns: LINE_ITEM_COLUMNS.map((c) => c.id),
  };
}

type LineSeed = {
  invoiceId: string;
  invoiceNumber: string;
  invoiceRaiseDate: string;
  invoiceRaisedBy: string;
  feePlanUsed: string;
  preferredName: string;
  lineItemName: string;
  lineItemDescription: string;
  unitPrice: number;
  quantity: number;
  discountType: string;
  discountAmount: number;
  discountPercent: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  taxes: string;
  taxAmount: number;
  invoiceTotal: number;
  refundMode: string;
  refundAmount: number;
  paymentMode: string;
  paymentStatus: string;
  invoiceStatus: string;
  paymentDate: string;
  enrolledProgram: string;
  programLabels: string;
  notes: string;
  creditApplied: number;
  amountPaid: number;
};

const LINE_SEEDS: { studentId: string; line: LineSeed }[] = [
  {
    studentId: 's1',
    line: {
      invoiceId: 'INV-UID-0142',
      invoiceNumber: 'INV-2026-0142',
      invoiceRaiseDate: '2026-07-24',
      invoiceRaisedBy: 'Malika Thimisetty',
      feePlanUsed: 'Full Day Premium',
      preferredName: 'Emma',
      lineItemName: 'Tuition Fee',
      lineItemDescription: 'July full-day tuition',
      unitPrice: 18500,
      quantity: 1,
      discountType: 'Percentage',
      discountAmount: 925,
      discountPercent: 5,
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      dueDate: '2026-08-05',
      parentName: 'Sarah Chen',
      parentEmail: 'sarah.chen@email.com',
      parentPhone: '+1 555-0101',
      taxes: 'GST 5%',
      taxAmount: 878.75,
      invoiceTotal: 18453.75,
      refundMode: '—',
      refundAmount: 0,
      paymentMode: 'Card',
      paymentStatus: 'Partial',
      invoiceStatus: 'Due',
      paymentDate: '2026-07-20',
      enrolledProgram: 'Toddlers',
      programLabels: 'Full Day, Meals',
      notes: 'Early bird discount applied',
      creditApplied: 0,
      amountPaid: 5000,
    },
  },
  {
    studentId: 's2',
    line: {
      invoiceId: 'INV-UID-0143',
      invoiceNumber: 'INV-2026-0143',
      invoiceRaiseDate: '2026-07-25',
      invoiceRaisedBy: 'Front Desk',
      feePlanUsed: 'Half Day Standard',
      preferredName: 'Aarav',
      lineItemName: 'Tuition Fee',
      lineItemDescription: 'July half-day tuition',
      unitPrice: 9800,
      quantity: 1,
      discountType: 'None',
      discountAmount: 0,
      discountPercent: 0,
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      dueDate: '2026-08-05',
      parentName: 'Priya Sharma',
      parentEmail: 'priya.sharma@email.com',
      parentPhone: '+1 555-0102',
      taxes: 'GST 5%',
      taxAmount: 490,
      invoiceTotal: 10290,
      refundMode: '—',
      refundAmount: 0,
      paymentMode: 'UPI',
      paymentStatus: 'Paid',
      invoiceStatus: 'Paid',
      paymentDate: '2026-07-28',
      enrolledProgram: 'Nursery',
      programLabels: 'Half Day',
      notes: '',
      creditApplied: 0,
      amountPaid: 10290,
    },
  },
  {
    studentId: 's3',
    line: {
      invoiceId: 'INV-UID-0144',
      invoiceNumber: 'INV-2026-0144',
      invoiceRaiseDate: '2026-07-26',
      invoiceRaisedBy: 'Malika Thimisetty',
      feePlanUsed: 'Full Day Standard',
      preferredName: 'Mia',
      lineItemName: 'Extended Care',
      lineItemDescription: 'After-hours care add-on',
      unitPrice: 4500,
      quantity: 1,
      discountType: 'Flat',
      discountAmount: 200,
      discountPercent: 0,
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      dueDate: '2026-08-05',
      parentName: 'James Wilson',
      parentEmail: 'james.wilson@email.com',
      parentPhone: '+1 555-0103',
      taxes: 'GST 5%',
      taxAmount: 215,
      invoiceTotal: 4515,
      refundMode: '—',
      refundAmount: 0,
      paymentMode: '—',
      paymentStatus: 'Unpaid',
      invoiceStatus: 'Overdue',
      paymentDate: '',
      enrolledProgram: 'Toddlers',
      programLabels: 'Full Day, Extended',
      notes: 'Pending reminder',
      creditApplied: 0,
      amountPaid: 0,
    },
  },
  {
    studentId: 's5',
    line: {
      invoiceId: 'INV-UID-0145',
      invoiceNumber: 'INV-2026-0145',
      invoiceRaiseDate: '2026-07-28',
      invoiceRaisedBy: 'Billing Bot',
      feePlanUsed: 'Extended Care',
      preferredName: 'Sofia',
      lineItemName: 'Meals Plan',
      lineItemDescription: 'July meal package',
      unitPrice: 2200,
      quantity: 1,
      discountType: 'None',
      discountAmount: 0,
      discountPercent: 0,
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      dueDate: '2026-08-08',
      parentName: 'Elena Rossi',
      parentEmail: 'elena.rossi@email.com',
      parentPhone: '+1 555-0105',
      taxes: 'GST 5%',
      taxAmount: 110,
      invoiceTotal: 2310,
      refundMode: 'Original payment',
      refundAmount: 0,
      paymentMode: 'Cash',
      paymentStatus: 'Paid',
      invoiceStatus: 'Paid',
      paymentDate: '2026-07-29',
      enrolledProgram: 'Senior KG',
      programLabels: 'Meals',
      notes: '',
      creditApplied: 100,
      amountPaid: 2210,
    },
  },
];

function money(n: number) {
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function inRange(iso: string, start: string, end: string) {
  return iso >= start && iso <= end;
}

function activeColumns(values: LineItemFormValues) {
  if (values.columnMode === 'all') return LINE_ITEM_COLUMNS;
  const set = new Set(values.selectedColumns);
  return LINE_ITEM_COLUMNS.filter((c) => set.has(c.id));
}

export function buildLineItemRows(values: LineItemFormValues): Record<string, string>[] {
  const cols = activeColumns(values);
  const roomSet = new Set(values.rooms);
  const statusSet = new Set(values.statuses.length ? values.statuses : STUDENT_STATUSES);

  return LINE_SEEDS.map((entry) => {
    const student = MOCK_STUDENTS.find((s) => s.id === entry.studentId);
    if (!student) return null;
    if (roomSet.size && !roomSet.has(student.room)) return null;
    if (!statusSet.has(student.status)) return null;

    const line = entry.line;
    const compareDate =
      values.reportType === 'invoice-date' ? line.invoiceRaiseDate : line.billingPeriodStart;
    if (!inRange(compareDate, values.startDate, values.endDate)) return null;

    const lineItemTotal = Math.max(
      0,
      line.unitPrice * line.quantity - line.discountAmount + line.taxAmount,
    );
    const outstanding = Math.max(0, line.invoiceTotal - line.amountPaid - line.creditApplied);

    const full: Record<LineItemColumnId, string> = {
      invoiceId: line.invoiceId,
      invoiceRaiseDate: toDisplayDate(line.invoiceRaiseDate),
      invoiceRaisedBy: line.invoiceRaisedBy,
      feePlanUsed: line.feePlanUsed,
      studentName: student.name,
      preferredName: line.preferredName,
      lineItemName: line.lineItemName,
      lineItemDescription: line.lineItemDescription,
      unitPrice: money(line.unitPrice),
      billingPeriodStart: toDisplayDate(line.billingPeriodStart),
      admissionNumber: student.admissionNo,
      invoiceNumber: line.invoiceNumber,
      quantity: String(line.quantity),
      discountType: line.discountType,
      discountAmount: money(line.discountAmount),
      discountPercent: `${line.discountPercent}%`,
      classroom: student.room,
      billingPeriodEnd: toDisplayDate(line.billingPeriodEnd),
      dueDate: toDisplayDate(line.dueDate),
      parentName: line.parentName,
      taxes: line.taxes,
      taxAmount: money(line.taxAmount),
      invoiceTotal: money(line.invoiceTotal),
      refundMode: line.refundMode,
      refundAmount: money(line.refundAmount),
      lineItemTotal: money(lineItemTotal),
      paymentMode: line.paymentMode,
      paymentStatus: line.paymentStatus,
      studentId: student.id.toUpperCase(),
      centerName: 'Hams Kids Home',
      invoiceStatus: line.invoiceStatus,
      paymentDate: line.paymentDate ? toDisplayDate(line.paymentDate) : '—',
      branchPath: 'Main Campus / Daycare',
      parentEmail: line.parentEmail,
      parentPhone: line.parentPhone,
      amountPaid: money(line.amountPaid),
      enrolledProgram: line.enrolledProgram,
      programLabels: line.programLabels,
      studentStatus: student.status,
      notes: line.notes || '—',
      creditApplied: money(line.creditApplied),
      outstandingAmount: money(outstanding),
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  }).filter((row): row is Record<string, string> => row !== null);
}

export function createLineItemReport(
  values: LineItemFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildLineItemRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';
  const typeLabel = values.reportType === 'invoice-date' ? 'InvoiceDate' : 'BillingPeriod';

  return {
    id: `li-${now.getTime()}`,
    kind: 'line-item',
    name: `Line_Item_${typeLabel}_${toFileDate(values.startDate)}_${toFileDate(values.endDate)}.xlsx`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${roomsLabel} · ${values.statuses.join(', ') || 'All statuses'}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
    format: 'excel',
  };
}
