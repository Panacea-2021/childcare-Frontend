import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type {
  GeneratedExcelReport,
  ReportExportFormat,
} from '@/components/reports/shared/generatedReport';

export type InvoiceReportType = 'invoice-date' | 'billing-period';

export type InvoiceColumnMode = 'all' | 'custom';

export type InvoiceColumnSectionId =
  | 'invoice'
  | 'student'
  | 'payment'
  | 'family';

export type InvoiceColumnId =
  | 'invoiceNumber'
  | 'invoiceDate'
  | 'dueDate'
  | 'billingPeriodStart'
  | 'billingPeriodEnd'
  | 'invoiceStatus'
  | 'invoiceAmount'
  | 'amountPaid'
  | 'amountDue'
  | 'taxAmount'
  | 'discountAmount'
  | 'invoiceNotes'
  | 'studentName'
  | 'preferredName'
  | 'admissionNumber'
  | 'classroom'
  | 'branch'
  | 'studentStatus'
  | 'program'
  | 'paymentDate'
  | 'paymentMethod'
  | 'paymentAmount'
  | 'paymentReference'
  | 'transactionId'
  | 'paidBy'
  | 'parentName'
  | 'parentEmail'
  | 'parentPhone'
  | 'familyAccount';

export type InvoiceColumnDef = {
  id: InvoiceColumnId;
  label: string;
  sectionId: InvoiceColumnSectionId;
};

export const INVOICE_COLUMN_SECTIONS: {
  id: InvoiceColumnSectionId;
  label: string;
}[] = [
  { id: 'invoice', label: 'Invoice Information' },
  { id: 'student', label: 'Student Information' },
  { id: 'payment', label: 'Payment Information' },
  { id: 'family', label: 'Family Information' },
];

export const INVOICE_COLUMNS: InvoiceColumnDef[] = [
  { id: 'invoiceNumber', label: 'Invoice Number', sectionId: 'invoice' },
  { id: 'invoiceDate', label: 'Invoice Date', sectionId: 'invoice' },
  { id: 'dueDate', label: 'Due Date', sectionId: 'invoice' },
  { id: 'billingPeriodStart', label: 'Billing Period Start', sectionId: 'invoice' },
  { id: 'billingPeriodEnd', label: 'Billing Period End', sectionId: 'invoice' },
  { id: 'invoiceStatus', label: 'Invoice Status', sectionId: 'invoice' },
  { id: 'invoiceAmount', label: 'Invoice Amount', sectionId: 'invoice' },
  { id: 'amountPaid', label: 'Amount Paid', sectionId: 'invoice' },
  { id: 'amountDue', label: 'Amount Due', sectionId: 'invoice' },
  { id: 'taxAmount', label: 'Tax Amount', sectionId: 'invoice' },
  { id: 'discountAmount', label: 'Discount Amount', sectionId: 'invoice' },
  { id: 'invoiceNotes', label: 'Invoice Notes', sectionId: 'invoice' },
  { id: 'studentName', label: 'Student Name', sectionId: 'student' },
  { id: 'preferredName', label: 'Preferred Name', sectionId: 'student' },
  { id: 'admissionNumber', label: 'Admission Number', sectionId: 'student' },
  { id: 'classroom', label: 'Classroom', sectionId: 'student' },
  { id: 'branch', label: 'Branch', sectionId: 'student' },
  { id: 'studentStatus', label: 'Student Status', sectionId: 'student' },
  { id: 'program', label: 'Program', sectionId: 'student' },
  { id: 'paymentDate', label: 'Payment Date', sectionId: 'payment' },
  { id: 'paymentMethod', label: 'Payment Method', sectionId: 'payment' },
  { id: 'paymentAmount', label: 'Payment Amount', sectionId: 'payment' },
  { id: 'paymentReference', label: 'Payment Reference', sectionId: 'payment' },
  { id: 'transactionId', label: 'Transaction ID', sectionId: 'payment' },
  { id: 'paidBy', label: 'Paid By', sectionId: 'payment' },
  { id: 'parentName', label: 'Parent Name', sectionId: 'family' },
  { id: 'parentEmail', label: 'Parent Email', sectionId: 'family' },
  { id: 'parentPhone', label: 'Parent Phone', sectionId: 'family' },
  { id: 'familyAccount', label: 'Family Account', sectionId: 'family' },
];

export const ALL_INVOICE_COLUMN_IDS = INVOICE_COLUMNS.map((c) => c.id);

export const INVOICES_LAST_GENERATED = {
  dateLabel: '30/07/2026',
  timeLabel: '11:42:18 AM',
  by: 'Malika Thimisetty',
};

export type InvoicesFormValues = {
  reportType: InvoiceReportType;
  startDate: string;
  endDate: string;
  rooms: string[];
  includeCancelled: boolean;
  format: ReportExportFormat;
  collapsePaymentRows: boolean;
  columnMode: InvoiceColumnMode;
  selectedColumns: InvoiceColumnId[];
};

export function defaultInvoicesForm(): InvoicesFormValues {
  return {
    reportType: 'invoice-date',
    startDate: '2026-07-24',
    endDate: '2026-07-30',
    rooms: [],
    includeCancelled: false,
    format: 'excel',
    collapsePaymentRows: false,
    columnMode: 'all',
    selectedColumns: [...ALL_INVOICE_COLUMN_IDS],
  };
}

type PaymentSeed = {
  date: string;
  method: string;
  amount: number;
  reference: string;
  transactionId: string;
  paidBy: string;
};

type InvoiceSeed = {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  status: 'Paid' | 'Due' | 'Overdue' | 'Cancelled';
  amount: number;
  tax: number;
  discount: number;
  notes: string;
  preferredName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  familyAccount: string;
  program: string;
  payments: PaymentSeed[];
};

const INVOICE_SEEDS: { studentId: string; invoice: InvoiceSeed }[] = [
  {
    studentId: 's1',
    invoice: {
      invoiceNumber: 'INV-2026-0142',
      invoiceDate: '2026-07-24',
      dueDate: '2026-08-05',
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      status: 'Due',
      amount: 18500,
      tax: 900,
      discount: 500,
      notes: 'July tuition',
      preferredName: 'Emma',
      parentName: 'Sarah Chen',
      parentEmail: 'sarah.chen@email.com',
      parentPhone: '+1 555-0101',
      familyAccount: 'Chen Household',
      program: 'Toddlers',
      payments: [
        {
          date: '2026-07-20',
          method: 'Card',
          amount: 5000,
          reference: 'PMT-8812',
          transactionId: 'TXN-441901',
          paidBy: 'Sarah Chen',
        },
      ],
    },
  },
  {
    studentId: 's2',
    invoice: {
      invoiceNumber: 'INV-2026-0143',
      invoiceDate: '2026-07-25',
      dueDate: '2026-08-05',
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      status: 'Paid',
      amount: 9800,
      tax: 480,
      discount: 0,
      notes: '',
      preferredName: 'Aarav',
      parentName: 'Priya Sharma',
      parentEmail: 'priya.sharma@email.com',
      parentPhone: '+1 555-0102',
      familyAccount: 'Sharma Household',
      program: 'Pre Nursery',
      payments: [
        {
          date: '2026-07-26',
          method: 'UPI',
          amount: 5000,
          reference: 'PMT-8820',
          transactionId: 'TXN-441955',
          paidBy: 'Priya Sharma',
        },
        {
          date: '2026-07-28',
          method: 'Bank Transfer',
          amount: 5280,
          reference: 'PMT-8831',
          transactionId: 'TXN-442010',
          paidBy: 'Priya Sharma',
        },
      ],
    },
  },
  {
    studentId: 's3',
    invoice: {
      invoiceNumber: 'INV-2026-0144',
      invoiceDate: '2026-07-26',
      dueDate: '2026-08-05',
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      status: 'Overdue',
      amount: 14200,
      tax: 700,
      discount: 0,
      notes: 'Late fee pending',
      preferredName: 'Mia',
      parentName: 'James Wilson',
      parentEmail: 'james.wilson@email.com',
      parentPhone: '+1 555-0103',
      familyAccount: 'Wilson Household',
      program: 'Nursery',
      payments: [],
    },
  },
  {
    studentId: 's4',
    invoice: {
      invoiceNumber: 'INV-2026-0138',
      invoiceDate: '2026-07-10',
      dueDate: '2026-07-20',
      billingPeriodStart: '2026-06-01',
      billingPeriodEnd: '2026-06-30',
      status: 'Cancelled',
      amount: 18500,
      tax: 900,
      discount: 1850,
      notes: 'Superseded by credit note',
      preferredName: 'Noah',
      parentName: 'Aisha Khan',
      parentEmail: 'aisha.khan@email.com',
      parentPhone: '+1 555-0104',
      familyAccount: 'Khan Household',
      program: 'Toddlers',
      payments: [],
    },
  },
  {
    studentId: 's5',
    invoice: {
      invoiceNumber: 'INV-2026-0145',
      invoiceDate: '2026-07-28',
      dueDate: '2026-08-08',
      billingPeriodStart: '2026-07-01',
      billingPeriodEnd: '2026-07-31',
      status: 'Paid',
      amount: 4500,
      tax: 220,
      discount: 0,
      notes: 'Extended care',
      preferredName: 'Sofia',
      parentName: 'Elena Rossi',
      parentEmail: 'elena.rossi@email.com',
      parentPhone: '+1 555-0105',
      familyAccount: 'Rossi Household',
      program: 'Junior KG',
      payments: [
        {
          date: '2026-07-29',
          method: 'Cash',
          amount: 4720,
          reference: 'PMT-8844',
          transactionId: 'TXN-442088',
          paidBy: 'Elena Rossi',
        },
      ],
    },
  },
];

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function inRange(iso: string, start: string, end: string) {
  return iso >= start && iso <= end;
}

function activeColumns(values: InvoicesFormValues) {
  if (values.columnMode === 'all') return INVOICE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return INVOICE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildInvoicesRows(values: InvoicesFormValues): Record<string, string>[] {
  const cols = activeColumns(values);
  const roomSet = new Set(values.rooms);
  const rows: Record<string, string>[] = [];

  for (const entry of INVOICE_SEEDS) {
    const student = MOCK_STUDENTS.find((s) => s.id === entry.studentId);
    if (!student) continue;
    if (roomSet.size && !roomSet.has(student.room)) continue;

    const inv = entry.invoice;
    if (inv.status === 'Cancelled' && !values.includeCancelled) continue;

    const compareDate =
      values.reportType === 'invoice-date' ? inv.invoiceDate : inv.billingPeriodStart;
    if (!inRange(compareDate, values.startDate, values.endDate)) continue;

    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
    const due = Math.max(0, inv.amount + inv.tax - inv.discount - paid);

    const baseFields = (
      payment?: PaymentSeed,
    ): Record<InvoiceColumnId, string> => ({
      invoiceNumber: inv.invoiceNumber,
      invoiceDate: toDisplayDate(inv.invoiceDate),
      dueDate: toDisplayDate(inv.dueDate),
      billingPeriodStart: toDisplayDate(inv.billingPeriodStart),
      billingPeriodEnd: toDisplayDate(inv.billingPeriodEnd),
      invoiceStatus: inv.status,
      invoiceAmount: money(inv.amount),
      amountPaid: money(paid),
      amountDue: money(due),
      taxAmount: money(inv.tax),
      discountAmount: money(inv.discount),
      invoiceNotes: inv.notes || '—',
      studentName: student.name,
      preferredName: inv.preferredName,
      admissionNumber: student.admissionNo,
      classroom: student.room,
      branch: 'Main Campus',
      studentStatus: student.status,
      program: inv.program,
      paymentDate: payment ? toDisplayDate(payment.date) : '—',
      paymentMethod: payment?.method ?? '—',
      paymentAmount: payment ? money(payment.amount) : '—',
      paymentReference: payment?.reference ?? '—',
      transactionId: payment?.transactionId ?? '—',
      paidBy: payment?.paidBy ?? '—',
      parentName: inv.parentName,
      parentEmail: inv.parentEmail,
      parentPhone: inv.parentPhone,
      familyAccount: inv.familyAccount,
    });

    const pushRow = (full: Record<InvoiceColumnId, string>) => {
      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      rows.push(row);
    };

    if (values.collapsePaymentRows || inv.payments.length <= 1) {
      pushRow(baseFields(inv.payments[0]));
    } else {
      inv.payments.forEach((payment) => pushRow(baseFields(payment)));
    }
  }

  return rows;
}

export function createInvoicesReport(
  values: InvoicesFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildInvoicesRows(values);
  const now = new Date();
  const ext = values.format === 'pdf' ? 'pdf' : 'xlsx';
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';
  const typeLabel = values.reportType === 'invoice-date' ? 'InvoiceDate' : 'BillingPeriod';

  return {
    id: `inv-${now.getTime()}`,
    kind: 'invoices',
    name: `Invoices_${typeLabel}_${toFileDate(values.startDate)}_${toFileDate(values.endDate)}.${ext}`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${roomsLabel} · ${values.startDate} → ${values.endDate}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
    format: values.format,
  };
}
