import {
  toDisplayDate,
  toFileDate,
} from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';
import { eachDate, filterStaffMembers, pad, staffSelectionLabel } from './shared';
import {
  CURRENT_USER,
  defaultStaffDateRange,
  type AttendanceDayStatus,
  type StaffAttendanceBaseForm,
  type StaffMemberStatus,
} from './types';

export type StaffSummaryFormValues = StaffAttendanceBaseForm & {
  statuses: StaffMemberStatus[];
};

export function defaultStaffSummaryForm(): StaffSummaryFormValues {
  const range = defaultStaffDateRange();
  return {
    ...range,
    filterBy: 'department',
    departments: [],
    staffId: null,
    statuses: ['Active', 'Probation', 'On Leave'],
  };
}

function mockStatus(seed: number): AttendanceDayStatus {
  const statuses: AttendanceDayStatus[] = ['Present', 'Absent', 'Late', 'Half Day', 'Leave'];
  return statuses[seed % statuses.length];
}

function mockTimes(status: AttendanceDayStatus, seed: number) {
  if (status === 'Absent' || status === 'Leave') {
    return { checkIn: '—', checkOut: '—', totalHours: '0.0' };
  }
  const inH = 8 + (seed % 2);
  const inM = seed % 2 === 0 ? '00' : '18';
  const outH = status === 'Half Day' ? 12 : 16 + (seed % 2);
  const outM = seed % 3 === 0 ? '00' : '30';
  const total =
    status === 'Half Day'
      ? '4.0'
      : status === 'Late'
        ? '7.2'
        : `${(outH - inH + (Number(outM) - Number(inM)) / 60).toFixed(1)}`;
  return {
    checkIn: `${pad(inH)}:${inM} AM`,
    checkOut: `${pad(outH > 12 ? outH - 12 : outH)}:${outM} ${outH >= 12 ? 'PM' : 'AM'}`,
    totalHours: total,
  };
}

export function buildStaffSummaryRows(values: StaffSummaryFormValues): Record<string, string>[] {
  let staff = filterStaffMembers(values, { activeOnly: false });
  if (values.statuses.length) {
    staff = staff.filter((s) => values.statuses.includes(s.status));
  }

  const dates = eachDate(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  staff.forEach((member, si) => {
    dates.forEach((date, di) => {
      const seed = si * 17 + di * 3;
      const attendanceStatus = mockStatus(seed);
      const times = mockTimes(attendanceStatus, seed);
      rows.push({
        'Staff Name': member.name,
        'Employee ID': member.employeeId,
        Department: member.department,
        Role: member.role,
        Shift: member.shift,
        Branch: member.branch,
        'Attendance Date': toDisplayDate(date),
        'Attendance Status': attendanceStatus,
        'Check-In': times.checkIn,
        'Check-Out': times.checkOut,
        'Total Hours': times.totalHours,
        'Staff Status': member.status,
      });
    });
  });

  return rows;
}

export function createStaffSummaryReport(
  values: StaffSummaryFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const rows = buildStaffSummaryRows(values);
  const columns = rows[0] ? Object.keys(rows[0]) : [
    'Staff Name',
    'Employee ID',
    'Department',
    'Role',
    'Shift',
    'Branch',
    'Attendance Date',
    'Attendance Status',
    'Check-In',
    'Check-Out',
    'Total Hours',
    'Staff Status',
  ];
  const now = new Date();

  return {
    id: `staff-att-summary-${now.getTime()}`,
    kind: 'staff-attendance-summary',
    name: `Staff_Attendance_Summary_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
