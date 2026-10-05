import {
  CURRENT_USER,
  MOCK_STUDENTS,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type SubsidyColumnMode = 'all' | 'custom';

export type SubsidyColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'subsidyAmount'
  | 'collectedAmount'
  | 'balanceDue';

export const SUBSIDY_COLUMNS: { id: SubsidyColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'subsidyAmount', label: 'Subsidy Amount' },
  { id: 'collectedAmount', label: 'Collected Amount' },
  { id: 'balanceDue', label: 'Balance Due' },
];

export type SubsidyCollectionFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  columnMode: SubsidyColumnMode;
  selectedColumns: SubsidyColumnId[];
};

type SubsidySeed = {
  studentId: string;
  invoiceRaiseDate: string;
  subsidyAmount: number;
  collectedAmount: number;
};

const SUBSIDIES: SubsidySeed[] = [
  { studentId: 's1', invoiceRaiseDate: '2026-07-03', subsidyAmount: 5000, collectedAmount: 3500 },
  { studentId: 's2', invoiceRaiseDate: '2026-07-08', subsidyAmount: 3000, collectedAmount: 3000 },
  { studentId: 's3', invoiceRaiseDate: '2026-07-12', subsidyAmount: 2500, collectedAmount: 1000 },
  { studentId: 's4', invoiceRaiseDate: '2026-07-15', subsidyAmount: 4000, collectedAmount: 2500 },
  { studentId: 's5', invoiceRaiseDate: '2026-07-18', subsidyAmount: 6000, collectedAmount: 4500 },
  { studentId: 's7', invoiceRaiseDate: '2026-07-25', subsidyAmount: 2800, collectedAmount: 0 },
  { studentId: 's9', invoiceRaiseDate: '2026-07-30', subsidyAmount: 3500, collectedAmount: 2000 },
  { studentId: 's12', invoiceRaiseDate: '2026-08-02', subsidyAmount: 4200, collectedAmount: 4200 },
];

export function defaultSubsidyCollectionForm(): SubsidyCollectionFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function activeColumns(values: SubsidyCollectionFormValues) {
  if (values.columnMode === 'all') return SUBSIDY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return SUBSIDY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildSubsidyCollectionRows(
  values: SubsidyCollectionFormValues,
): Record<string, string>[] {
  const byId = new Map(MOCK_STUDENTS.map((s) => [s.id, s]));
  const roomSet = new Set(values.rooms);
  const cols = activeColumns(values);

  return SUBSIDIES.filter((item) => {
    if (item.invoiceRaiseDate < values.startDate || item.invoiceRaiseDate > values.endDate) {
      return false;
    }
    if (!roomSet.size) return true;
    const student = byId.get(item.studentId);
    return student ? roomSet.has(student.room) : false;
  }).map((item) => {
    const student = byId.get(item.studentId);
    const balance = Math.max(0, item.subsidyAmount - item.collectedAmount);
    const full: Record<SubsidyColumnId, string> = {
      studentName: student?.name ?? '—',
      admissionNumber: student?.admissionNo ?? '—',
      subsidyAmount: money(item.subsidyAmount),
      collectedAmount: money(item.collectedAmount),
      balanceDue: money(balance),
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createSubsidyCollectionReport(
  values: SubsidyCollectionFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildSubsidyCollectionRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All rooms';

  return {
    id: `sub-${now.getTime()}`,
    kind: 'subsidy-collection',
    name: `Subsidy_Collection_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
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
