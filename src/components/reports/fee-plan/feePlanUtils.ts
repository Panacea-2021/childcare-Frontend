import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type FeePlanColumnMode = 'all' | 'custom';

export type FeePlanColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'classroom'
  | 'feePlan'
  | 'planType'
  | 'amount'
  | 'billingCycle'
  | 'startDate'
  | 'endDate'
  | 'status'
  | 'branch'
  | 'discount';

export const FEE_PLAN_COLUMNS: { id: FeePlanColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'feePlan', label: 'Fee Plan' },
  { id: 'planType', label: 'Plan Type' },
  { id: 'amount', label: 'Amount' },
  { id: 'billingCycle', label: 'Billing Cycle' },
  { id: 'startDate', label: 'Start Date' },
  { id: 'endDate', label: 'End Date' },
  { id: 'status', label: 'Status' },
  { id: 'branch', label: 'Branch' },
  { id: 'discount', label: 'Discount' },
];

export type FeePlanFormValues = {
  rooms: string[];
  columnMode: FeePlanColumnMode;
  selectedColumns: FeePlanColumnId[];
};

type PlanSeed = {
  feePlan: string;
  planType: string;
  amount: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  status: string;
  discount: string;
};

const PLANS: Record<string, PlanSeed> = {
  s1: {
    feePlan: 'Full Day Premium',
    planType: 'Recurring',
    amount: '₹18,500',
    billingCycle: 'Monthly',
    startDate: '12/06/2024',
    endDate: '—',
    status: 'Active',
    discount: '5%',
  },
  s2: {
    feePlan: 'Half Day Standard',
    planType: 'Recurring',
    amount: '₹9,800',
    billingCycle: 'Monthly',
    startDate: '20/01/2025',
    endDate: '—',
    status: 'Active',
    discount: '0%',
  },
  s3: {
    feePlan: 'Full Day Standard',
    planType: 'Recurring',
    amount: '₹14,200',
    billingCycle: 'Monthly',
    startDate: '05/04/2025',
    endDate: '—',
    status: 'Active',
    discount: '0%',
  },
  s4: {
    feePlan: 'Full Day Premium',
    planType: 'Recurring',
    amount: '₹18,500',
    billingCycle: 'Monthly',
    startDate: '03/09/2024',
    endDate: '31/08/2026',
    status: 'On Hold',
    discount: '10%',
  },
  s5: {
    feePlan: 'Extended Care',
    planType: 'Add-on',
    amount: '₹4,500',
    billingCycle: 'Monthly',
    startDate: '22/07/2024',
    endDate: '—',
    status: 'Active',
    discount: '0%',
  },
  s6: {
    feePlan: 'Half Day Standard',
    planType: 'Recurring',
    amount: '₹9,800',
    billingCycle: 'Monthly',
    startDate: '15/03/2024',
    endDate: '15/03/2026',
    status: 'Inactive',
    discount: '0%',
  },
  s7: {
    feePlan: 'Full Day Standard',
    planType: 'Recurring',
    amount: '₹14,200',
    billingCycle: 'Monthly',
    startDate: '25/06/2025',
    endDate: '—',
    status: 'Active',
    discount: '5%',
  },
  s8: {
    feePlan: 'Full Day Premium',
    planType: 'Recurring',
    amount: '₹18,500',
    billingCycle: 'Quarterly',
    startDate: '01/09/2023',
    endDate: '01/09/2025',
    status: 'Transferred',
    discount: '0%',
  },
  s9: {
    feePlan: 'Infant Care',
    planType: 'Recurring',
    amount: '₹22,000',
    billingCycle: 'Monthly',
    startDate: '—',
    endDate: '—',
    status: 'Signed Up',
    discount: '0%',
  },
  s12: {
    feePlan: 'Full Day Premium',
    planType: 'Recurring',
    amount: '₹18,500',
    billingCycle: 'Monthly',
    startDate: '15/08/2024',
    endDate: '—',
    status: 'Active',
    discount: '0%',
  },
};

export function defaultFeePlanForm(): FeePlanFormValues {
  return {
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: FeePlanFormValues) {
  if (values.columnMode === 'all') return FEE_PLAN_COLUMNS;
  const set = new Set(values.selectedColumns);
  return FEE_PLAN_COLUMNS.filter((c) => set.has(c.id));
}

export function buildFeePlanRows(values: FeePlanFormValues): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => PLANS[s.id]);

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);

  return students.map((student) => {
    const plan = PLANS[student.id];
    const full: Record<FeePlanColumnId, string> = {
      studentName: student.name,
      admissionNumber: student.admissionNo,
      classroom: student.room,
      feePlan: plan.feePlan,
      planType: plan.planType,
      amount: plan.amount,
      billingCycle: plan.billingCycle,
      startDate: plan.startDate,
      endDate: plan.endDate,
      status: plan.status,
      branch: 'Main Campus',
      discount: plan.discount,
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createFeePlanReport(
  values: FeePlanFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildFeePlanRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    id: `fp-${now.getTime()}`,
    kind: 'fee-plan',
    name: 'Fee_Plan_Report.xlsx',
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: values.rooms.length ? values.rooms.join(', ') : 'All classrooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
