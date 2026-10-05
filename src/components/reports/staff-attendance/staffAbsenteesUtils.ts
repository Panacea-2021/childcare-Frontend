import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { eachDate, filterStaffMembers, staffSelectionLabel } from './shared';
import {
  CURRENT_USER,
  defaultStaffDateRange,
  type StaffAttendanceBaseForm,
} from './types';

export type ColumnMode = 'default' | 'custom';

export type StaffAbsenteeColumnId =
  | 'staffName'
  | 'employeeId'
  | 'date'
  | 'absent'
  | 'department'
  | 'role'
  | 'shift'
  | 'branch'
  | 'status'
  | 'updatedBy'
  | 'absentNote'
  | 'absentReason';

export const STAFF_ABSENTEE_COLUMNS: { id: StaffAbsenteeColumnId; label: string; defaultSelected?: boolean }[] = [
  { id: 'staffName', label: 'Staff Name', defaultSelected: true },
  { id: 'employeeId', label: 'Employee ID', defaultSelected: true },
  { id: 'date', label: 'Date', defaultSelected: true },
  { id: 'absent', label: 'Absent', defaultSelected: true },
  { id: 'department', label: 'Department', defaultSelected: true },
  { id: 'role', label: 'Role', defaultSelected: true },
  { id: 'shift', label: 'Shift', defaultSelected: false },
  { id: 'branch', label: 'Branch', defaultSelected: true },
  { id: 'status', label: 'Status', defaultSelected: false },
  { id: 'updatedBy', label: 'Updated By', defaultSelected: true },
  { id: 'absentNote', label: 'Absent Note', defaultSelected: false },
  { id: 'absentReason', label: 'Absent Reason', defaultSelected: false },
];

export const DEFAULT_STAFF_ABSENTEE_COLUMNS = STAFF_ABSENTEE_COLUMNS.filter((c) => c.defaultSelected).map(
  (c) => c.id,
);

export type StaffAbsenteesFormValues = StaffAttendanceBaseForm & {
  columnMode: ColumnMode;
  selectedColumns: StaffAbsenteeColumnId[];
};

export function defaultStaffAbsenteesForm(): StaffAbsenteesFormValues {
  const range = defaultStaffDateRange();
  return {
    ...range,
    filterBy: 'department',
    departments: [],
    staffId: null,
    columnMode: 'custom',
    selectedColumns: [...DEFAULT_STAFF_ABSENTEE_COLUMNS],
  };
}

const REASONS = ['Sick leave', 'Personal leave', 'Medical appointment', 'Family emergency', 'Unspecified'];
const NOTES = ['Manager notified', 'HR approved', 'No notice', 'Doctor note provided', 'Follow up needed'];
const UPDATERS = ['Malika Thimisetty', 'Priya Nair', 'Rahul Mehta', 'HR Desk'];

function activeColumns(values: StaffAbsenteesFormValues) {
  if (values.columnMode === 'default') {
    return STAFF_ABSENTEE_COLUMNS.filter((c) => c.defaultSelected);
  }
  const set = new Set(values.selectedColumns);
  return STAFF_ABSENTEE_COLUMNS.filter((c) => set.has(c.id));
}

export function buildStaffAbsenteeRows(values: StaffAbsenteesFormValues): Record<string, string>[] {
  const staff = filterStaffMembers(values, { activeOnly: true });
  const cols = activeColumns(values);
  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  staff.forEach((member, si) => {
    dates.forEach((date, di) => {
      if ((si + di) % 3 !== 0) return;
      const seed = si * 11 + di;
      const full: Record<StaffAbsenteeColumnId, string> = {
        staffName: member.name,
        employeeId: member.employeeId,
        date: toDisplayDate(date),
        absent: 'Yes',
        department: member.department,
        role: member.role,
        shift: member.shift,
        branch: member.branch,
        status: member.status,
        updatedBy: UPDATERS[seed % UPDATERS.length],
        absentNote: NOTES[seed % NOTES.length],
        absentReason: REASONS[seed % REASONS.length],
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

export function createStaffAbsenteesReport(
  values: StaffAbsenteesFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildStaffAbsenteeRows(values);
  const now = new Date();

  return {
    id: `staff-att-absentees-${now.getTime()}`,
    kind: 'staff-absentees',
    name: `Staff_Absentees_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
