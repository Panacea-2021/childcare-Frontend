import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type ActiveStudentsFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
};

export const ACTIVE_STUDENTS_LAST_GENERATED = {
  dateLabel: '29/07/2026',
  timeLabel: '02:18:44 PM',
  by: 'Malika Thimisetty',
};

export const ACTIVE_STUDENTS_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Admission Date',
  'Program',
  'Student Status',
  'Center Name',
] as const;

const PROGRAMS = [
  'Infant Care',
  'Toddler Enrichment',
  'Preschool Prep',
  'After School Club',
  'Kindergarten Ready',
];

export function defaultActiveStudentsForm(): ActiveStudentsFormValues {
  return {
    startDate: '2026-01-01',
    endDate: '2026-08-04',
    rooms: [],
  };
}

export function buildActiveStudentsRows(
  values: ActiveStudentsFormValues,
): Record<string, string>[] {
  let students = MOCK_STUDENTS.filter((s) => s.status === 'Active');
  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  return students.map((student, i) => {
    const [y, m, d] = values.startDate.split('-').map(Number);
    const admit = new Date(y, m - 1, Math.min(d + (i % 20), 28));
    const admitIso = `${admit.getFullYear()}-${String(admit.getMonth() + 1).padStart(2, '0')}-${String(admit.getDate()).padStart(2, '0')}`;
    return {
      'Student Name': student.name,
      'Admission Number': student.admissionNo,
      Classroom: student.room,
      'Admission Date': toDisplayDate(admitIso),
      Program: PROGRAMS[i % PROGRAMS.length],
      'Student Status': student.status,
      'Center Name': 'Panacea Little Stars',
    };
  });
}

export function createActiveStudentsReport(
  values: ActiveStudentsFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...ACTIVE_STUDENTS_COLUMNS];
  const rows = buildActiveStudentsRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';

  return {
    id: `active-students-${now.getTime()}`,
    kind: 'active-students',
    name: `Active_Students_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
