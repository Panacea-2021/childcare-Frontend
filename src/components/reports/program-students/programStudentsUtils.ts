import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type StudentStatus,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type ProgramStudentsFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  statuses: StudentStatus[];
};

export const PROGRAM_STUDENTS_LAST_GENERATED = {
  dateLabel: '30/07/2026',
  timeLabel: '10:24:12 AM',
  by: 'Malika Thimisetty',
};

const PROGRAMS = [
  'Infant Care',
  'Toddler Enrichment',
  'Preschool Prep',
  'After School Club',
  'Weekend Play Hub',
];

export const PROGRAM_STUDENTS_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Program',
  'Enrollment Date',
  'Student Status',
  'Center Name',
] as const;

export function defaultProgramStudentsForm(): ProgramStudentsFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    rooms: [],
    statuses: ['Active'],
  };
}

function selectionLabel(values: ProgramStudentsFormValues) {
  const rooms = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';
  const statuses = values.statuses.length ? values.statuses.join(', ') : 'All statuses';
  return `${rooms} · ${statuses}`;
}

export function buildProgramStudentsRows(
  values: ProgramStudentsFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }
  if (values.statuses.length) {
    students = students.filter((s) => values.statuses.includes(s.status));
  }

  return students.map((student, i) => {
    const [y, m, d] = values.startDate.split('-').map(Number);
    const enroll = new Date(y, m - 1, Math.min(d + (i % 10), 28));
    const enrollIso = `${enroll.getFullYear()}-${String(enroll.getMonth() + 1).padStart(2, '0')}-${String(enroll.getDate()).padStart(2, '0')}`;
    return {
      'Student Name': student.name,
      'Admission Number': student.admissionNo,
      Classroom: student.room,
      Program: PROGRAMS[i % PROGRAMS.length],
      'Enrollment Date': toDisplayDate(enrollIso),
      'Student Status': student.status,
      'Center Name': 'Panacea Little Stars',
    };
  });
}

export function createProgramStudentsReport(
  values: ProgramStudentsFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...PROGRAM_STUDENTS_COLUMNS];
  const rows = buildProgramStudentsRows(values);
  const now = new Date();

  return {
    id: `prog-students-${now.getTime()}`,
    kind: 'program-students',
    name: `Program_Students_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: selectionLabel(values),
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
