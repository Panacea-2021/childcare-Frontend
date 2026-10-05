import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type StudentStatus,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type StudentStatusFormValues = {
  rooms: string[];
  statuses: StudentStatus[];
};

export const STUDENT_STATUS_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Student Status',
  'Program',
  'Center Name',
] as const;

const PROGRAMS = [
  'Infant Care',
  'Toddler Enrichment',
  'Preschool Prep',
  'After School Club',
  'Kindergarten Ready',
];

export function defaultStudentStatusForm(): StudentStatusFormValues {
  return {
    rooms: [],
    statuses: ['Active'],
  };
}

export function buildStudentStatusRows(
  values: StudentStatusFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];
  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }
  if (values.statuses.length) {
    students = students.filter((s) => values.statuses.includes(s.status));
  }

  return students.map((student, i) => ({
    'Student Name': student.name,
    'Admission Number': student.admissionNo,
    Classroom: student.room,
    'Student Status': student.status,
    Program: PROGRAMS[i % PROGRAMS.length],
    'Center Name': 'Panacea Little Stars',
  }));
}

export function createStudentStatusReport(
  values: StudentStatusFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...STUDENT_STATUS_COLUMNS];
  const rows = buildStudentStatusRows(values);
  const now = new Date();
  const rooms = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';
  const statuses = values.statuses.length ? values.statuses.join(', ') : 'All statuses';

  return {
    id: `student-status-${now.getTime()}`,
    kind: 'student-status',
    name: `Student_Status_Report_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: '',
    endDate: '',
    filterBy: 'classroom',
    selectedLabel: `${rooms} · ${statuses}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
