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

export type ColumnMode = 'default' | 'custom';

export type AbsenteeColumnId =
  | 'studentName'
  | 'date'
  | 'absent'
  | 'updatedBy'
  | 'status'
  | 'rooms'
  | 'branch'
  | 'absentNote'
  | 'absentReason'
  | 'assignedRooms'
  | 'admissionNumber';

export type AbsenteeColumnDef = {
  id: AbsenteeColumnId;
  label: string;
  defaultSelected?: boolean;
};

export const ABSENTEE_COLUMNS: AbsenteeColumnDef[] = [
  { id: 'studentName', label: 'Student Name', defaultSelected: true },
  { id: 'date', label: 'Date', defaultSelected: true },
  { id: 'absent', label: 'Absent', defaultSelected: true },
  { id: 'updatedBy', label: 'Updated By', defaultSelected: true },
  { id: 'status', label: 'Status', defaultSelected: false },
  { id: 'rooms', label: 'Rooms', defaultSelected: true },
  { id: 'branch', label: 'Branch', defaultSelected: true },
  { id: 'absentNote', label: 'Absent Note', defaultSelected: false },
  { id: 'absentReason', label: 'Absent Reason', defaultSelected: false },
  { id: 'assignedRooms', label: 'Assigned Rooms', defaultSelected: false },
  { id: 'admissionNumber', label: 'Admission Number', defaultSelected: false },
];

export const DEFAULT_SELECTED_COLUMNS = ABSENTEE_COLUMNS.filter((c) => c.defaultSelected).map((c) => c.id);

export const ABSENTEES_LAST_GENERATED = {
  dateLabel: '30/07/2026',
  timeLabel: '11:41:36 PM',
  by: 'Malika Thimisetty',
};

export type AbsenteesFormValues = {
  startDate: string;
  endDate: string;
  filterBy: FilterBy;
  rooms: string[];
  studentId: string | null;
  columnMode: ColumnMode;
  selectedColumns: AbsenteeColumnId[];
};

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function defaultAbsenteesForm(): AbsenteesFormValues {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
    filterBy: 'classroom',
    rooms: [],
    studentId: null,
    columnMode: 'custom',
    selectedColumns: [...DEFAULT_SELECTED_COLUMNS],
  };
}

const REASONS = ['Sick', 'Family travel', 'Medical appointment', 'Personal', 'Unspecified'];
const NOTES = ['Parent called', 'WhatsApp message', 'No notice', 'Doctor note provided', 'Follow up needed'];
const UPDATERS = ['Malika Thimisetty', 'Priya Nair', 'Rahul Mehta', 'Front Desk'];

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

function activeColumns(values: AbsenteesFormValues): AbsenteeColumnDef[] {
  if (values.columnMode === 'default') {
    return ABSENTEE_COLUMNS.filter((c) => c.defaultSelected);
  }
  const set = new Set(values.selectedColumns);
  return ABSENTEE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildAbsenteeRows(values: AbsenteesFormValues): Record<string, string>[] {
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
      // Only some days are absences
      if ((si + di) % 3 !== 0) return;

      const full: Record<AbsenteeColumnId, string> = {
        studentName: student.name,
        admissionNumber: student.admissionNo,
        date: toDisplayDate(date),
        absent: 'Yes',
        updatedBy: UPDATERS[(si + di) % UPDATERS.length],
        status: student.status,
        rooms: student.room,
        branch: 'Main Campus',
        absentNote: NOTES[(si + di) % NOTES.length],
        absentReason: REASONS[(si + di) % REASONS.length],
        assignedRooms: student.room,
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

export function createAbsenteesReport(values: AbsenteesFormValues, by = CURRENT_USER): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildAbsenteeRows(values);
  const student = MOCK_STUDENTS.find((s) => s.id === values.studentId);
  const now = new Date();

  return {
    id: `abs-${now.getTime()}`,
    kind: 'absentees',
    name: `Absentees_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
