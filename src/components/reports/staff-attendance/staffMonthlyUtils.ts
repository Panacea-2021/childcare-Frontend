import { toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { eachDate, filterStaffMembers, staffSelectionLabel } from './shared';
import {
  CURRENT_USER,
  defaultStaffDateRange,
  type StaffAttendanceBaseForm,
} from './types';

export type MonthlyColumnMode = 'all' | 'custom';

export type StaffMonthlyColumnId =
  | 'staffName'
  | 'employeeId'
  | 'department'
  | 'role'
  | 'present'
  | 'absent'
  | 'lateCheckIn'
  | 'leave'
  | 'halfDay'
  | 'totalHours'
  | 'workingDays'
  | 'attendancePercent'
  | 'shift'
  | 'branch'
  | 'status'
  | 'month';

export const STAFF_MONTHLY_COLUMNS: { id: StaffMonthlyColumnId; label: string }[] = [
  { id: 'staffName', label: 'Staff Name' },
  { id: 'employeeId', label: 'Employee ID' },
  { id: 'department', label: 'Department' },
  { id: 'role', label: 'Role' },
  { id: 'present', label: 'Present' },
  { id: 'absent', label: 'Absent' },
  { id: 'lateCheckIn', label: 'Late Check-in' },
  { id: 'leave', label: 'Leave' },
  { id: 'halfDay', label: 'Half Day' },
  { id: 'totalHours', label: 'Total Hours' },
  { id: 'workingDays', label: 'Working Days' },
  { id: 'attendancePercent', label: 'Attendance %' },
  { id: 'shift', label: 'Shift' },
  { id: 'branch', label: 'Branch' },
  { id: 'status', label: 'Status' },
  { id: 'month', label: 'Month' },
];

export type StaffMonthlyFormValues = StaffAttendanceBaseForm & {
  columnMode: MonthlyColumnMode;
  selectedColumns: StaffMonthlyColumnId[];
};

export function defaultStaffMonthlyForm(): StaffMonthlyFormValues {
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

function monthLabel(iso: string) {
  const [y, m] = iso.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[(m ?? 1) - 1]} ${y}`;
}

function activeColumns(values: StaffMonthlyFormValues) {
  if (values.columnMode === 'all') return STAFF_MONTHLY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return STAFF_MONTHLY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStaffMonthlyRows(values: StaffMonthlyFormValues): Record<string, string>[] {
  const staff = filterStaffMembers(values, { activeOnly: true });
  const cols = activeColumns(values);
  const dates = eachDate(values.startDate, values.endDate);
  const workingDays = Math.max(1, dates.filter((_, i) => i % 7 < 5).length);
  const rows: Record<string, string>[] = [];

  staff.forEach((member, si) => {
    const present = Math.max(0, workingDays - ((si % 4) + 1));
    const absent = Math.min(workingDays, (si % 3) + 1);
    const late = si % 4;
    const leave = si % 2;
    const halfDay = si % 3 === 0 ? 1 : 0;
    const attendancePercent = Math.round((present / workingDays) * 100);
    const full: Record<StaffMonthlyColumnId, string> = {
      staffName: member.name,
      employeeId: member.employeeId,
      department: member.department,
      role: member.role,
      present: String(present),
      absent: String(absent),
      lateCheckIn: String(late),
      leave: String(leave),
      halfDay: String(halfDay),
      totalHours: (present * 8 + halfDay * 4).toFixed(1),
      workingDays: String(workingDays),
      attendancePercent: `${attendancePercent}%`,
      shift: member.shift,
      branch: member.branch,
      status: member.status,
      month: monthLabel(values.startDate),
    };
    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    rows.push(row);
  });

  return rows;
}

export function createStaffMonthlyReport(
  values: StaffMonthlyFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStaffMonthlyRows(values);
  const now = new Date();

  return {
    id: `staff-att-monthly-${now.getTime()}`,
    kind: 'staff-monthly-attendance',
    name: `Staff_Monthly_Attendance_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
