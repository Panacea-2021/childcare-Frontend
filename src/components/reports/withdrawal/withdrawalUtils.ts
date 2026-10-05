import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type WithdrawalFormValues = {
  startDate: string;
  endDate: string;
};

const REASONS = [
  'Relocating',
  'School transition',
  'Financial',
  'Family preference',
  'Medical',
  'Other',
];

export const WITHDRAWAL_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Withdrawal Date',
  'Reason',
  'Center Name',
  'Outstanding Balance',
] as const;

export function defaultWithdrawalForm(): WithdrawalFormValues {
  return {
    startDate: '2026-01-01',
    endDate: '2026-08-04',
  };
}

export function buildWithdrawalRows(values: WithdrawalFormValues): Record<string, string>[] {
  return MOCK_STUDENTS.map((student, i) => {
    const [y, m, d] = values.startDate.split('-').map(Number);
    const exit = new Date(y, m - 1, Math.min(d + (i % 15), 28));
    const exitIso = `${exit.getFullYear()}-${String(exit.getMonth() + 1).padStart(2, '0')}-${String(exit.getDate()).padStart(2, '0')}`;
    const balance = i % 4 === 0 ? `₹${(i + 1) * 450}` : '₹0';
    return {
      'Student Name': student.name,
      'Admission Number': student.admissionNo,
      Classroom: student.room,
      'Withdrawal Date': toDisplayDate(exitIso),
      Reason: REASONS[i % REASONS.length],
      'Center Name': 'Panacea Little Stars',
      'Outstanding Balance': balance,
    };
  });
}

export function createWithdrawalReport(
  values: WithdrawalFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...WITHDRAWAL_COLUMNS];
  const rows = buildWithdrawalRows(values);
  const now = new Date();

  return {
    id: `withdrawal-${now.getTime()}`,
    kind: 'withdrawal',
    name: `Withdrawal_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: 'All students',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
