import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type StudentStatus,
} from '@/components/reports/attendance-summary/types';
import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type CheckInCheckoutFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  statuses: StudentStatus[];
};

export const CHECKIN_CHECKOUT_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Attendance Date',
  'Check-In Time',
  'Check-Out Time',
  'Checked In By',
  'Checked Out By',
  'Check-In Signature',
  'Check-Out Signature',
  'Guardian Name',
  'Pickup Person',
  'Student Status',
  'Notes',
] as const;

const STAFF = [
  'Priya Nair',
  'Anita Kapoor',
  'Rahul Mehta',
  'Sneha Iyer',
  'Malika Thimisetty',
];

const GUARDIANS = [
  'Neha Sharma',
  'Amit Patel',
  'Ritu Singh',
  'Deepak Verma',
  'Kavita Rao',
  'Sanjay Mehta',
];

const NOTES = [
  'On-time arrival',
  'Parent signed digitally',
  'Authorized pickup verified',
  'Late morning drop-off',
  'Early pickup requested',
  'Temperature check completed',
  '—',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function defaultCheckInCheckoutForm(): CheckInCheckoutFormValues {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
    rooms: [],
    statuses: ['Active'],
  };
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

export function buildCheckInCheckoutRows(
  values: CheckInCheckoutFormValues,
): Record<string, string>[] {
  let students = [...MOCK_STUDENTS];

  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }

  if (values.statuses.length) {
    students = students.filter((s) => values.statuses.includes(s.status));
  }

  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  students.forEach((student, si) => {
    dates.forEach((date, di) => {
      const [y, m, d] = date.split('-').map(Number);
      const day = new Date(y, m - 1, d);
      const dow = day.getDay();
      if (dow === 0 || dow === 6) return;

      const seed = si + di * 3;
      const missedCheckout = seed % 11 === 0;
      const lateIn = seed % 4 === 0;
      const guardian = GUARDIANS[seed % GUARDIANS.length];
      const pickup = GUARDIANS[(seed + 2) % GUARDIANS.length];
      const inBy = STAFF[seed % STAFF.length];
      const outBy = STAFF[(seed + 1) % STAFF.length];

      rows.push({
        'Student Name': student.name,
        'Admission Number': student.admissionNo,
        Classroom: student.room,
        'Attendance Date': toDisplayDate(date),
        'Check-In Time': `0${8 + (lateIn ? 1 : 0)}:${pad(lateIn ? 10 + (seed % 25) : 5 + (seed % 10))} AM`,
        'Check-Out Time': missedCheckout
          ? '—'
          : `0${3 + (seed % 2)}:${pad(seed % 2 === 0 ? 30 : 0)} PM`,
        'Checked In By': inBy,
        'Checked Out By': missedCheckout ? '—' : outBy,
        'Check-In Signature': 'Captured',
        'Check-Out Signature': missedCheckout ? 'Pending' : 'Captured',
        'Guardian Name': guardian,
        'Pickup Person': missedCheckout ? '—' : pickup,
        'Student Status': student.status,
        Notes: NOTES[seed % NOTES.length],
      });
    });
  });

  return rows;
}

function selectionLabel(values: CheckInCheckoutFormValues) {
  const rooms = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';
  const statuses = values.statuses.length ? values.statuses.join(', ') : 'All statuses';
  return `${rooms} · ${statuses}`;
}

export function createCheckInCheckoutReport(
  values: CheckInCheckoutFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...CHECKIN_CHECKOUT_COLUMNS];
  const rows = buildCheckInCheckoutRows(values);
  const now = new Date();

  return {
    id: `cico-${now.getTime()}`,
    kind: 'checkin-checkout',
    name: `Check_In_Check_Out_Form_Records_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
