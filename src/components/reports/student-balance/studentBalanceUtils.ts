import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type DateScope = 'range' | 'lifetime';

export type BalanceColumnMode = 'all' | 'custom';

export type ReportFilterOption =
  | 'show-zero'
  | 'hide-zero'
  | 'show-all';

export type InvoiceStatusOption =
  | 'overdue-only'
  | 'all-invoices'
  | 'exclude-overdue';

export type BalanceColumnId =
  | 'studentName'
  | 'preferredName'
  | 'admissionNumber'
  | 'classroom'
  | 'branch'
  | 'parentName'
  | 'parentEmail'
  | 'parentPhone'
  | 'feePlan'
  | 'totalInvoiced'
  | 'totalPaid'
  | 'outstandingBalance'
  | 'creditBalance'
  | 'openingBalance'
  | 'overdueAmount'
  | 'invoiceCount'
  | 'lastInvoiceDate'
  | 'lastPaymentDate'
  | 'studentStatus'
  | 'program';

export const BALANCE_COLUMNS: { id: BalanceColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'branch', label: 'Branch' },
  { id: 'parentName', label: 'Parent Name' },
  { id: 'parentEmail', label: 'Parent Email' },
  { id: 'parentPhone', label: 'Parent Phone' },
  { id: 'feePlan', label: 'Fee Plan' },
  { id: 'totalInvoiced', label: 'Total Invoiced' },
  { id: 'totalPaid', label: 'Total Paid' },
  { id: 'outstandingBalance', label: 'Outstanding Balance' },
  { id: 'creditBalance', label: 'Credit Balance' },
  { id: 'openingBalance', label: 'Opening Balance' },
  { id: 'overdueAmount', label: 'Overdue Amount' },
  { id: 'invoiceCount', label: 'Invoice Count' },
  { id: 'lastInvoiceDate', label: 'Last Invoice Date' },
  { id: 'lastPaymentDate', label: 'Last Payment Date' },
  { id: 'studentStatus', label: 'Student Status' },
  { id: 'program', label: 'Program' },
];

export const REPORT_FILTER_OPTIONS: { value: ReportFilterOption; label: string }[] = [
  { value: 'show-zero', label: 'Show students with zero balance' },
  { value: 'hide-zero', label: 'Hide students with zero balance' },
  { value: 'show-all', label: 'Show all students' },
];

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatusOption; label: string }[] = [
  { value: 'overdue-only', label: 'Show only overdue invoices' },
  { value: 'all-invoices', label: 'Show all invoices' },
  { value: 'exclude-overdue', label: 'Exclude overdue invoices' },
];

export const STUDENT_BALANCE_LAST_GENERATED = {
  dateLabel: '30/07/2026',
  timeLabel: '02:18:44 PM',
  by: 'Malika Thimisetty',
};

export type StudentBalanceFormValues = {
  dateScope: DateScope;
  startDate: string;
  endDate: string;
  studentIds: string[];
  reportFilter: ReportFilterOption;
  invoiceStatus: InvoiceStatusOption;
  columnMode: BalanceColumnMode;
  selectedColumns: BalanceColumnId[];
};

export function defaultStudentBalanceForm(): StudentBalanceFormValues {
  return {
    dateScope: 'lifetime',
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    studentIds: [],
    reportFilter: 'show-zero',
    invoiceStatus: 'overdue-only',
    columnMode: 'all',
    selectedColumns: BALANCE_COLUMNS.map((c) => c.id),
  };
}

type BalanceSeed = {
  preferredName: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  feePlan: string;
  totalInvoiced: number;
  totalPaid: number;
  creditBalance: number;
  openingBalance: number;
  overdueAmount: number;
  invoiceCount: number;
  lastInvoiceDate: string;
  lastPaymentDate: string;
  program: string;
};

const BALANCE_BY_STUDENT: Record<string, BalanceSeed> = {
  s1: {
    preferredName: 'Emma',
    parentName: 'Sarah Chen',
    parentEmail: 'sarah.chen@email.com',
    parentPhone: '+1 555-0101',
    feePlan: 'Full Day Premium',
    totalInvoiced: 24500,
    totalPaid: 22000,
    creditBalance: 0,
    openingBalance: 500,
    overdueAmount: 2500,
    invoiceCount: 4,
    lastInvoiceDate: '2026-07-15',
    lastPaymentDate: '2026-07-10',
    program: 'Toddlers',
  },
  s2: {
    preferredName: 'Aarav',
    parentName: 'Priya Sharma',
    parentEmail: 'priya.sharma@email.com',
    parentPhone: '+1 555-0102',
    feePlan: 'Half Day Standard',
    totalInvoiced: 18000,
    totalPaid: 18000,
    creditBalance: 200,
    openingBalance: 0,
    overdueAmount: 0,
    invoiceCount: 3,
    lastInvoiceDate: '2026-07-20',
    lastPaymentDate: '2026-07-22',
    program: 'Nursery',
  },
  s3: {
    preferredName: 'Mia',
    parentName: 'James Wilson',
    parentEmail: 'james.wilson@email.com',
    parentPhone: '+1 555-0103',
    feePlan: 'Full Day Standard',
    totalInvoiced: 21000,
    totalPaid: 15000,
    creditBalance: 0,
    openingBalance: 1000,
    overdueAmount: 6000,
    invoiceCount: 5,
    lastInvoiceDate: '2026-07-28',
    lastPaymentDate: '2026-06-30',
    program: 'Pre Nursery',
  },
  s4: {
    preferredName: 'Liam',
    parentName: 'Olivia Brown',
    parentEmail: 'olivia.brown@email.com',
    parentPhone: '+1 555-0104',
    feePlan: 'Full Day Premium',
    totalInvoiced: 0,
    totalPaid: 0,
    creditBalance: 0,
    openingBalance: 0,
    overdueAmount: 0,
    invoiceCount: 0,
    lastInvoiceDate: '',
    lastPaymentDate: '',
    program: 'Infants',
  },
  s5: {
    preferredName: 'Sofia',
    parentName: 'Carlos Rivera',
    parentEmail: 'carlos.rivera@email.com',
    parentPhone: '+1 555-0105',
    feePlan: 'Extended Care',
    totalInvoiced: 32000,
    totalPaid: 30000,
    creditBalance: 500,
    openingBalance: 0,
    overdueAmount: 1500,
    invoiceCount: 6,
    lastInvoiceDate: '2026-07-25',
    lastPaymentDate: '2026-07-18',
    program: 'Junior KG',
  },
  s6: {
    preferredName: 'Noah',
    parentName: 'Aisha Khan',
    parentEmail: 'aisha.khan@email.com',
    parentPhone: '+1 555-0106',
    feePlan: 'Half Day Standard',
    totalInvoiced: 12000,
    totalPaid: 12000,
    creditBalance: 0,
    openingBalance: 0,
    overdueAmount: 0,
    invoiceCount: 2,
    lastInvoiceDate: '2026-07-05',
    lastPaymentDate: '2026-07-06',
    program: 'Senior KG',
  },
  s7: {
    preferredName: 'Ava',
    parentName: 'Daniel Park',
    parentEmail: 'daniel.park@email.com',
    parentPhone: '+1 555-0107',
    feePlan: 'Full Day Standard',
    totalInvoiced: 27500,
    totalPaid: 20000,
    creditBalance: 0,
    openingBalance: 750,
    overdueAmount: 7500,
    invoiceCount: 5,
    lastInvoiceDate: '2026-07-29',
    lastPaymentDate: '2026-07-01',
    program: 'Grade 1',
  },
  s8: {
    preferredName: 'Ethan',
    parentName: 'Maria Santos',
    parentEmail: 'maria.santos@email.com',
    parentPhone: '+1 555-0108',
    feePlan: 'Full Day Premium',
    totalInvoiced: 19500,
    totalPaid: 19500,
    creditBalance: 1000,
    openingBalance: 0,
    overdueAmount: 0,
    invoiceCount: 3,
    lastInvoiceDate: '2026-07-12',
    lastPaymentDate: '2026-07-14',
    program: 'Toddlers',
  },
};

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function outstanding(seed: BalanceSeed) {
  return Math.max(0, seed.totalInvoiced - seed.totalPaid + seed.openingBalance - seed.creditBalance);
}

function activeColumns(values: StudentBalanceFormValues) {
  if (values.columnMode === 'all') return BALANCE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return BALANCE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStudentBalanceRows(
  values: StudentBalanceFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => BALANCE_BY_STUDENT[s.id]);

  if (values.studentIds.length) {
    students = students.filter((s) => values.studentIds.includes(s.id));
  }

  const cols = activeColumns(values);

  return students
    .map((student) => {
      const seed = BALANCE_BY_STUDENT[student.id];
      const balance = outstanding(seed);

      if (values.reportFilter === 'show-zero' && balance !== 0) return null;
      if (values.reportFilter === 'hide-zero' && balance === 0) return null;

      if (values.invoiceStatus === 'overdue-only' && seed.overdueAmount <= 0) {
        if (values.reportFilter !== 'show-zero') return null;
      }
      if (values.invoiceStatus === 'exclude-overdue' && seed.overdueAmount > 0) return null;

      const full: Record<BalanceColumnId, string> = {
        studentName: student.name,
        preferredName: seed.preferredName,
        admissionNumber: student.admissionNo,
        classroom: student.room,
        branch: 'Main Campus',
        parentName: seed.parentName,
        parentEmail: seed.parentEmail,
        parentPhone: seed.parentPhone,
        feePlan: seed.feePlan,
        totalInvoiced: money(seed.totalInvoiced),
        totalPaid: money(seed.totalPaid),
        outstandingBalance: money(balance),
        creditBalance: money(seed.creditBalance),
        openingBalance: money(seed.openingBalance),
        overdueAmount: money(seed.overdueAmount),
        invoiceCount: String(seed.invoiceCount),
        lastInvoiceDate: seed.lastInvoiceDate ? toDisplayDate(seed.lastInvoiceDate) : '—',
        lastPaymentDate: seed.lastPaymentDate ? toDisplayDate(seed.lastPaymentDate) : '—',
        studentStatus: student.status,
        program: seed.program,
      };

      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      return row;
    })
    .filter((row): row is Record<string, string> => row !== null);
}

export function createStudentBalanceReport(
  values: StudentBalanceFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStudentBalanceRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const selectedStudents = values.studentIds.length
    ? MOCK_STUDENTS.filter((s) => values.studentIds.includes(s.id))
        .map((s) => s.name)
        .join(', ')
    : 'All students';

  const startDate = values.dateScope === 'lifetime' ? 'lifetime' : values.startDate;
  const endDate = values.dateScope === 'lifetime' ? 'lifetime' : values.endDate;

  const rangeLabel =
    values.dateScope === 'lifetime'
      ? 'Lifetime'
      : `${toFileDate(values.startDate)}_${toFileDate(values.endDate)}`;

  return {
    id: `bal-${now.getTime()}`,
    kind: 'student-balance',
    name: `Student_Balance_${rangeLabel}.xlsx`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.dateScope === 'lifetime' ? today : values.startDate,
    endDate: values.dateScope === 'lifetime' ? today : values.endDate,
    filterBy: 'student',
    selectedLabel: `${selectedStudents} · ${startDate === 'lifetime' ? 'Lifetime' : `${startDate} → ${endDate}`}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
