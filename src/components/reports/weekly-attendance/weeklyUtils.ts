import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type FilterBy,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type WeeklyAttendanceFormValues = {
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  autoFill: boolean;
};

export const WEEKLY_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Attendance Date',
  'Day',
  'Check-in Time',
  'Check-out Time',
  'Attendance Status',
  'Present',
  'Absent',
  'Late Check-in',
  'Total Hours',
  'Student Status',
] as const;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function defaultWeeklyForm(): WeeklyAttendanceFormValues {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
    filterBy: 'classroom',
    rooms: [],
    studentId: null,
    autoFill: true,
  };
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function eachDate(start: string, end: string) {
  const out: string[] = [];
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const cur = new Date(sy, sm - 1, sd);
  const last = new Date(ey, em - 1, ed);
  while (cur <= last) {
    out.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`);
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function buildWeeklyRows(values: WeeklyAttendanceFormValues): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.filterBy === 'student') {
    students = students.filter((s) => s.id === values.studentId);
  } else if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  // When auto-fill is off, still generate from filters but with sparser mock coverage
  const density = values.autoFill ? 1 : 2;
  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  students.forEach((student, si) => {
    dates.forEach((date, di) => {
      const [y, m, d] = date.split('-').map(Number);
      const day = new Date(y, m - 1, d);
      const dow = day.getDay();
      if (dow === 0 || dow === 6) return;
      if ((si + di) % density !== 0 && !values.autoFill) return;

      const seed = si + di;
      const absent = seed % 7 === 0;
      const late = !absent && seed % 3 === 0;
      const status = absent ? 'Absent' : late ? 'Late' : 'Present';

      rows.push({
        'Student Name': student.name,
        'Admission Number': student.admissionNo,
        Classroom: student.room,
        'Attendance Date': toDisplayDate(date),
        Day: DAYS[dow],
        'Check-in Time': absent ? '—' : `0${8 + (late ? 1 : 0)}:${pad(late ? 15 + (seed % 20) : 5)} AM`,
        'Check-out Time': absent ? '—' : `0${3 + (seed % 2)}:${pad(seed % 2 === 0 ? 30 : 0)} PM`,
        'Attendance Status': status,
        Present: absent ? 'No' : 'Yes',
        Absent: absent ? 'Yes' : 'No',
        'Late Check-in': late ? 'Yes' : 'No',
        'Total Hours': absent ? '0.0' : late ? '6.5' : '7.0',
        'Student Status': student.status,
      });
    });
  });

  return rows;
}

export function createWeeklyAttendanceReport(
  values: WeeklyAttendanceFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...WEEKLY_COLUMNS];
  const rows = buildWeeklyRows(values);
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const now = new Date();

  return {
    id: `week-${now.getTime()}`,
    kind: 'weekly-attendance',
    name: `Weekly_Attendance_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: values.filterBy,
    selectedLabel:
      values.filterBy === 'student'
        ? student
          ? `${student.name} (${student.admissionNo})`
          : '—'
        : values.rooms.length
          ? values.rooms.join(', ')
          : 'All classrooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
    autoFill: values.autoFill,
  };
}
