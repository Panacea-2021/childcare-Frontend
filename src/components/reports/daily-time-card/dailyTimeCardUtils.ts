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

export type DailyTimeCardColumnMode = 'all' | 'custom';

export type DailyTimeCardColumnId =
  | 'studentName'
  | 'admissionNumber'
  | 'status'
  | 'branch'
  | 'centerId'
  | 'assignedRooms'
  | 'date'
  | 'checkInRoom'
  | 'checkInTime'
  | 'lateCheckIn'
  | 'checkInBy'
  | 'checkInTemperature'
  | 'checkInSignature'
  | 'checkOutTime'
  | 'checkOutNote'
  | 'checkOutSignature'
  | 'lateCheckOut'
  | 'checkOutBy'
  | 'absent'
  | 'absentNote'
  | 'absentReason'
  | 'leave'
  | 'totalHours'
  | 'breakHours';

export const DAILY_TIME_CARD_COLUMNS: { id: DailyTimeCardColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'admissionNumber', label: 'Admission Number' },
  { id: 'status', label: 'Status' },
  { id: 'branch', label: 'Branch' },
  { id: 'centerId', label: 'Center Id' },
  { id: 'assignedRooms', label: 'Assigned Rooms' },
  { id: 'date', label: 'Date' },
  { id: 'checkInRoom', label: 'Check-in Room' },
  { id: 'checkInTime', label: 'Check-in Time' },
  { id: 'lateCheckIn', label: 'Late Check-in' },
  { id: 'checkInBy', label: 'Check-In By' },
  { id: 'checkInTemperature', label: 'Check-in Temperature' },
  { id: 'checkInSignature', label: 'Check-in Signature' },
  { id: 'checkOutTime', label: 'Check-out Time' },
  { id: 'checkOutNote', label: 'Check-out Note' },
  { id: 'checkOutSignature', label: 'Check-out Signature' },
  { id: 'lateCheckOut', label: 'Late Check-out' },
  { id: 'checkOutBy', label: 'Check-Out By' },
  { id: 'absent', label: 'Absent' },
  { id: 'absentNote', label: 'Absent Note' },
  { id: 'absentReason', label: 'Absent Reason' },
  { id: 'leave', label: 'Leave' },
  { id: 'totalHours', label: 'Total Hours' },
  { id: 'breakHours', label: 'Break Hours' },
];

export type DailyTimeCardFormValues = {
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  columnMode: DailyTimeCardColumnMode;
  selectedColumns: DailyTimeCardColumnId[];
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function defaultDailyTimeCardForm(): DailyTimeCardFormValues {
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

const STAFF = ['Malika Thimisetty', 'Priya Nair', 'Rahul Mehta', 'Front Desk'];
const NOTES = ['Picked up by father', 'Early pickup requested', 'Normal day', 'Stay for activity'];
const ABSENT_REASONS = ['Sick', 'Family travel', 'Medical appointment', '—'];

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

function activeColumns(values: DailyTimeCardFormValues) {
  if (values.columnMode === 'all') return DAILY_TIME_CARD_COLUMNS;
  const set = new Set(values.selectedColumns);
  return DAILY_TIME_CARD_COLUMNS.filter((c) => set.has(c.id));
}

export function buildDailyTimeCardRows(values: DailyTimeCardFormValues): Record<string, string>[] {
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
    dates.forEach((date, di) => {
      const [y, m, d] = date.split('-').map(Number);
      const dow = new Date(y, m - 1, d).getDay();
      if (dow === 0 || dow === 6) return;

      const seed = si + di;
      const isAbsent = seed % 7 === 0;
      const lateIn = !isAbsent && seed % 3 === 0;
      const lateOut = !isAbsent && seed % 5 === 0;
      const onLeave = seed % 11 === 0;

      const full: Record<DailyTimeCardColumnId, string> = {
        studentName: student.name,
        admissionNumber: student.admissionNo,
        status: student.status,
        branch: 'Main Campus',
        centerId: 'CTR-001',
        assignedRooms: student.room,
        date: toDisplayDate(date),
        checkInRoom: isAbsent || onLeave ? '—' : student.room,
        checkInTime: isAbsent || onLeave ? '—' : `0${8 + (lateIn ? 1 : 0)}:${pad(lateIn ? 12 + (seed % 20) : 5)} AM`,
        lateCheckIn: isAbsent || onLeave ? '—' : lateIn ? 'Yes' : 'No',
        checkInBy: isAbsent || onLeave ? '—' : STAFF[seed % STAFF.length],
        checkInTemperature: isAbsent || onLeave ? '—' : `${(36.4 + (seed % 4) * 0.1).toFixed(1)}°C`,
        checkInSignature: isAbsent || onLeave ? '—' : 'Captured',
        checkOutTime: isAbsent || onLeave ? '—' : `${lateOut ? '4' : '3'}:${pad(lateOut ? 15 : 30)} PM`,
        checkOutNote: isAbsent || onLeave ? '—' : NOTES[seed % NOTES.length],
        checkOutSignature: isAbsent || onLeave ? '—' : 'Captured',
        lateCheckOut: isAbsent || onLeave ? '—' : lateOut ? 'Yes' : 'No',
        checkOutBy: isAbsent || onLeave ? '—' : STAFF[(seed + 1) % STAFF.length],
        absent: isAbsent ? 'Yes' : 'No',
        absentNote: isAbsent ? 'Parent informed' : '—',
        absentReason: isAbsent ? ABSENT_REASONS[seed % ABSENT_REASONS.length] : '—',
        leave: onLeave ? 'Yes' : 'No',
        totalHours: isAbsent || onLeave ? '0.0' : lateIn ? '6.2' : '7.0',
        breakHours: isAbsent || onLeave ? '0.0' : '0.5',
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

export function createDailyTimeCardReport(
  values: DailyTimeCardFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildDailyTimeCardRows(values);
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const now = new Date();

  return {
    id: `dtc-${now.getTime()}`,
    kind: 'daily-time-card',
    name: `Daily_Time_Card_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
