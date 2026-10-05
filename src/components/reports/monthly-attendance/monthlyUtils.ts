import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type FilterBy,
} from '@/components/reports/attendance-summary/types';
import { toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type MonthlyColumnMode = 'all' | 'custom';

export type MonthlyColumnId =
  | 'studentName'
  | 'absent'
  | 'present'
  | 'lateCheckIn'
  | 'lateCheckOut'
  | 'className'
  | 'earlyCheckIn'
  | 'earlyCheckOut'
  | 'noCheckOut'
  | 'leave'
  | 'totalHours'
  | 'breakHours'
  | 'calendarHoliday'
  | 'weekend'
  | 'branch'
  | 'rooms'
  | 'status'
  | 'month'
  | 'studentId'
  | 'groups'
  | 'workingDays'
  | 'attendancePercent';

export const MONTHLY_COLUMNS: { id: MonthlyColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'absent', label: 'Absent' },
  { id: 'present', label: 'Present' },
  { id: 'lateCheckIn', label: 'Late Check-in' },
  { id: 'lateCheckOut', label: 'Late Check-out' },
  { id: 'className', label: 'Class' },
  { id: 'earlyCheckIn', label: 'Early Check-in' },
  { id: 'earlyCheckOut', label: 'Early Check-out' },
  { id: 'noCheckOut', label: 'No Check-out' },
  { id: 'leave', label: 'Leave' },
  { id: 'totalHours', label: 'Total Hours' },
  { id: 'breakHours', label: 'Break Hours' },
  { id: 'calendarHoliday', label: 'Calendar Holiday' },
  { id: 'weekend', label: 'Weekend' },
  { id: 'branch', label: 'Branch' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'status', label: 'Status' },
  { id: 'month', label: 'Month' },
  { id: 'studentId', label: 'Student ID' },
  { id: 'groups', label: 'Groups' },
  { id: 'workingDays', label: 'Working Days' },
  { id: 'attendancePercent', label: 'Attendance %' },
];

export const DEFAULT_MONTHLY_SELECTED = MONTHLY_COLUMNS.map((c) => c.id);

export const MONTHLY_LAST_GENERATED = {
  dateLabel: '31/07/2026',
  timeLabel: '1:33:16 PM',
  by: 'Malika Thimisetty',
};

export type MonthlyAttendanceFormValues = {
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  columnMode: MonthlyColumnMode;
  selectedColumns: MonthlyColumnId[];
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function defaultMonthlyForm(): MonthlyAttendanceFormValues {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
    filterBy: 'classroom',
    rooms: [],
    studentId: null,
    columnMode: 'custom',
    selectedColumns: [...DEFAULT_MONTHLY_SELECTED],
  };
}

const GROUPS = ['A', 'B', 'Morning', 'Full Day'];

function monthLabel(iso: string) {
  const [y, m] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[(m ?? 1) - 1]} ${y}`;
}

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

function activeColumns(values: MonthlyAttendanceFormValues) {
  if (values.columnMode === 'all') return MONTHLY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return MONTHLY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildMonthlyRows(values: MonthlyAttendanceFormValues): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.filterBy === 'student') {
    students = students.filter((s) => s.id === values.studentId);
  } else if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);
  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  students.forEach((student, si) => {
    let present = 0;
    let absent = 0;
    let lateIn = 0;
    let lateOut = 0;
    let earlyIn = 0;
    let earlyOut = 0;
    let noCheckout = 0;
    let leave = 0;
    let holidays = 0;
    let weekends = 0;
    let totalHours = 0;
    let breakHours = 0;
    let workingDays = 0;

    dates.forEach((date, di) => {
      const [y, m, d] = date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      const seed = si + di;
      if (dow === 0 || dow === 6) {
        weekends += 1;
        return;
      }
      workingDays += 1;
      if (seed % 13 === 0) {
        holidays += 1;
        return;
      }
      if (seed % 11 === 0) {
        leave += 1;
        return;
      }
      if (seed % 7 === 0) {
        absent += 1;
        return;
      }
      present += 1;
      if (seed % 3 === 0) lateIn += 1;
      if (seed % 5 === 0) lateOut += 1;
      if (seed % 4 === 0) earlyIn += 1;
      if (seed % 6 === 0) earlyOut += 1;
      if (seed % 9 === 0) noCheckout += 1;
      totalHours += seed % 3 === 0 ? 6.5 : 7;
      breakHours += 0.5;
    });

    const denom = Math.max(1, workingDays - holidays);
    const pct = ((present / denom) * 100).toFixed(1);

    const full: Record<MonthlyColumnId, string> = {
      studentName: student.name,
      absent: String(absent),
      present: String(present),
      lateCheckIn: String(lateIn),
      lateCheckOut: String(lateOut),
      className: student.room,
      earlyCheckIn: String(earlyIn),
      earlyCheckOut: String(earlyOut),
      noCheckOut: String(noCheckout),
      leave: String(leave),
      totalHours: totalHours.toFixed(1),
      breakHours: breakHours.toFixed(1),
      calendarHoliday: String(holidays),
      weekend: String(weekends),
      branch: 'Main Campus',
      rooms: student.room,
      status: student.status,
      month: monthLabel(values.startDate),
      studentId: student.admissionNo,
      groups: GROUPS[si % GROUPS.length],
      workingDays: String(workingDays),
      attendancePercent: `${pct}%`,
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    rows.push(row);
  });

  return rows;
}

export function createMonthlyAttendanceReport(
  values: MonthlyAttendanceFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildMonthlyRows(values);
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const now = new Date();

  return {
    id: `mon-${now.getTime()}`,
    kind: 'monthly-attendance',
    name: `Monthly_Attendance_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
  };
}
