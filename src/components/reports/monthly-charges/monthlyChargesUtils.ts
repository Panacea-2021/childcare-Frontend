import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const ALL_FEE_PLANS_VALUE = '__all_fee_plans__';

export const FEE_PLAN_OPTIONS = [
  'Full Day Premium',
  'Full Day Standard',
  'Half Day Standard',
  'Extended Care',
  'Infant Care',
  'Weekend Club',
] as const;

export type MonthlyChargesColumnMode = 'all' | 'custom';

export type MonthlyChargesColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'classroom'
  | 'feePlan'
  | 'chargeName'
  | 'chargeType'
  | 'amount'
  | 'tax'
  | 'discount'
  | 'netAmount'
  | 'billingPeriod'
  | 'dueDate'
  | 'status'
  | 'branch';

export const MONTHLY_CHARGES_COLUMNS: { id: MonthlyChargesColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'feePlan', label: 'Fee Plan' },
  { id: 'chargeName', label: 'Charge Name' },
  { id: 'chargeType', label: 'Charge Type' },
  { id: 'amount', label: 'Amount' },
  { id: 'tax', label: 'Tax' },
  { id: 'discount', label: 'Discount' },
  { id: 'netAmount', label: 'Net Amount' },
  { id: 'billingPeriod', label: 'Billing Period' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'status', label: 'Status' },
  { id: 'branch', label: 'Branch' },
];

export type MonthlyChargesFormValues = {
  startDate: string;
  endDate: string;
  feePlans: string[];
  columnMode: MonthlyChargesColumnMode;
  selectedColumns: MonthlyChargesColumnId[];
};

type ChargeSeed = {
  feePlan: (typeof FEE_PLAN_OPTIONS)[number];
  chargeName: string;
  chargeType: string;
  amount: number;
  tax: number;
  discount: number;
  status: string;
};

const CHARGES: Record<string, ChargeSeed> = {
  s1: {
    feePlan: 'Full Day Premium',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 18500,
    tax: 0,
    discount: 925,
    status: 'Posted',
  },
  s2: {
    feePlan: 'Half Day Standard',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 9800,
    tax: 0,
    discount: 0,
    status: 'Posted',
  },
  s3: {
    feePlan: 'Full Day Standard',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 14200,
    tax: 0,
    discount: 0,
    status: 'Posted',
  },
  s4: {
    feePlan: 'Full Day Premium',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 18500,
    tax: 0,
    discount: 1850,
    status: 'On Hold',
  },
  s5: {
    feePlan: 'Extended Care',
    chargeName: 'Aftercare',
    chargeType: 'Add-on',
    amount: 4500,
    tax: 0,
    discount: 0,
    status: 'Posted',
  },
  s6: {
    feePlan: 'Half Day Standard',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 9800,
    tax: 0,
    discount: 0,
    status: 'Waived',
  },
  s7: {
    feePlan: 'Full Day Standard',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 14200,
    tax: 0,
    discount: 710,
    status: 'Posted',
  },
  s8: {
    feePlan: 'Full Day Premium',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 18500,
    tax: 0,
    discount: 0,
    status: 'Closed',
  },
  s9: {
    feePlan: 'Infant Care',
    chargeName: 'Infant Program Fee',
    chargeType: 'Recurring',
    amount: 22000,
    tax: 0,
    discount: 0,
    status: 'Draft',
  },
  s12: {
    feePlan: 'Full Day Premium',
    chargeName: 'Tuition Fee',
    chargeType: 'Recurring',
    amount: 18500,
    tax: 0,
    discount: 0,
    status: 'Posted',
  },
};

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function defaultMonthlyChargesForm(): MonthlyChargesFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    feePlans: [ALL_FEE_PLANS_VALUE],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: MonthlyChargesFormValues) {
  if (values.columnMode === 'all') return MONTHLY_CHARGES_COLUMNS;
  const set = new Set(values.selectedColumns);
  return MONTHLY_CHARGES_COLUMNS.filter((c) => set.has(c.id));
}

function resolveFeePlans(selected: string[]) {
  if (!selected.length || selected.includes(ALL_FEE_PLANS_VALUE)) {
    return [...FEE_PLAN_OPTIONS];
  }
  return selected.filter((v): v is (typeof FEE_PLAN_OPTIONS)[number] =>
    (FEE_PLAN_OPTIONS as readonly string[]).includes(v),
  );
}

export function buildMonthlyChargesRows(
  values: MonthlyChargesFormValues,
): Record<string, string>[] {
  const plans = new Set(resolveFeePlans(values.feePlans));
  const period = `${toDisplayDate(values.startDate)} – ${toDisplayDate(values.endDate)}`;
  const cols = activeColumns(values);

  return MOCK_STUDENTS.filter((s) => CHARGES[s.id])
    .filter((s) => plans.has(CHARGES[s.id].feePlan))
    .map((student) => {
      const charge = CHARGES[student.id];
      const net = Math.max(0, charge.amount + charge.tax - charge.discount);
      const full: Record<MonthlyChargesColumnId, string> = {
        studentName: student.name,
        admissionNumber: student.admissionNo,
        classroom: student.room,
        feePlan: charge.feePlan,
        chargeName: charge.chargeName,
        chargeType: charge.chargeType,
        amount: inr(charge.amount),
        tax: inr(charge.tax),
        discount: inr(charge.discount),
        netAmount: inr(net),
        billingPeriod: period,
        dueDate: toDisplayDate(values.endDate),
        status: charge.status,
        branch: 'Main Campus',
      };

      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      return row;
    });
}

export function createMonthlyChargesReport(
  values: MonthlyChargesFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildMonthlyChargesRows(values);
  const now = new Date();
  const plansLabel =
    !values.feePlans.length || values.feePlans.includes(ALL_FEE_PLANS_VALUE)
      ? 'All fee plans'
      : values.feePlans.join(', ');

  return {
    id: `mcr-${now.getTime()}`,
    kind: 'monthly-charges',
    name: `Monthly_Charges_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: plansLabel,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
