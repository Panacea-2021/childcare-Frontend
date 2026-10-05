import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const CREDIT_NOTE_COLUMNS = [
  'Credit Note Number',
  'Creation Date',
  'Student Name',
  'Admission Number',
  'Classroom',
  'Linked Invoice',
  'Credit Amount',
  'Reason',
  'Status',
  'Created By',
  'Branch',
] as const;

export type CreditNoteFormValues = {
  startDate: string;
  endDate: string;
};

export function defaultCreditNoteForm(): CreditNoteFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
  };
}

type CreditNoteSeed = {
  number: string;
  date: string;
  studentId: string;
  invoice: string;
  amount: number;
  reason: string;
  status: string;
  createdBy: string;
};

const CREDIT_NOTES: CreditNoteSeed[] = [
  {
    number: 'CN-2026-001',
    date: '2026-07-03',
    studentId: 's1',
    invoice: 'INV-2026-0142',
    amount: 1500,
    reason: 'Duplicate charge adjustment',
    status: 'Applied',
    createdBy: 'Malika Thimisetty',
  },
  {
    number: 'CN-2026-002',
    date: '2026-07-08',
    studentId: 's3',
    invoice: 'INV-2026-0158',
    amount: 2500,
    reason: 'Service credit — closed days',
    status: 'Applied',
    createdBy: 'Priya Nair',
  },
  {
    number: 'CN-2026-003',
    date: '2026-07-12',
    studentId: 's5',
    invoice: 'INV-2026-0164',
    amount: 800,
    reason: 'Early withdrawal prorate',
    status: 'Pending',
    createdBy: 'Malika Thimisetty',
  },
  {
    number: 'CN-2026-004',
    date: '2026-07-18',
    studentId: 's2',
    invoice: 'INV-2026-0171',
    amount: 1200,
    reason: 'Fee plan correction',
    status: 'Applied',
    createdBy: 'Rahul Mehta',
  },
  {
    number: 'CN-2026-005',
    date: '2026-07-22',
    studentId: 's7',
    invoice: 'INV-2026-0180',
    amount: 3000,
    reason: 'Goodwill credit',
    status: 'Applied',
    createdBy: 'Front Desk',
  },
  {
    number: 'CN-2026-006',
    date: '2026-07-28',
    studentId: 's8',
    invoice: 'INV-2026-0188',
    amount: 500,
    reason: 'Discount not applied on invoice',
    status: 'Voided',
    createdBy: 'Priya Nair',
  },
];

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function inRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export function buildCreditNoteRows(values: CreditNoteFormValues): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));

  return CREDIT_NOTES.filter((cn) => inRange(cn.date, values.startDate, values.endDate)).map(
    (cn) => {
      const student = byId.get(cn.studentId);
      return {
        'Credit Note Number': cn.number,
        'Creation Date': toDisplayDate(cn.date),
        'Student Name': student?.name ?? '—',
        'Admission Number': student?.admissionNo ?? '—',
        Classroom: student?.room ?? '—',
        'Linked Invoice': cn.invoice,
        'Credit Amount': money(cn.amount),
        Reason: cn.reason,
        Status: cn.status,
        'Created By': cn.createdBy,
        Branch: 'Main Campus',
      };
    },
  );
}

export function createCreditNoteReport(
  values: CreditNoteFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...CREDIT_NOTE_COLUMNS];
  const rows = buildCreditNoteRows(values);
  const now = new Date();

  return {
    id: `cn-${now.getTime()}`,
    kind: 'credit-note',
    name: `Credit_Note_Report_${toFileDate(values.startDate)}_${toFileDate(values.endDate)}.xlsx`,
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
