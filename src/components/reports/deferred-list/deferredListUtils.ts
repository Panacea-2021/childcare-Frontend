import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type DeferredColumnMode = 'all' | 'custom';

export type DeferredColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'centerName'
  | 'lastProgram'
  | 'deferredStartDate'
  | 'deferredEndDate';

export const DEFERRED_COLUMNS: { id: DeferredColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'lastProgram', label: 'Last Program' },
  { id: 'deferredStartDate', label: 'Deferred Start Date' },
  { id: 'deferredEndDate', label: 'Deferred End Date' },
];

export type DeferredListFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  columnMode: DeferredColumnMode;
  selectedColumns: DeferredColumnId[];
};

const PROGRAMS = [
  'Infant Care',
  'Toddler Enrichment',
  'Preschool Prep',
  'After School Club',
  'Weekend Play Hub',
];

export function defaultDeferredListForm(): DeferredListFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumnDefs(values: DeferredListFormValues) {
  if (values.columnMode === 'all') return DEFERRED_COLUMNS;
  return DEFERRED_COLUMNS.filter((c) => values.selectedColumns.includes(c.id));
}

export function buildDeferredListRows(
  values: DeferredListFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];
  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const defs = activeColumnDefs(values);
  return students.map((student, i) => {
    const [sy, sm, sd] = values.startDate.split('-').map(Number);
    const start = new Date(sy, sm - 1, Math.min(sd + (i % 5), 28));
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1 + (i % 2));
    const startIso = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    const endIso = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;

    const full: Record<DeferredColumnId, string> = {
      studentName: student.name,
      admissionNumber: student.admissionNo,
      centerName: 'Panacea Little Stars',
      lastProgram: PROGRAMS[i % PROGRAMS.length],
      deferredStartDate: toDisplayDate(startIso),
      deferredEndDate: toDisplayDate(endIso),
    };

    const row: Record<string, string> = {};
    defs.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createDeferredListReport(
  values: DeferredListFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const defs = activeColumnDefs(values);
  const columns = defs.map((c) => c.label);
  const rows = buildDeferredListRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';

  return {
    id: `deferred-${now.getTime()}`,
    kind: 'deferred-list',
    name: `Deferred_List_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
