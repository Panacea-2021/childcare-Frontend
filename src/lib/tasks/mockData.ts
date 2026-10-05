import type { TaskPriority, TaskRecord, TaskStatus } from './types';

export type StaffMember = {
  id: string;
  name: string;
  department: string;
  initials: string;
};

export type LabelOption = {
  id: string;
  name: string;
  color: string;
};

export const STAFF: StaffMember[] = [
  { id: 's1', name: 'Darshan', department: 'Admissions', initials: 'DA' },
  { id: 's2', name: 'Priya Nair', department: 'Campus Tours', initials: 'PN' },
  { id: 's3', name: 'Ananya Rao', department: 'Enrolment', initials: 'AR' },
  { id: 's4', name: 'Vikram Shah', department: 'Admissions', initials: 'VS' },
  { id: 's5', name: 'Meera Iyer', department: 'Family Experience', initials: 'MI' },
  { id: 's6', name: 'Malika Thimisetty', department: 'Admissions', initials: 'MT' },
  { id: 's7', name: 'Organization Admin', department: 'Admin', initials: 'OA' },
];

export const DEFAULT_TASK_TYPES = [
  'Call',
  'Follow Up',
  'Meeting',
  'Documentation',
  'Verification',
  'Reminder',
  'Other',
];

export const DEFAULT_LABELS: LabelOption[] = [
  { id: 'lb1', name: 'Admissions', color: '#5D5FEF' },
  { id: 'lb2', name: 'Finance', color: '#0F9F6E' },
  { id: 'lb3', name: 'Marketing', color: '#DB2777' },
  { id: 'lb4', name: 'Support', color: '#0284C7' },
  { id: 'lb5', name: 'Urgent', color: '#E53935' },
  { id: 'lb6', name: 'HR', color: '#7C3AED' },
  { id: 'lb7', name: 'Follow Up', color: '#C27803' },
  { id: 'lb8', name: 'Others', color: '#64748B' },
];

function isoOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function stamp(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAgo);
  return d.toISOString();
}

function activity(text: string, daysAgo: number) {
  return { id: `act-${Math.random().toString(36).slice(2, 8)}`, text, at: stamp(daysAgo) };
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function departmentOf(name: string): string {
  return STAFF.find((s) => s.name === name)?.department ?? 'General';
}

export function labelColorOf(name: string, labels: LabelOption[] = DEFAULT_LABELS): string {
  return labels.find((l) => l.name === name)?.color ?? '#5D5FEF';
}

/** Shared mock students used by Tasks → Student Profile navigation. */
export const TASK_STUDENTS = [
  { id: 'stu-aarav', name: 'Aarav Sharma' },
  { id: 'stu-diya', name: 'Diya Kapoor' },
  { id: 'stu-rohan', name: 'Rohan Desai' },
  { id: 'stu-isha', name: 'Isha Nair' },
  { id: 'stu-kabir', name: 'Kabir Banerjee' },
  { id: 'stu-mia', name: 'Mia Fernandes' },
  { id: 'stu-anika', name: 'Anika Mehta' },
  { id: 'stu-vihaan', name: 'Vihaan Patel' },
] as const;

export const SEED_TASKS: TaskRecord[] = [
  {
    id: 'task-1',
    name: 'Call parent about tour feedback',
    studentId: 'stu-aarav',
    studentName: 'Aarav Sharma',
    assignedTo: 'Darshan',
    assignedBy: 'Organization Admin',
    department: 'Admissions',
    dueDate: isoOffset(1),
    dueTime: '10:30',
    priority: 'High',
    type: 'Call',
    label: 'Admissions',
    labelColor: '#5D5FEF',
    status: 'In Progress',
    description: 'Follow up with family after the campus tour. Confirm interest in Pre-K Prep.',
    createdAt: stamp(-3),
    updatedAt: stamp(-1),
    activity: [
      activity('Task created', -3),
      activity('Assigned to Darshan', -3),
      activity('Status set to In Progress', -3),
    ],
  },
  {
    id: 'task-2',
    name: 'Collect birth certificate',
    studentId: 'stu-diya',
    studentName: 'Diya Kapoor',
    assignedTo: 'Darshan',
    assignedBy: 'Priya Nair',
    department: 'Admissions',
    dueDate: isoOffset(-1),
    priority: 'Urgent',
    type: 'Documentation',
    label: 'Urgent',
    labelColor: '#E53935',
    status: 'In Progress',
    description: 'Parent promised documents by yesterday. Send reminder SMS if still pending.',
    createdAt: stamp(-8),
    updatedAt: stamp(-1),
    activity: [
      activity('Task created', -8),
      activity('Moved to In Progress', -1),
    ],
  },
  {
    id: 'task-3',
    name: 'Schedule admission discussion',
    studentId: 'stu-rohan',
    studentName: 'Rohan Desai',
    assignedTo: 'Darshan',
    assignedBy: 'Organization Admin',
    department: 'Admissions',
    dueDate: isoOffset(2),
    dueTime: '15:00',
    priority: 'Medium',
    type: 'Meeting',
    label: 'Admissions',
    labelColor: '#5D5FEF',
    status: 'In Progress',
    description: 'Coordinate with faculty and family for a 30-minute admission slot.',
    createdAt: stamp(-2),
    updatedAt: stamp(0),
    activity: [
      activity('Task created', -2),
      activity('Moved to In Progress', 0),
    ],
  },
  {
    id: 'task-4',
    name: 'Send fee breakdown PDF',
    studentId: 'stu-isha',
    studentName: 'Isha Nair',
    assignedTo: 'Priya Nair',
    assignedBy: 'Darshan',
    department: 'Campus Tours',
    dueDate: isoOffset(0),
    priority: 'High',
    type: 'Follow Up',
    label: 'Finance',
    labelColor: '#0F9F6E',
    status: 'In Progress',
    description: 'Attach academic year fee sheet and sibling discount note.',
    createdAt: stamp(-1),
    updatedAt: stamp(-1),
    activity: [activity('Task created', -1)],
  },
  {
    id: 'task-5',
    name: 'Verify enquiry form fields',
    studentId: 'stu-kabir',
    studentName: 'Kabir Banerjee',
    assignedTo: 'Ananya Rao',
    assignedBy: 'Organization Admin',
    department: 'Enrolment',
    dueDate: isoOffset(3),
    priority: 'Low',
    type: 'Verification',
    label: 'Support',
    labelColor: '#0284C7',
    status: 'In Progress',
    description: 'Ensure custom fields from Facebook lead map correctly.',
    createdAt: stamp(-4),
    updatedAt: stamp(-4),
    activity: [activity('Task created', -4)],
  },
  {
    id: 'task-6',
    name: 'Prepare open-house checklist',
    studentId: 'stu-mia',
    studentName: 'Mia Fernandes',
    assignedTo: 'Meera Iyer',
    assignedBy: 'Organization Admin',
    department: 'Family Experience',
    dueDate: isoOffset(5),
    priority: 'Medium',
    type: 'Reminder',
    label: 'Marketing',
    labelColor: '#DB2777',
    status: 'In Progress',
    description: 'Rooms, refreshments, demo kits, and staff roles.',
    createdAt: stamp(-5),
    updatedAt: stamp(-2),
    activity: [
      activity('Task created', -5),
      activity('Checklist draft attached (placeholder)', -2),
    ],
  },
  {
    id: 'task-7',
    name: 'Mark enrolment form complete',
    studentId: 'stu-anika',
    studentName: 'Anika Mehta',
    assignedTo: 'Vikram Shah',
    assignedBy: 'Darshan',
    department: 'Admissions',
    dueDate: isoOffset(-2),
    priority: 'Medium',
    type: 'Documentation',
    label: 'Admissions',
    labelColor: '#5D5FEF',
    status: 'Completed',
    description: 'All documents verified and uploaded.',
    createdAt: stamp(-10),
    updatedAt: stamp(-2),
    activity: [
      activity('Task created', -10),
      activity('Marked Completed', -2),
    ],
  },
  {
    id: 'task-8',
    name: 'Cancel duplicate follow-up',
    studentId: 'stu-vihaan',
    studentName: 'Vihaan Patel',
    assignedTo: 'Malika Thimisetty',
    assignedBy: 'Priya Nair',
    department: 'Admissions',
    dueDate: isoOffset(1),
    priority: 'Low',
    type: 'Other',
    label: 'Others',
    labelColor: '#64748B',
    status: 'Cancelled',
    cancelReason: 'Duplicate of fee breakdown task — family already received the PDF.',
    description: 'Duplicate of task-4; cancelled to avoid double outreach.',
    createdAt: stamp(-6),
    updatedAt: stamp(-5),
    activity: [
      activity('Task created', -6),
      activity('Cancelled as duplicate', -5),
    ],
  },
  {
    id: 'task-9',
    name: 'HR onboarding packet review',
    assignedTo: 'Darshan',
    assignedBy: 'Organization Admin',
    department: 'Admissions',
    dueDate: isoOffset(4),
    priority: 'Low',
    type: 'Documentation',
    label: 'HR',
    labelColor: '#7C3AED',
    status: 'In Progress',
    description: 'Review staff onboarding checklist for new tour guides.',
    createdAt: stamp(-1),
    updatedAt: stamp(-1),
    activity: [activity('Task created', -1)],
  },
  {
    id: 'task-10',
    name: 'WhatsApp reminder for trial class',
    studentId: 'stu-aarav',
    studentName: 'Aarav Sharma',
    assignedTo: 'Priya Nair',
    assignedBy: 'Meera Iyer',
    department: 'Campus Tours',
    dueDate: isoOffset(2),
    dueTime: '09:00',
    priority: 'Urgent',
    type: 'Reminder',
    label: 'Follow Up',
    labelColor: '#C27803',
    status: 'In Progress',
    description: 'Send template message morning of the trial class.',
    createdAt: stamp(-2),
    updatedAt: stamp(-2),
    activity: [activity('Task created', -2)],
  },
  {
    id: 'task-11',
    name: 'Finance clearance for scholarship',
    studentId: 'stu-diya',
    studentName: 'Diya Kapoor',
    assignedTo: 'Darshan',
    assignedBy: 'Vikram Shah',
    department: 'Admissions',
    dueDate: isoOffset(6),
    priority: 'High',
    type: 'Verification',
    label: 'Finance',
    labelColor: '#0F9F6E',
    status: 'Completed',
    description: 'Confirm scholarship eligibility before offer letter.',
    createdAt: stamp(-3),
    updatedAt: stamp(0),
    activity: [
      activity('Task created', -3),
      activity('Status → Completed', 0),
    ],
  },
  {
    id: 'task-12',
    name: 'Marketing creative approval',
    assignedTo: 'Ananya Rao',
    assignedBy: 'Organization Admin',
    department: 'Enrolment',
    dueDate: isoOffset(7),
    priority: 'Medium',
    type: 'Meeting',
    label: 'Marketing',
    labelColor: '#DB2777',
    status: 'In Progress',
    description: 'Review open-house banner and social posts.',
    createdAt: stamp(-1),
    updatedAt: stamp(-1),
    activity: [activity('Task created', -1)],
  },
  {
    id: 'task-13',
    name: 'Reschedule parent call',
    studentId: 'stu-aarav',
    studentName: 'Aarav Sharma',
    assignedTo: 'Darshan',
    assignedBy: 'Priya Nair',
    department: 'Admissions',
    dueDate: isoOffset(1),
    priority: 'Medium',
    type: 'Call',
    label: 'Follow Up',
    labelColor: '#C27803',
    status: 'Cancelled',
    cancelReason: 'Parent requested callback next week after travel.',
    description: 'Original slot no longer works for the family.',
    createdAt: stamp(-2),
    updatedAt: stamp(-1),
    activity: [
      activity('Task created', -2),
      activity('Cancelled with reason', -1),
    ],
  },
];

export const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
export const STATUSES: TaskStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
  'Overdue',
  'Cancelled',
];

export const STATUS_COLORS: Record<TaskStatus, { bg: string; fg: string }> = {
  Pending: { bg: '#FEF3C7', fg: '#B45309' },
  'In Progress': { bg: '#E0E7FF', fg: '#4338CA' },
  Completed: { bg: '#D1FAE5', fg: '#047857' },
  Overdue: { bg: '#FEE2E2', fg: '#B91C1C' },
  Cancelled: { bg: '#F1F5F9', fg: '#64748B' },
};

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; fg: string }> = {
  Low: { bg: '#F1F5F9', fg: '#64748B' },
  Medium: { bg: '#E0F2FE', fg: '#0369A1' },
  High: { bg: '#FFEDD5', fg: '#C2410C' },
  Urgent: { bg: '#FEE2E2', fg: '#B91C1C' },
};
