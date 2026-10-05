import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const ALL_DISCOUNTS_VALUE = '__all_discounts__';

export const DISCOUNT_OPTIONS = [
  'Sibling Discount',
  'Early Bird',
  'Staff Child',
  'Loyalty Reward',
  'Promotional Offer',
  'Hardship Grant',
] as const;

export type DiscountColumnMode = 'all' | 'custom';

export type DiscountColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'classroom'
  | 'discountName'
  | 'discountType'
  | 'discountAmount'
  | 'discountPercent'
  | 'invoiceNumber'
  | 'appliedDate'
  | 'status'
  | 'branch';

export const DISCOUNT_COLUMNS: { id: DiscountColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'discountName', label: 'Discount Name' },
  { id: 'discountType', label: 'Discount Type' },
  { id: 'discountAmount', label: 'Discount Amount' },
  { id: 'discountPercent', label: 'Discount Percent' },
  { id: 'invoiceNumber', label: 'Invoice Number' },
  { id: 'appliedDate', label: 'Applied Date' },
  { id: 'status', label: 'Status' },
  { id: 'branch', label: 'Branch' },
];

export type DiscountFormValues = {
  startDate: string;
  endDate: string;
  discounts: string[];
  columnMode: DiscountColumnMode;
  selectedColumns: DiscountColumnId[];
};

type DiscountSeed = {
  studentId: string;
  discountName: (typeof DISCOUNT_OPTIONS)[number];
  discountType: 'Percentage' | 'Flat';
  discountAmount: number;
  discountPercent: number;
  invoiceNumber: string;
  appliedDate: string;
  status: 'Applied' | 'Pending' | 'Expired';
};

const DISCOUNTS: DiscountSeed[] = [
  {
    studentId: 's1',
    discountName: 'Sibling Discount',
    discountType: 'Percentage',
    discountAmount: 925,
    discountPercent: 5,
    invoiceNumber: 'INV-2026-0142',
    appliedDate: '2026-07-03',
    status: 'Applied',
  },
  {
    studentId: 's2',
    discountName: 'Early Bird',
    discountType: 'Flat',
    discountAmount: 500,
    discountPercent: 0,
    invoiceNumber: 'INV-2026-0151',
    appliedDate: '2026-07-08',
    status: 'Applied',
  },
  {
    studentId: 's3',
    discountName: 'Promotional Offer',
    discountType: 'Percentage',
    discountAmount: 710,
    discountPercent: 5,
    invoiceNumber: 'INV-2026-0158',
    appliedDate: '2026-07-12',
    status: 'Applied',
  },
  {
    studentId: 's4',
    discountName: 'Loyalty Reward',
    discountType: 'Percentage',
    discountAmount: 1420,
    discountPercent: 10,
    invoiceNumber: 'INV-2026-0164',
    appliedDate: '2026-07-15',
    status: 'Pending',
  },
  {
    studentId: 's5',
    discountName: 'Staff Child',
    discountType: 'Percentage',
    discountAmount: 1850,
    discountPercent: 15,
    invoiceNumber: 'INV-2026-0170',
    appliedDate: '2026-07-18',
    status: 'Applied',
  },
  {
    studentId: 's6',
    discountName: 'Hardship Grant',
    discountType: 'Flat',
    discountAmount: 2000,
    discountPercent: 0,
    invoiceNumber: 'INV-2026-0177',
    appliedDate: '2026-07-22',
    status: 'Applied',
  },
  {
    studentId: 's7',
    discountName: 'Sibling Discount',
    discountType: 'Percentage',
    discountAmount: 490,
    discountPercent: 5,
    invoiceNumber: 'INV-2026-0180',
    appliedDate: '2026-07-25',
    status: 'Applied',
  },
  {
    studentId: 's8',
    discountName: 'Early Bird',
    discountType: 'Flat',
    discountAmount: 750,
    discountPercent: 0,
    invoiceNumber: 'INV-2026-0188',
    appliedDate: '2026-07-28',
    status: 'Expired',
  },
  {
    studentId: 's9',
    discountName: 'Promotional Offer',
    discountType: 'Percentage',
    discountAmount: 360,
    discountPercent: 8,
    invoiceNumber: 'INV-2026-0192',
    appliedDate: '2026-07-30',
    status: 'Applied',
  },
  {
    studentId: 's12',
    discountName: 'Loyalty Reward',
    discountType: 'Flat',
    discountAmount: 1000,
    discountPercent: 0,
    invoiceNumber: 'INV-2026-0198',
    appliedDate: '2026-08-02',
    status: 'Applied',
  },
];

export function defaultDiscountForm(): DiscountFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    discounts: [ALL_DISCOUNTS_VALUE],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: DiscountFormValues) {
  if (values.columnMode === 'all') return DISCOUNT_COLUMNS;
  const set = new Set(values.selectedColumns);
  return DISCOUNT_COLUMNS.filter((c) => set.has(c.id));
}

function selectedDiscountNames(values: DiscountFormValues) {
  if (!values.discounts.length || values.discounts.includes(ALL_DISCOUNTS_VALUE)) {
    return new Set<string>(DISCOUNT_OPTIONS);
  }
  return new Set(values.discounts);
}

export function buildDiscountRows(values: DiscountFormValues): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const names = selectedDiscountNames(values);
  const cols = activeColumns(values);

  return DISCOUNTS.filter(
    (d) =>
      names.has(d.discountName) &&
      d.appliedDate >= values.startDate &&
      d.appliedDate <= values.endDate,
  ).map((d) => {
    const student = byId.get(d.studentId);
    const full: Record<DiscountColumnId, string> = {
      studentName: student?.name ?? '—',
      admissionNumber: student?.admissionNo ?? '—',
      classroom: student?.room ?? '—',
      discountName: d.discountName,
      discountType: d.discountType,
      discountAmount: money(d.discountAmount),
      discountPercent: `${d.discountPercent}%`,
      invoiceNumber: d.invoiceNumber,
      appliedDate: toDisplayDate(d.appliedDate),
      status: d.status,
      branch: 'Main Campus',
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createDiscountReport(
  values: DiscountFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildDiscountRows(values);
  const now = new Date();
  const discountsLabel =
    !values.discounts.length || values.discounts.includes(ALL_DISCOUNTS_VALUE)
      ? 'All discounts'
      : values.discounts.join(', ');

  return {
    id: `dsc-${now.getTime()}`,
    kind: 'discount',
    name: `Discount_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: discountsLabel,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
