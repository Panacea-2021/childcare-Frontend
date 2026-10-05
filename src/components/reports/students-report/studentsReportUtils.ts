import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type StudentStatus,
} from '@/components/reports/attendance-summary/types';
import { toDisplayDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type StudentsReportFormValues = {
  rooms: string[];
  statuses: StudentStatus[];
};

export const STUDENTS_REPORT_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Preferred Name',
  'Gender',
  'Date of Birth',
  'Age',
  'Branch',
  'Student Status',
  'Enrollment Date',
] as const;

type Gender = 'Female' | 'Male';

type StudentProfile = {
  preferredName: string;
  gender: Gender;
  dateOfBirth: string;
  enrollmentDate: string;
  branch: string;
};

const PROFILES: Record<string, StudentProfile> = {
  s1: {
    preferredName: 'Emma',
    gender: 'Female',
    dateOfBirth: '2018-03-12',
    enrollmentDate: '2024-06-10',
    branch: 'Main Campus',
  },
  s2: {
    preferredName: 'Aarav',
    gender: 'Male',
    dateOfBirth: '2021-08-04',
    enrollmentDate: '2025-01-15',
    branch: 'Main Campus',
  },
  s3: {
    preferredName: 'Mia',
    gender: 'Female',
    dateOfBirth: '2023-01-22',
    enrollmentDate: '2025-04-02',
    branch: 'Main Campus',
  },
  s4: {
    preferredName: 'Liam',
    gender: 'Male',
    dateOfBirth: '2020-11-09',
    enrollmentDate: '2024-09-01',
    branch: 'East Wing',
  },
  s5: {
    preferredName: 'Sofia',
    gender: 'Female',
    dateOfBirth: '2019-05-30',
    enrollmentDate: '2024-07-18',
    branch: 'Main Campus',
  },
  s6: {
    preferredName: 'Noah',
    gender: 'Male',
    dateOfBirth: '2019-12-14',
    enrollmentDate: '2024-03-11',
    branch: 'Main Campus',
  },
  s7: {
    preferredName: 'Ava',
    gender: 'Female',
    dateOfBirth: '2022-07-07',
    enrollmentDate: '2025-06-20',
    branch: 'East Wing',
  },
  s8: {
    preferredName: 'Ethan',
    gender: 'Male',
    dateOfBirth: '2017-09-19',
    enrollmentDate: '2023-08-28',
    branch: 'Main Campus',
  },
  s9: {
    preferredName: 'Liv',
    gender: 'Female',
    dateOfBirth: '2024-10-03',
    enrollmentDate: '2026-02-10',
    branch: 'Main Campus',
  },
  s10: {
    preferredName: 'Lucas',
    gender: 'Male',
    dateOfBirth: '2016-04-25',
    enrollmentDate: '2022-05-16',
    branch: 'East Wing',
  },
  s11: {
    preferredName: 'Bella',
    gender: 'Female',
    dateOfBirth: '2015-06-18',
    enrollmentDate: '2021-09-06',
    branch: 'Main Campus',
  },
  s12: {
    preferredName: 'Mason',
    gender: 'Male',
    dateOfBirth: '2018-02-28',
    enrollmentDate: '2024-08-12',
    branch: 'Main Campus',
  },
};

function ageFromDob(iso: string, asOf = '2026-08-04') {
  const [by, bm, bd] = iso.split('-').map(Number);
  const [ay, am, ad] = asOf.split('-').map(Number);
  let age = ay - by;
  if (am < bm || (am === bm && ad < bd)) age -= 1;
  return String(Math.max(0, age));
}

function fallbackProfile(id: string, name: string): StudentProfile {
  const seed = id.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return {
    preferredName: name.split(' ')[0] ?? name,
    gender: seed % 2 === 0 ? 'Female' : 'Male',
    dateOfBirth: `20${16 + (seed % 8)}-${String((seed % 12) + 1).padStart(2, '0')}-${String((seed % 27) + 1).padStart(2, '0')}`,
    enrollmentDate: `202${3 + (seed % 3)}-${String((seed % 9) + 1).padStart(2, '0')}-15`,
    branch: seed % 2 === 0 ? 'Main Campus' : 'East Wing',
  };
}

export function defaultStudentsReportForm(): StudentsReportFormValues {
  return {
    rooms: [],
    statuses: ['Active'],
  };
}

export function buildStudentsReportRows(
  values: StudentsReportFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  if (values.statuses.length) {
    students = students.filter((s) => values.statuses.includes(s.status));
  }

  return students.map((student) => {
    const profile = PROFILES[student.id] ?? fallbackProfile(student.id, student.name);
    return {
      'Student Name': student.name,
      'Admission Number': student.admissionNo,
      Classroom: student.room,
      'Preferred Name': profile.preferredName,
      Gender: profile.gender,
      'Date of Birth': toDisplayDate(profile.dateOfBirth),
      Age: ageFromDob(profile.dateOfBirth),
      Branch: profile.branch,
      'Student Status': student.status,
      'Enrollment Date': toDisplayDate(profile.enrollmentDate),
    };
  });
}

function selectionLabel(values: StudentsReportFormValues) {
  const rooms = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';
  const statuses = values.statuses.length ? values.statuses.join(', ') : 'All statuses';
  return `${rooms} · ${statuses}`;
}

export function createStudentsReport(
  values: StudentsReportFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...STUDENTS_REPORT_COLUMNS];
  const rows = buildStudentsReportRows(values);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  return {
    id: `stu-${now.getTime()}`,
    kind: 'students',
    name: 'Students_Report.csv',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: selectionLabel(values),
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
