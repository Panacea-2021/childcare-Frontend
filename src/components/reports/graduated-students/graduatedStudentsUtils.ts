import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type GraduatedColumnMode = 'all' | 'custom';

export type GraduatedColumnId =
  | 'studentCode'
  | 'studentName'
  | 'centerName'
  | 'category'
  | 'program'
  | 'graduationDate'
  | 'outstandingAmount'
  | 'depositBalance';

export const GRADUATED_COLUMNS: { id: GraduatedColumnId; label: string }[] = [
  { id: 'studentCode', label: 'Student Code' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'centerName', label: 'Center Name' },
  { id: 'category', label: 'Category' },
  { id: 'program', label: 'Program' },
  { id: 'graduationDate', label: 'Graduation Date' },
  { id: 'outstandingAmount', label: 'Outstanding Amount' },
  { id: 'depositBalance', label: 'Deposit Balance' },
];

export type GraduatedStudentsFormValues = {
  startDate: string;
  endDate: string;
  columnMode: GraduatedColumnMode;
  selectedColumns: GraduatedColumnId[];
};

const PROGRAMS = [
  'Preschool Prep',
  'Kindergarten Ready',
  'After School Club',
  'Toddler Enrichment',
];

const CATEGORIES = ['Regular', 'Sibling', 'Staff Child', 'Scholarship'];

export function defaultGraduatedStudentsForm(): GraduatedStudentsFormValues {
  return {
    startDate: '2026-01-01',
    endDate: '2026-08-04',
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumnDefs(values: GraduatedStudentsFormValues) {
  if (values.columnMode === 'all') return GRADUATED_COLUMNS;
  return GRADUATED_COLUMNS.filter((c) => values.selectedColumns.includes(c.id));
}

export function buildGraduatedStudentsRows(
  values: GraduatedStudentsFormValues,
): Record<string, string>[] {
  const defs = activeColumnDefs(values);
  return MOCK_STUDENTS.map((student, i) => {
    const [y, m, d] = values.startDate.split('-').map(Number);
    const grad = new Date(y, m - 1, Math.min(d + (i % 18), 28));
    const gradIso = `${grad.getFullYear()}-${String(grad.getMonth() + 1).padStart(2, '0')}-${String(grad.getDate()).padStart(2, '0')}`;
    const full: Record<GraduatedColumnId, string> = {
      studentCode: student.admissionNo,
      studentName: student.name,
      centerName: 'Panacea Little Stars',
      category: CATEGORIES[i % CATEGORIES.length],
      program: PROGRAMS[i % PROGRAMS.length],
      graduationDate: toDisplayDate(gradIso),
      outstandingAmount: i % 3 === 0 ? `₹${(i + 1) * 250}` : '₹0',
      depositBalance: `₹${5000 + i * 100}`,
    };
    const row: Record<string, string> = {};
    defs.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createGraduatedStudentsReport(
  values: GraduatedStudentsFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const defs = activeColumnDefs(values);
  const columns = defs.map((c) => c.label);
  const rows = buildGraduatedStudentsRows(values);
  const now = new Date();

  return {
    id: `graduated-${now.getTime()}`,
    kind: 'graduated-students',
    name: `Graduated_Students_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: 'All graduated students',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
