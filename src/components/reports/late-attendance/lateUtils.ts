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

export type LateColumnMode = 'all' | 'custom';

export type LateColumnId =
  | 'studentName'
  | 'date'
  | 'absent'
  | 'status'
  | 'id'
  | 'rooms'
  | 'groups'
  | 'roomRecords'
  | 'lateCheckIn'
  | 'checkInTime'
  | 'checkInRoom'
  | 'updatedBy'
  | 'checkInTemperature'
  | 'checkInNote'
  | 'checkInSignature'
  | 'totalHours'
  | 'breakHours'
  | 'branch'
  | 'admissionNumber';

export const LATE_COLUMNS: { id: LateColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'date', label: 'Date' },
  { id: 'absent', label: 'Absent' },
  { id: 'status', label: 'Status' },
  { id: 'id', label: 'ID' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'groups', label: 'Groups' },
  { id: 'roomRecords', label: 'Room Records' },
  { id: 'lateCheckIn', label: 'Late Check-in' },
  { id: 'checkInTime', label: 'Check-in Time' },
  { id: 'checkInRoom', label: 'Check-in Room' },
  { id: 'updatedBy', label: 'Updated By' },
  { id: 'checkInTemperature', label: 'Check-in Temperature' },
  { id: 'checkInNote', label: 'Check-in Note' },
  { id: 'checkInSignature', label: 'Check-in Signature' },
  { id: 'totalHours', label: 'Total Hours' },
  { id: 'breakHours', label: 'Break Hours' },
  { id: 'branch', label: 'Branch' },
  { id: 'admissionNumber', label: 'Admission Number' },
];

export type LateAttendanceFormValues = {
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  columnMode: LateColumnMode;
  selectedColumns: LateColumnId[];
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function defaultLateForm(): LateAttendanceFormValues {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
    filterBy: 'classroom',
    rooms: [],
    studentId: null,
    columnMode: 'all',
    selectedColumns: [],
  };
}

const NOTES = ['Traffic delay', 'Doctor visit overrun', 'Parent running late', 'Transport delay'];
const UPDATERS = ['Malika Thimisetty', 'Priya Nair', 'Rahul Mehta', 'Front Desk'];
const GROUPS = ['A', 'B', 'Morning', 'Full Day'];

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

function activeColumns(values: LateAttendanceFormValues) {
  if (values.columnMode === 'all') return LATE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return LATE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildLateRows(values: LateAttendanceFormValues): Record<string, string>[] {
  let students = [...MOCK_STUDENTS].filter((s) => s.status === 'Active' || s.status === 'On Hold');

  if (values.filterBy === 'student') {
    students = students.filter((s) => s.id === values.studentId);
  } else if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  const cols = activeColumns(values);
  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  students.forEach((student, si) => {
    dates.forEach((date, di) => {
      const [y, m, d] = date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      if (dow === 0 || dow === 6) return;
      // Late on some days only
      if ((si + di) % 2 !== 0) return;

      const lateMins = 8 + ((si + di) % 25);
      const checkInH = 9;
      const checkInM = pad(lateMins);
      const full: Record<LateColumnId, string> = {
        studentName: student.name,
        date: toDisplayDate(date),
        absent: 'No',
        status: student.status,
        id: `LAT-${1000 + si * 10 + di}`,
        rooms: student.room,
        groups: GROUPS[(si + di) % GROUPS.length],
        roomRecords: '1',
        lateCheckIn: `Yes (+${lateMins}m)`,
        checkInTime: `${checkInH}:${checkInM} AM`,
        checkInRoom: student.room,
        updatedBy: UPDATERS[(si + di) % UPDATERS.length],
        checkInTemperature: `${(36.4 + ((si + di) % 5) * 0.1).toFixed(1)}°C`,
        checkInNote: NOTES[(si + di) % NOTES.length],
        checkInSignature: 'Captured',
        totalHours: '6.5',
        breakHours: '0.5',
        branch: 'Main Campus',
        admissionNumber: student.admissionNo,
      };

      const row: Record<string, string> = {};
      cols.forEach((col) => {
        row[col.label] = full[col.id];
      });
      rows.push(row);
    });
  });

  return rows;
}

export function createLateAttendanceReport(
  values: LateAttendanceFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildLateRows(values);
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const now = new Date();

  return {
    id: `late-${now.getTime()}`,
    kind: 'late-attendance',
    name: `Late_Attendance_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
