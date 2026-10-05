import type { EmailTemplate, FilterValues, InstallationRecord } from './types';

export const CAMPUS_OPTIONS = ['Sunrise Campus', 'Lakeside Campus', 'Oakridge Campus', 'Harbor Campus'];
export const STUDENT_STATUS_OPTIONS = ['Active', 'Inactive', 'On Leave'];

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
  subject: 'You’re invited to the {{School Name}} Parent App',
  body: `Dear {{Parent Name}},

You’re invited to install the {{School Name}} Parent App for {{Student Name}}.

Campus: {{Campus}}
Program: {{Program}}

Tap the link below to get started:
{{Invitation Link}}

Warm regards,
{{School Name}} Team`,
};

export const TEMPLATE_VARIABLES = [
  'Student Name',
  'Parent Name',
  'Campus',
  'Program',
  'Invitation Link',
  'School Name',
  'Current Date',
] as const;

export function defaultFilters(): FilterValues {
  return {
    studentQuery: '',
    campus: '',
    studentStatus: '',
    parentInstallationStatus: '',
    invitationStatus: '',
  };
}

export const MOCK_INSTALLATION_RECORDS: InstallationRecord[] = [
  {
    id: 'r1',
    studentName: 'Aarav Sharma',
    admissionNumber: 'ADM-24018',
    campus: 'Sunrise Campus',
    program: 'Preschool',
    studentStatus: 'Active',
    avatarInitials: 'AS',
    mother: { id: 'm1', name: 'Priya Sharma', email: 'priya.sharma@email.com' },
    father: { id: 'f1', name: 'Rohan Sharma', email: 'rohan.sharma@email.com' },
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-08-01',
    lastInviteTime: '08:00 AM',
    inviteLink: 'https://app.panacea.school/invite/aarav-sharma',
  },
  {
    id: 'r2',
    studentName: 'Mia Chen',
    admissionNumber: 'ADM-24042',
    campus: 'Lakeside Campus',
    program: 'Toddler',
    studentStatus: 'Active',
    avatarInitials: 'MC',
    mother: { id: 'm2', name: 'Lisa Chen', email: 'lisa.chen@email.com' },
    father: { id: 'f2', name: 'David Chen', email: 'david.chen@email.com' },
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-08-03',
    lastInviteTime: '09:00 AM',
    inviteLink: 'https://app.panacea.school/invite/mia-chen',
  },
  {
    id: 'r3',
    studentName: 'Noah Patel',
    admissionNumber: 'ADM-23991',
    campus: 'Oakridge Campus',
    program: 'Kindergarten',
    studentStatus: 'Active',
    avatarInitials: 'NP',
    mother: { id: 'm3', name: 'Anika Patel', email: 'anika.patel@email.com' },
    father: { id: 'f3', name: 'Karan Patel', email: 'karan.patel@email.com' },
    installationStatus: 'installed',
    invitationStatus: 'sent',
    installedOn: '2026-06-22',
    installedTime: '08:40 AM',
    lastInviteSent: '2026-06-20',
    lastInviteTime: '11:00 AM',
    inviteLink: 'https://app.panacea.school/invite/noah-patel',
  },
  {
    id: 'r4',
    studentName: 'Emma Wilson',
    admissionNumber: 'ADM-24110',
    campus: 'Harbor Campus',
    program: 'After School',
    studentStatus: 'Active',
    avatarInitials: 'EW',
    mother: { id: 'm4', name: 'Sarah Wilson', email: 'sarah.wilson@email.com' },
    father: { id: 'f4', name: 'James Wilson', email: 'james.wilson@email.com' },
    installationStatus: 'pending',
    invitationStatus: 'not_sent',
  },
  {
    id: 'r5',
    studentName: 'Omar Hassan',
    admissionNumber: 'ADM-23880',
    campus: 'Sunrise Campus',
    program: 'Preschool',
    studentStatus: 'On Leave',
    avatarInitials: 'OH',
    mother: { id: 'm5', name: 'Fatima Hassan', email: 'fatima.hassan@email.com' },
    father: { id: 'f5', name: 'Yusuf Hassan', email: 'yusuf.hassan@email.com' },
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-05-10',
    lastInviteTime: '02:00 PM',
    inviteLink: 'https://app.panacea.school/invite/omar-hassan',
  },
  {
    id: 'r6',
    studentName: 'Sofia Rivera',
    admissionNumber: 'ADM-24155',
    campus: 'Lakeside Campus',
    program: 'Toddler',
    studentStatus: 'Active',
    avatarInitials: 'SR',
    mother: { id: 'm6', name: 'Elena Rivera', email: 'elena.rivera@email.com' },
    father: { id: 'f6', name: 'Carlos Rivera', email: 'carlos.rivera@email.com' },
    installationStatus: 'pending',
    invitationStatus: 'sent',
    lastInviteSent: '2026-08-05',
    lastInviteTime: '08:30 AM',
    inviteLink: 'https://app.panacea.school/invite/sofia-rivera',
  },
  {
    id: 'r7',
    studentName: 'Leo Kim',
    admissionNumber: 'ADM-23770',
    campus: 'Harbor Campus',
    program: 'Kindergarten',
    studentStatus: 'Inactive',
    avatarInitials: 'LK',
    mother: { id: 'm7', name: 'Hana Kim', email: 'hana.kim@email.com' },
    father: { id: 'f7', name: 'Minho Kim', email: 'minho.kim@email.com' },
    installationStatus: 'pending',
    invitationStatus: 'not_sent',
  },
  {
    id: 'r8',
    studentName: 'Isla Thompson',
    admissionNumber: 'ADM-24201',
    campus: 'Oakridge Campus',
    program: 'Preschool',
    studentStatus: 'Active',
    avatarInitials: 'IT',
    mother: { id: 'm8', name: 'Grace Thompson', email: 'grace.thompson@email.com' },
    father: { id: 'f8', name: 'Oliver Thompson', email: 'oliver.thompson@email.com' },
    installationStatus: 'installed',
    invitationStatus: 'sent',
    installedOn: '2026-07-29',
    installedTime: '06:18 PM',
    lastInviteSent: '2026-07-28',
    lastInviteTime: '09:00 AM',
    inviteLink: 'https://app.panacea.school/invite/isla-thompson',
  },
];

export function computeSummary(records: InstallationRecord[]) {
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

export function filterRecords(records: InstallationRecord[], filters: FilterValues) {
  const sq = filters.studentQuery.trim().toLowerCase();
  return records.filter((r) => {
    if (sq && !`${r.studentName} ${r.admissionNumber}`.toLowerCase().includes(sq)) return false;
    if (filters.campus && r.campus !== filters.campus) return false;
    if (filters.studentStatus && r.studentStatus !== filters.studentStatus) return false;
    if (filters.parentInstallationStatus && r.installationStatus !== filters.parentInstallationStatus) {
      return false;
    }
    if (filters.invitationStatus && r.invitationStatus !== filters.invitationStatus) return false;
    return true;
  });
}
