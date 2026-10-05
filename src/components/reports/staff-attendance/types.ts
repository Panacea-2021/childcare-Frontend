import type { FilterBy } from '@/components/reports/attendance-summary/types';
import { CURRENT_USER } from '@/components/reports/attendance-summary/types';

export type StaffFilterBy = Extract<FilterBy, 'department' | 'staff'>;

export type StaffMemberStatus = 'Active' | 'Inactive' | 'On Leave' | 'Probation' | 'Terminated';

export type AttendanceDayStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';

export type MockStaff = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  shift: string;
  branch: string;
  status: StaffMemberStatus;
  initials: string;
  tone: 'lavender' | 'mint' | 'blush' | 'beige';
};

export type StaffAttendanceBaseForm = {
  startDate: string;
  endDate: string;
  filterBy: StaffFilterBy;
  departments: string[];
  staffId: string | null;
};

export const STAFF_DEPARTMENTS = [
  'Academics',
  'Operations',
  'Facilities',
  'Accounts',
  'Administration',
] as const;

export const STAFF_MEMBER_STATUSES: StaffMemberStatus[] = [
  'Active',
  'Inactive',
  'On Leave',
  'Probation',
  'Terminated',
];

export const MOCK_STAFF: MockStaff[] = [
  {
    id: 'st1',
    name: 'Priya Nair',
    employeeId: 'EMP-1001',
    department: 'Academics',
    role: 'Lead Teacher',
    shift: 'Morning',
    branch: 'Main Campus',
    status: 'Active',
    initials: 'PN',
    tone: 'lavender',
  },
  {
    id: 'st2',
    name: 'Rahul Mehta',
    employeeId: 'EMP-1002',
    department: 'Operations',
    role: 'Center Admin',
    shift: 'General',
    branch: 'Main Campus',
    status: 'Active',
    initials: 'RM',
    tone: 'mint',
  },
  {
    id: 'st3',
    name: 'Ananya Joshi',
    employeeId: 'EMP-1003',
    department: 'Academics',
    role: 'Assistant Teacher',
    shift: 'Afternoon',
    branch: 'East Wing',
    status: 'Probation',
    initials: 'AJ',
    tone: 'blush',
  },
  {
    id: 'st4',
    name: 'David Fernandes',
    employeeId: 'EMP-1004',
    department: 'Facilities',
    role: 'Care Aide',
    shift: 'Morning',
    branch: 'Main Campus',
    status: 'On Leave',
    initials: 'DF',
    tone: 'beige',
  },
  {
    id: 'st5',
    name: 'Sana Khan',
    employeeId: 'EMP-1005',
    department: 'Academics',
    role: 'Nursery Teacher',
    shift: 'Morning',
    branch: 'East Wing',
    status: 'Active',
    initials: 'SK',
    tone: 'lavender',
  },
  {
    id: 'st6',
    name: 'Vikram Das',
    employeeId: 'EMP-1006',
    department: 'Accounts',
    role: 'Billing Executive',
    shift: 'General',
    branch: 'Main Campus',
    status: 'Inactive',
    initials: 'VD',
    tone: 'mint',
  },
  {
    id: 'st7',
    name: 'Emily Costa',
    employeeId: 'EMP-1007',
    department: 'Academics',
    role: 'Music Teacher',
    shift: 'Afternoon',
    branch: 'Main Campus',
    status: 'Terminated',
    initials: 'EC',
    tone: 'blush',
  },
  {
    id: 'st8',
    name: 'Arjun Reddy',
    employeeId: 'EMP-1008',
    department: 'Facilities',
    role: 'Security Officer',
    shift: 'Night',
    branch: 'Main Campus',
    status: 'Active',
    initials: 'AR',
    tone: 'beige',
  },
  {
    id: 'st9',
    name: 'Neha Kapoor',
    employeeId: 'EMP-1009',
    department: 'Administration',
    role: 'HR Coordinator',
    shift: 'General',
    branch: 'Main Campus',
    status: 'Active',
    initials: 'NK',
    tone: 'lavender',
  },
  {
    id: 'st10',
    name: 'Omar Siddiqui',
    employeeId: 'EMP-1010',
    department: 'Operations',
    role: 'Front Desk',
    shift: 'Morning',
    branch: 'East Wing',
    status: 'Active',
    initials: 'OS',
    tone: 'mint',
  },
];

export const STAFF_ATTENDANCE_LAST_GENERATED = {
  dateLabel: '03/08/2026',
  timeLabel: '10:22 AM',
  by: CURRENT_USER,
};

export { CURRENT_USER };

export function defaultStaffDateRange() {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
  };
}
