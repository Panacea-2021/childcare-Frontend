import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const STAFF_STATUSES = [
  'Active',
  'Inactive',
  'On Leave',
  'Probation',
  'Terminated',
] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number];

export type StaffColumnId =
  | 'staffName'
  | 'employeeId'
  | 'email'
  | 'phone'
  | 'role'
  | 'department'
  | 'designation'
  | 'employmentType'
  | 'joinDate'
  | 'status'
  | 'branch'
  | 'gender'
  | 'dateOfBirth'
  | 'reportingManager'
  | 'shift'
  | 'address';

export const STAFF_COLUMNS: { id: StaffColumnId; label: string }[] = [
  { id: 'staffName', label: 'Staff Name' },
  { id: 'employeeId', label: 'Employee ID' },
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Phone' },
  { id: 'role', label: 'Role' },
  { id: 'department', label: 'Department' },
  { id: 'designation', label: 'Designation' },
  { id: 'employmentType', label: 'Employment Type' },
  { id: 'joinDate', label: 'Join Date' },
  { id: 'status', label: 'Status' },
  { id: 'branch', label: 'Branch' },
  { id: 'gender', label: 'Gender' },
  { id: 'dateOfBirth', label: 'Date of Birth' },
  { id: 'reportingManager', label: 'Reporting Manager' },
  { id: 'shift', label: 'Shift' },
  { id: 'address', label: 'Address' },
];

export type StaffReportFormValues = {
  statuses: StaffStatus[];
  selectedColumns: StaffColumnId[];
};

type StaffSeed = {
  id: string;
  staffName: string;
  employeeId: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  employmentType: string;
  joinDate: string;
  status: StaffStatus;
  branch: string;
  gender: string;
  dateOfBirth: string;
  reportingManager: string;
  shift: string;
  address: string;
};

const STAFF: StaffSeed[] = [
  {
    id: 'st1',
    staffName: 'Priya Nair',
    employeeId: 'EMP-1001',
    email: 'priya.nair@center.edu',
    phone: '+91 98765 41001',
    role: 'Teacher',
    department: 'Academics',
    designation: 'Lead Teacher',
    employmentType: 'Full Time',
    joinDate: '2022-06-01',
    status: 'Active',
    branch: 'Main Campus',
    gender: 'Female',
    dateOfBirth: '1992-04-18',
    reportingManager: 'Malika Thimisetty',
    shift: 'Morning',
    address: '12 Park Street, Bengaluru',
  },
  {
    id: 'st2',
    staffName: 'Rahul Mehta',
    employeeId: 'EMP-1002',
    email: 'rahul.mehta@center.edu',
    phone: '+91 98765 41002',
    role: 'Admin',
    department: 'Operations',
    designation: 'Center Admin',
    employmentType: 'Full Time',
    joinDate: '2021-03-15',
    status: 'Active',
    branch: 'Main Campus',
    gender: 'Male',
    dateOfBirth: '1988-11-02',
    reportingManager: 'Malika Thimisetty',
    shift: 'General',
    address: '45 Lake View, Bengaluru',
  },
  {
    id: 'st3',
    staffName: 'Ananya Joshi',
    employeeId: 'EMP-1003',
    email: 'ananya.joshi@center.edu',
    phone: '+91 98765 41003',
    role: 'Teacher',
    department: 'Academics',
    designation: 'Assistant Teacher',
    employmentType: 'Part Time',
    joinDate: '2024-01-08',
    status: 'Probation',
    branch: 'East Wing',
    gender: 'Female',
    dateOfBirth: '1996-07-21',
    reportingManager: 'Priya Nair',
    shift: 'Afternoon',
    address: '8 MG Road, Bengaluru',
  },
  {
    id: 'st4',
    staffName: 'David Fernandes',
    employeeId: 'EMP-1004',
    email: 'david.f@center.edu',
    phone: '+91 98765 41004',
    role: 'Support',
    department: 'Facilities',
    designation: 'Care Aide',
    employmentType: 'Full Time',
    joinDate: '2020-09-12',
    status: 'On Leave',
    branch: 'Main Campus',
    gender: 'Male',
    dateOfBirth: '1985-02-09',
    reportingManager: 'Rahul Mehta',
    shift: 'Morning',
    address: '22 Residency Road, Bengaluru',
  },
  {
    id: 'st5',
    staffName: 'Sana Khan',
    employeeId: 'EMP-1005',
    email: 'sana.khan@center.edu',
    phone: '+91 98765 41005',
    role: 'Teacher',
    department: 'Academics',
    designation: 'Nursery Teacher',
    employmentType: 'Full Time',
    joinDate: '2023-05-22',
    status: 'Active',
    branch: 'East Wing',
    gender: 'Female',
    dateOfBirth: '1994-12-30',
    reportingManager: 'Priya Nair',
    shift: 'Morning',
    address: '9 Indiranagar, Bengaluru',
  },
  {
    id: 'st6',
    staffName: 'Vikram Das',
    employeeId: 'EMP-1006',
    email: 'vikram.das@center.edu',
    phone: '+91 98765 41006',
    role: 'Finance',
    department: 'Accounts',
    designation: 'Billing Executive',
    employmentType: 'Contract',
    joinDate: '2019-08-01',
    status: 'Inactive',
    branch: 'Main Campus',
    gender: 'Male',
    dateOfBirth: '1990-01-14',
    reportingManager: 'Rahul Mehta',
    shift: 'General',
    address: '31 Koramangala, Bengaluru',
  },
  {
    id: 'st7',
    staffName: 'Emily Costa',
    employeeId: 'EMP-1007',
    email: 'emily.costa@center.edu',
    phone: '+91 98765 41007',
    role: 'Teacher',
    department: 'Academics',
    designation: 'Music Teacher',
    employmentType: 'Part Time',
    joinDate: '2022-11-10',
    status: 'Terminated',
    branch: 'Main Campus',
    gender: 'Female',
    dateOfBirth: '1991-09-05',
    reportingManager: 'Malika Thimisetty',
    shift: 'Afternoon',
    address: '17 Whitefield, Bengaluru',
  },
  {
    id: 'st8',
    staffName: 'Arjun Reddy',
    employeeId: 'EMP-1008',
    email: 'arjun.reddy@center.edu',
    phone: '+91 98765 41008',
    role: 'Security',
    department: 'Facilities',
    designation: 'Security Officer',
    employmentType: 'Full Time',
    joinDate: '2021-12-03',
    status: 'Active',
    branch: 'Main Campus',
    gender: 'Male',
    dateOfBirth: '1987-06-28',
    reportingManager: 'Rahul Mehta',
    shift: 'Night',
    address: '5 Hebbal, Bengaluru',
  },
];

export function defaultStaffReportForm(): StaffReportFormValues {
  return {
    statuses: ['Active'],
    selectedColumns: STAFF_COLUMNS.map((c) => c.id),
  };
}

export function buildStaffReportRows(values: StaffReportFormValues): Record<string, string>[] {
  const statusSet = new Set(values.statuses);
  const cols = STAFF_COLUMNS.filter((c) => values.selectedColumns.includes(c.id));

  return STAFF.filter((s) => statusSet.has(s.status)).map((s) => {
    const full: Record<StaffColumnId, string> = {
      staffName: s.staffName,
      employeeId: s.employeeId,
      email: s.email,
      phone: s.phone,
      role: s.role,
      department: s.department,
      designation: s.designation,
      employmentType: s.employmentType,
      joinDate: toDisplayDate(s.joinDate),
      status: s.status,
      branch: s.branch,
      gender: s.gender,
      dateOfBirth: toDisplayDate(s.dateOfBirth),
      reportingManager: s.reportingManager,
      shift: s.shift,
      address: s.address,
    };

    const row: Record<string, string> = {};
    cols.forEach((col) => {
      row[col.label] = full[col.id];
    });
    return row;
  });
}

export function createStaffReport(
  values: StaffReportFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = STAFF_COLUMNS.filter((c) => values.selectedColumns.includes(c.id));
  const columns = cols.map((c) => c.label);
  const rows = buildStaffReportRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return {
    id: `staff-${now.getTime()}`,
    kind: 'staff-report',
    name: `Staff_Report_${today}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: values.statuses.length ? values.statuses.join(', ') : 'No status',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
