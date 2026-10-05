import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type MonthlyAgingColumnMode = 'all' | 'custom';

export type MonthlyAgingColumnId =
  | 'admissionNumber'
  | 'studentName'
  | 'centerName'
  | 'noPastDue'
  | 'days0to30'
  | 'days31to60'
  | 'days61to90'
  | 'days91to120'
  | 'over120'
  | 'totalOutstanding';

export const MONTHLY_AGING_COLUMNS: { id: MonthlyAgingColumnId; label: string }[] = [
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'noPastDue', label: 'No Past Due' },
  { id: 'days0to30', label: '0–30 Days' },
  { id: 'days31to60', label: '31–60 Days' },
  { id: 'days61to90', label: '61–90 Days' },
  { id: 'days91to120', label: '91–120 Days' },
  { id: 'over120', label: '>120 Days' },
  { id: 'totalOutstanding', label: 'Total Outstanding' },
];

export type MonthlyAgingFormValues = {
  startDate: string;
  endDate: string;
  asOfDate: string;
  columnMode: MonthlyAgingColumnMode;
  selectedColumns: MonthlyAgingColumnId[];
};

type AgingSeed = {
  studentId: string;
  invoiceDate: string;
  noPastDue: number;
  days0to30: number;
  days31to60: number;
  days61to90: number;
  days91to120: number;
  over120: number;
};

const AGING_ROWS: AgingSeed[] = [
  {
    studentId: 's1',
    invoiceDate: '2026-07-05',
    noPastDue: 2500,
    days0to30: 0,
    days31to60: 0,
    days61to90: 0,
    days91to120: 0,
    over120: 0,
  },
  {
    studentId: 's2',
    invoiceDate: '2026-06-12',
    noPastDue: 0,
    days0to30: 1800,
    days31to60: 0,
    days61to90: 0,
    days91to120: 0,
    over120: 0,
  },
  {
    studentId: 's3',
    invoiceDate: '2026-05-20',
    noPastDue: 0,
    days0to30: 0,
    days31to60: 4200,
    days61to90: 1000,
    days91to120: 0,
    over120: 0,
  },
  {
    studentId: 's4',
    invoiceDate: '2026-04-08',
    noPastDue: 0,
    days0to30: 0,
    days31to60: 0,
    days61to90: 3500,
    days91to120: 2000,
    over120: 0,
  },
  {
    studentId: 's5',
    invoiceDate: '2026-02-15',
    noPastDue: 0,
    days0to30: 500,
    days31to60: 0,
    days61to90: 0,
    days91to120: 0,
    over120: 7500,
  },
  {
    studentId: 's7',
    invoiceDate: '2026-07-18',
    noPastDue: 9200,
    days0to30: 0,
    days31to60: 0,
    days61to90: 0,
    days91to120: 0,
    over120: 0,
  },
  {
    studentId: 's8',
    invoiceDate: '2026-03-22',
    noPastDue: 0,
    days0to30: 0,
    days31to60: 0,
    days61to90: 0,
    days91to120: 4100,
    over120: 1200,
  },
];

export function defaultMonthlyAgingForm(): MonthlyAgingFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    asOfDate: '2026-07-30',
    columnMode: 'all',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: MonthlyAgingFormValues) {
  if (values.columnMode === 'all') return MONTHLY_AGING_COLUMNS;
  const set = new Set(values.selectedColumns);
  return MONTHLY_AGING_COLUMNS.filter((c) => set.has(c.id));
}

export function buildMonthlyAgingRows(
  values: MonthlyAgingFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const cols = activeColumns(values);

  return AGING_ROWS.filter(
    (row) => row.invoiceDate >= values.startDate && row.invoiceDate <= values.endDate,
  ).map((row) => {
    const student = byId.get(row.studentId);
    const total =
      row.noPastDue +
      row.days0to30 +
      row.days31to60 +
      row.days61to90 +
      row.days91to120 +
      row.over120;

    const full: Record<MonthlyAgingColumnId, string> = {
      admissionNumber: student?.admissionNo ?? '—',
      studentName: student?.name ?? '—',
      centerName: 'Hams Kids Home | Daycare',
      noPastDue: money(row.noPastDue),
      days0to30: money(row.days0to30),
      days31to60: money(row.days31to60),
      days61to90: money(row.days61to90),
      days91to120: money(row.days91to120),
      over120: money(row.over120),
      totalOutstanding: money(total),
    };

    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createMonthlyAgingReport(
  values: MonthlyAgingFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildMonthlyAgingRows(values);
  const now = new Date();

  return {
    id: `aging-${now.getTime()}`,
    kind: 'monthly-aging',
    name: `Monthly_Aging_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}_asof_${toFileDate(values.asOfDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `As of ${toDisplayDate(values.asOfDate)}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
