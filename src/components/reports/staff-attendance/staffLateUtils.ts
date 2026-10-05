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

export type LateColumnMode = 'all' | 'custom';

export type StaffLateColumnId =
  | 'staffName'
  | 'employeeId'
  | 'date'
  | 'department'
  | 'role'
  | 'shift'
  | 'scheduledIn'
  | 'checkInTime'
  | 'lateBy'
  | 'branch'
  | 'status'
  | 'updatedBy'
  | 'note'
  | 'totalHours';

export const STAFF_LATE_COLUMNS: { id: StaffLateColumnId; label: string }[] = [
  { id: 'staffName', label: 'Staff Name' },
  { id: 'employeeId', label: 'Employee ID' },
  { id: 'date', label: 'Date' },
  { id: 'department', label: 'Department' },
  { id: 'role', label: 'Role' },
  { id: 'shift', label: 'Shift' },
  { id: 'scheduledIn', label: 'Scheduled In' },
  { id: 'checkInTime', label: 'Check-in Time' },
  { id: 'lateBy', label: 'Late By' },
  { id: 'branch', label: 'Branch' },
  { id: 'status', label: 'Status' },
  { id: 'updatedBy', label: 'Updated By' },
  { id: 'note', label: 'Note' },
  { id: 'totalHours', label: 'Total Hours' },
];

export type StaffLateFormValues = StaffAttendanceBaseForm & {
  columnMode: LateColumnMode;
  selectedColumns: StaffLateColumnId[];
};

export function defaultStaffLateForm(): StaffLateFormValues {
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

const NOTES = ['Traffic delay', 'Public transport delay', 'Prior meeting overrun', 'Personal delay'];
const UPDATERS = ['Malika Thimisetty', 'Priya Nair', 'Rahul Mehta', 'HR Desk'];
const SCHEDULED: Record<string, string> = {
  Morning: '08:00 AM',
  Afternoon: '12:00 PM',
  General: '09:00 AM',
  Night: '08:00 PM',
};

function activeColumns(values: StaffLateFormValues) {
  if (values.columnMode === 'all') return STAFF_LATE_COLUMNS;
  const set = new Set(values.selectedColumns);
  return STAFF_LATE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStaffLateRows(values: StaffLateFormValues): Record<string, string>[] {
  const staff = filterStaffMembers(values, { activeOnly: true });
  const cols = activeColumns(values);
  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  staff.forEach((member, si) => {
    dates.forEach((date, di) => {
      if ((si + di) % 2 !== 0) return;
      const seed = si * 13 + di;
      const lateMins = 10 + (seed % 40);
      const inH = 8 + Math.floor(lateMins / 60);
      const inM = pad(lateMins % 60);
      const full: Record<StaffLateColumnId, string> = {
        staffName: member.name,
        employeeId: member.employeeId,
        date: toDisplayDate(date),
        department: member.department,
        role: member.role,
        shift: member.shift,
        scheduledIn: SCHEDULED[member.shift] ?? '09:00 AM',
        checkInTime: `${pad(inH)}:${inM} AM`,
        lateBy: `${lateMins} min`,
        branch: member.branch,
        status: member.status,
        updatedBy: UPDATERS[seed % UPDATERS.length],
        note: NOTES[seed % NOTES.length],
        totalHours: '7.5',
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

export function createStaffLateReport(
  values: StaffLateFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStaffLateRows(values);
  const now = new Date();

  return {
    id: `staff-att-late-${now.getTime()}`,
    kind: 'staff-late-attendance',
    name: `Staff_Late_Attendance_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
