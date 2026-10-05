import {
  MOCK_STUDENTS,
  CURRENT_USER,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type AgeColumnMode = 'all' | 'custom';

export type AgeColumnId =
  | 'name'
  | 'age'
  | 'birthdate'
  | 'classroom'
  | 'branch'
  | 'preferredName'
  | 'admissionNumber';

export const AGE_COLUMNS: { id: AgeColumnId; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'age', label: 'Age' },
  { id: 'birthdate', label: 'Birthdate' },
  { id: 'classroom', label: 'Classroom' },
  { id: 'branch', label: 'Branch' },
  { id: 'preferredName', label: 'Preferred Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
];

export type StudentsAgeFormValues = {
  rooms: string[];
  columnMode: AgeColumnMode;
  selectedColumns: AgeColumnId[];
};

const PREFERRED_NAMES: Record<string, string> = {
  s1: 'Em',
  s2: 'Aaru',
  s3: 'Mia',
  s4: 'Li',
  s5: 'Sofi',
  s6: 'Noah',
  s7: 'Avi',
  s8: 'Eth',
  s9: 'Liv',
  s10: 'Luke',
  s11: 'Bella',
  s12: 'Mace',
};

/** Deterministic birthdates / ages keyed by student id (as of Aug 2026). */
const STUDENT_AGES: Record<string, { birthdate: string; age: string }> = {
  s1: { birthdate: '15/03/2018', age: '8 years 4 months' },
  s2: { birthdate: '22/11/2021', age: '4 years 8 months' },
  s3: { birthdate: '08/07/2023', age: '3 years 0 months' },
  s4: { birthdate: '19/01/2020', age: '6 years 6 months' },
  s5: { birthdate: '03/09/2019', age: '6 years 11 months' },
  s6: { birthdate: '27/05/2017', age: '9 years 2 months' },
  s7: { birthdate: '11/12/2022', age: '3 years 7 months' },
  s8: { birthdate: '30/04/2016', age: '10 years 3 months' },
  s9: { birthdate: '14/02/2025', age: '1 year 5 months' },
  s10: { birthdate: '06/08/2015', age: '10 years 11 months' },
  s11: { birthdate: '21/10/2014', age: '11 years 9 months' },
  s12: { birthdate: '02/06/2018', age: '8 years 2 months' },
};

export function defaultStudentsAgeForm(): StudentsAgeFormValues {
  return {
    rooms: [],
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: StudentsAgeFormValues) {
  if (values.columnMode === 'all') return AGE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return AGE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStudentsAgeRows(values: StudentsAgeFormValues): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);

  return students.map((student) => {
    const ageInfo = STUDENT_AGES[student.id] ?? { birthdate: '01/01/2020', age: '6 years 0 months' };
    const full: Record<AgeColumnId, string> = {
      name: student.name,
      age: ageInfo.age,
      birthdate: ageInfo.birthdate,
      classroom: student.room,
      branch: 'Main Campus',
      preferredName: PREFERRED_NAMES[student.id] ?? student.name.split(' ')[0],
      admissionNumber: student.admissionNo,
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createStudentsAgeReport(
  values: StudentsAgeFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStudentsAgeRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    id: `age-${now.getTime()}`,
    kind: 'students-age',
    name: 'Students_Age_Report.csv',
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
