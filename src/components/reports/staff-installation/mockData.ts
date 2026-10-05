import type { EmailTemplate, FilterValues, StaffInstallationRecord } from './types';

export const CAMPUS_OPTIONS = ['Sunrise Campus', 'Lakeside Campus', 'Oakridge Campus', 'Harbor Campus'];
export const STAFF_STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave'];

export const INSTALL_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'installed', label: 'Installed' },
  { value: 'pending', label: 'Pending' },
];

export const INVITE_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'not_sent', label: 'Not Sent' },
];

export const DEFAULT_EMAIL_TEMPLATE: EmailTemplate = {
  subject: 'You’re invited to the {{School Name}} Staff App',
  body: `Dear {{Staff Name}},

You’re invited to install the {{School Name}} Staff App.

Employee ID: {{Employee ID}}
Campus: {{Campus}}
Department: {{Department}}
Designation: {{Designation}}

Tap the link below to get started:
{{Invitation Link}}

Warm regards,
{{School Name}} Team`,
};

export const TEMPLATE_VARIABLES = [
  'Staff Name',
  'Employee ID',
  'Campus',
  'Department',
  'Designation',
  'Invitation Link',
  'School Name',
  'Current Date',
] as const;

export function defaultFilters(): FilterValues {
  return {
    staffQuery: '',
    campus: '',
    staffStatus: '',
    staffInstallationStatus: '',
    invitationStatus: '',
  };
}

export const MOCK_STAFF_INSTALLATION_RECORDS: StaffInstallationRecord[] = [
  {
    id: 's1',
    staffName: 'Ananya Mehta',
    employeeId: 'EMP-1042',
    campus: 'Sunrise Campus',
    department: 'Early Childhood',
    designation: 'Lead Teacher',
    staffStatus: 'Active',
    email: 'ananya.mehta@panacea.school',
    phone: '+1 (555) 210-4401',
    avatarInitials: 'AM',
    installationStatus: 'installed',
    invitationStatus: 'sent',
    installedOn: '2026-07-12',
    installedTime: '09:15 AM',
    lastInviteSent: '2026-07-10',
    lastInviteTime: '08:00 AM',
    inviteLink: 'https://app.panacea.school/staff-invite/ananya-mehta',
  },
  {
    id: 's2',
    staffName: 'Marcus Bell',
    employeeId: 'EMP-1108',
    campus: 'Lakeside Campus',
    department: 'Administration',
    designation: 'Campus Coordinator',
    staffStatus: 'Active',
    email: 'marcus.bell@panacea.school',
    phone: '+1 (555) 210-4412',
    avatarInitials: 'MB',
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-08-02',
    lastInviteTime: '10:30 AM',
    inviteLink: 'https://app.panacea.school/staff-invite/marcus-bell',
  },
  {
    id: 's3',
    staffName: 'Priya Nair',
    employeeId: 'EMP-0988',
    campus: 'Oakridge Campus',
    department: 'Health & Safety',
    designation: 'Nurse',
    staffStatus: 'Active',
    email: 'priya.nair@panacea.school',
    phone: '+1 (555) 210-4420',
    avatarInitials: 'PN',
    installationStatus: 'installed',
    invitationStatus: 'sent',
    installedOn: '2026-06-18',
    installedTime: '02:40 PM',
    lastInviteSent: '2026-06-15',
    lastInviteTime: '11:00 AM',
    inviteLink: 'https://app.panacea.school/staff-invite/priya-nair',
  },
  {
    id: 's4',
    staffName: 'James Okonkwo',
    employeeId: 'EMP-1215',
    campus: 'Harbor Campus',
    department: 'Kitchen',
    designation: 'Chef',
    staffStatus: 'Active',
    email: 'james.okonkwo@panacea.school',
    avatarInitials: 'JO',
    installationStatus: 'pending',
    invitationStatus: 'not_sent',
  },
  {
    id: 's5',
    staffName: 'Sofia Alvarez',
    employeeId: 'EMP-0876',
    campus: 'Sunrise Campus',
    department: 'Early Childhood',
    designation: 'Assistant Teacher',
    staffStatus: 'On Leave',
    email: 'sofia.alvarez@panacea.school',
    phone: '+1 (555) 210-4433',
    avatarInitials: 'SA',
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-05-20',
    lastInviteTime: '03:15 PM',
    inviteLink: 'https://app.panacea.school/staff-invite/sofia-alvarez',
  },
  {
    id: 's6',
    staffName: 'Daniel Cho',
    employeeId: 'EMP-1150',
    campus: 'Lakeside Campus',
    department: 'IT & Operations',
    designation: 'Systems Admin',
    staffStatus: 'Active',
    email: 'daniel.cho@panacea.school',
    phone: '+1 (555) 210-4444',
    avatarInitials: 'DC',
    installationStatus: 'installed',
    invitationStatus: 'sent',
    installedOn: '2026-08-01',
    installedTime: '07:55 AM',
    lastInviteSent: '2026-07-30',
    lastInviteTime: '09:00 AM',
    inviteLink: 'https://app.panacea.school/staff-invite/daniel-cho',
  },
  {
    id: 's7',
    staffName: 'Helen Wright',
    employeeId: 'EMP-0765',
    campus: 'Harbor Campus',
    department: 'Administration',
    designation: 'HR Specialist',
    staffStatus: 'Inactive',
    email: 'helen.wright@panacea.school',
    avatarInitials: 'HW',
    installationStatus: 'pending',
    invitationStatus: 'not_sent',
  },
  {
    id: 's8',
    staffName: 'Ravi Krishnan',
    employeeId: 'EMP-1302',
    campus: 'Oakridge Campus',
    department: 'Facilities',
    designation: 'Maintenance Lead',
    staffStatus: 'Active',
    email: 'ravi.krishnan@panacea.school',
    phone: '+1 (555) 210-4455',
    avatarInitials: 'RK',
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-08-04',
    lastInviteTime: '01:20 PM',
    inviteLink: 'https://app.panacea.school/staff-invite/ravi-krishnan',
  },
];

export function computeSummary(records: StaffInstallationRecord[]) {
  const installed = records.filter((r) => r.installationStatus === 'installed').length;
  const pending = records.filter((r) => r.installationStatus === 'pending').length;
  const invitationsSent = records.filter((r) => r.invitationStatus === 'sent').length;
  const invitationsNotSent = records.filter((r) => r.invitationStatus === 'not_sent').length;
  const installRate = records.length ? Math.round((installed / records.length) * 100) : 0;
  return { installed, pending, invitationsSent, invitationsNotSent, installRate, total: records.length };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function filterRecords(records: StaffInstallationRecord[], filters: FilterValues) {
  const q = filters.staffQuery.trim().toLowerCase();
  return records.filter((r) => {
    if (q && !`${r.staffName} ${r.employeeId}`.toLowerCase().includes(q)) return false;
    if (filters.campus && r.campus !== filters.campus) return false;
    if (filters.staffStatus && r.staffStatus !== filters.staffStatus) return false;
    if (filters.staffInstallationStatus && r.installationStatus !== filters.staffInstallationStatus) {
      return false;
    }
    if (filters.invitationStatus && r.invitationStatus !== filters.invitationStatus) return false;
    return true;
  });
}

/** Frontend-only duplicate check against existing staff emails (excluding current row). */
export function isDuplicateEmail(
  email: string,
  records: StaffInstallationRecord[],
  excludeId?: string,
) {
  const normalized = email.trim().toLowerCase();
  return records.some((r) => r.id !== excludeId && r.email.trim().toLowerCase() === normalized);
}
