import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { eachDate, filterStaffMembers, pad, staffSelectionLabel } from './shared';
import {
  CURRENT_USER,
  defaultStaffDateRange,
  type StaffAttendanceBaseForm,
} from './types';

export type TimeCardColumnMode = 'all' | 'custom';

export type StaffTimeCardColumnId =
  | 'staffName'
  | 'employeeId'
  | 'department'
  | 'date'
  | 'shift'
  | 'checkInTime'
  | 'checkOutTime'
  | 'lateCheckIn'
  | 'lateCheckOut'
  | 'breakHours'
  | 'totalHours'
  | 'branch'
  | 'status'
  | 'punchInBy'
  | 'punchOutBy'
  | 'note';

export const STAFF_TIMECARD_COLUMNS: { id: StaffTimeCardColumnId; label: string }[] = [
  { id: 'staffName', label: 'Staff Name' },
  { id: 'employeeId', label: 'Employee ID' },
  { id: 'department', label: 'Department' },
  { id: 'date', label: 'Date' },
  { id: 'shift', label: 'Shift' },
  { id: 'checkInTime', label: 'Check-in Time' },
  { id: 'checkOutTime', label: 'Check-out Time' },
  { id: 'lateCheckIn', label: 'Late Check-in' },
  { id: 'lateCheckOut', label: 'Late Check-out' },
  { id: 'breakHours', label: 'Break Hours' },
  { id: 'totalHours', label: 'Total Hours' },
  { id: 'branch', label: 'Branch' },
  { id: 'status', label: 'Status' },
  { id: 'punchInBy', label: 'Punch-In By' },
  { id: 'punchOutBy', label: 'Punch-Out By' },
  { id: 'note', label: 'Note' },
];

export type StaffTimeCardFormValues = StaffAttendanceBaseForm & {
  columnMode: TimeCardColumnMode;
  selectedColumns: StaffTimeCardColumnId[];
};

export function defaultStaffTimeCardForm(): StaffTimeCardFormValues {
  const range = defaultStaffDateRange();
  return {
    ...range,
    filterBy: 'department',
    departments: [],
    staffId: null,
    columnMode: 'all',
    selectedColumns: [],
  };
}

const NOTES = ['Normal shift', 'Covered extra class', 'Left early for training', 'Overtime approved'];
const PUNCHERS = ['Biometric', 'Kiosk', 'Mobile App', 'Front Desk'];

function activeColumns(values: StaffTimeCardFormValues) {
  if (values.columnMode === 'all') return STAFF_TIMECARD_COLUMNS;
  const set = new Set(values.selectedColumns);
  return STAFF_TIMECARD_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStaffTimeCardRows(values: StaffTimeCardFormValues): Record<string, string>[] {
  const staff = filterStaffMembers(values, { activeOnly: true });
  const cols = activeColumns(values);
  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  staff.forEach((member, si) => {
    dates.forEach((date, di) => {
      const seed = si * 19 + di * 5;
      const late = seed % 4 === 0;
      const inH = late ? 8 : 7 + (seed % 2);
      const inM = late ? pad(10 + (seed % 25)) : '55';
      const outH = 4 + (seed % 2);
      const outM = seed % 2 === 0 ? '00' : '30';
      const full: Record<StaffTimeCardColumnId, string> = {
        staffName: member.name,
        employeeId: member.employeeId,
        department: member.department,
        date: toDisplayDate(date),
        shift: member.shift,
        checkInTime: `${pad(inH)}:${inM} AM`,
        checkOutTime: `${pad(outH)}:${outM} PM`,
        lateCheckIn: late ? 'Yes' : 'No',
        lateCheckOut: seed % 5 === 0 ? 'Yes' : 'No',
        breakHours: '1.0',
        totalHours: late ? '7.5' : '8.0',
        branch: member.branch,
        status: member.status,
        punchInBy: PUNCHERS[seed % PUNCHERS.length],
        punchOutBy: PUNCHERS[(seed + 1) % PUNCHERS.length],
        note: NOTES[seed % NOTES.length],
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

export function createStaffTimeCardReport(
  values: StaffTimeCardFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStaffTimeCardRows(values);
  const now = new Date();

  return {
    id: `staff-att-timecard-${now.getTime()}`,
    kind: 'staff-daily-timecard',
    name: `Staff_Daily_Time_Card_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: values.filterBy,
    selectedLabel: staffSelectionLabel(values),
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
