import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type ActivityColumnMode = 'all' | 'custom';

export type ActivityColumnId =
  | 'studentName'
  | 'branch'
  | 'leadStatus'
  | 'activityDate'
  | 'activityType'
  | 'activityNote'
  | 'assignedTo'
  | 'enquiryId'
  | 'source'
  | 'interestProgram'
  | 'parentOneName'
  | 'parentOnePhone'
  | 'parentOneEmail'
  | 'parentTwoName'
  | 'parentTwoPhone'
  | 'parentTwoEmail'
  | 'followUpDate'
  | 'createdBy'
  | 'nextAction'
  | 'callOutcome'
  | 'priority'
  | 'center'
  | 'stage'
  | 'updatedAt'
  | 'channel';

export const ACTIVITY_COLUMNS: { id: ActivityColumnId; label: string }[] = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'branch', label: 'Branch' },
  { id: 'leadStatus', label: 'Lead Status' },
  { id: 'activityDate', label: 'Activity Date' },
  { id: 'activityType', label: 'Activity Type' },
  { id: 'activityNote', label: 'Activity Note' },
  { id: 'assignedTo', label: 'Assigned To' },
  { id: 'enquiryId', label: 'Enquiry Id' },
  { id: 'source', label: 'Source' },
  { id: 'interestProgram', label: 'Interest Program' },
  { id: 'parentOneName', label: 'Parent One Name' },
  { id: 'parentOnePhone', label: 'Parent One Phone' },
  { id: 'parentOneEmail', label: 'Parent One Email' },
  { id: 'parentTwoName', label: 'Parent Two Name' },
  { id: 'parentTwoPhone', label: 'Parent Two Phone' },
  { id: 'parentTwoEmail', label: 'Parent Two Email' },
  { id: 'followUpDate', label: 'Follow-up Date' },
  { id: 'createdBy', label: 'Created By' },
  { id: 'nextAction', label: 'Next Action' },
  { id: 'callOutcome', label: 'Call Outcome' },
  { id: 'priority', label: 'Priority' },
  { id: 'center', label: 'Center' },
  { id: 'stage', label: 'Stage' },
  { id: 'updatedAt', label: 'Updated At' },
  { id: 'channel', label: 'Channel' },
];

export const ACTIVITY_BRANCHES = ['Main Campus', 'East Wing', 'West Annex'] as const;
export const ACTIVITY_LEAD_STATUSES = [
  'New',
  'Contacted',
  'Tour Booked',
  'Follow-up',
  'Closed',
  'Lost',
] as const;
export const ACTIVITY_TYPES = [
  'Call',
  'Email',
  'WhatsApp',
  'Tour',
  'Note',
  'Status Change',
  'Assignment',
] as const;
export const ACTIVITY_ASSIGNEES = [
  'Malika Thimisetty',
  'Priya Nair',
  'Rahul Mehta',
  'Front Desk',
] as const;

export type ActivityBranch = (typeof ACTIVITY_BRANCHES)[number];
export type ActivityLeadStatus = (typeof ACTIVITY_LEAD_STATUSES)[number];
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export type EnquiryActivityFormValues = {
  startDate: string;
  endDate: string;
  branches: string[];
  leadStatuses: ActivityLeadStatus[];
  activityTypes: ActivityType[];
  assignees: string[];
  columnMode: ActivityColumnMode;
  selectedColumns: ActivityColumnId[];
};

type ActivitySeed = {
  studentName: string;
  branch: ActivityBranch;
  leadStatus: ActivityLeadStatus;
  activityDate: string;
  activityType: ActivityType;
  activityNote: string;
  assignedTo: string;
  enquiryId: string;
  source: string;
  interestProgram: string;
  parentOneName: string;
  parentOnePhone: string;
  parentOneEmail: string;
  parentTwoName: string;
  parentTwoPhone: string;
  parentTwoEmail: string;
  followUpDate: string;
  createdBy: string;
  nextAction: string;
  callOutcome: string;
  priority: string;
  center: string;
  stage: string;
  updatedAt: string;
  channel: string;
};

const SEED: ActivitySeed[] = [
  {
    studentName: 'Aanya Kapoor',
    branch: 'Main Campus',
    leadStatus: 'New',
    activityDate: '2026-07-29',
    activityType: 'Call',
    activityNote: 'Introductory call; interested in morning batch.',
    assignedTo: 'Malika Thimisetty',
    enquiryId: 'ENQ-2401',
    source: 'Website',
    interestProgram: 'Pre-K Prep',
    parentOneName: 'Sneha Kapoor',
    parentOnePhone: '+91 98765 22001',
    parentOneEmail: 'sneha.kapoor@email.com',
    parentTwoName: 'Amit Kapoor',
    parentTwoPhone: '+91 98765 22011',
    parentTwoEmail: 'amit.kapoor@email.com',
    followUpDate: '2026-08-02',
    createdBy: 'Front Desk',
    nextAction: 'Send brochure',
    callOutcome: 'Connected',
    priority: 'High',
    center: 'CTR-001',
    stage: 'New',
    updatedAt: '2026-07-29',
    channel: 'Phone',
  },
  {
    studentName: 'Rohan Desai',
    branch: 'Main Campus',
    leadStatus: 'Contacted',
    activityDate: '2026-07-30',
    activityType: 'Email',
    activityNote: 'Shared fee plan and tour slots.',
    assignedTo: 'Priya Nair',
    enquiryId: 'ENQ-2402',
    source: 'Referral',
    interestProgram: 'Little Learners',
    parentOneName: 'Vikram Desai',
    parentOnePhone: '+91 98765 22002',
    parentOneEmail: 'vikram.desai@email.com',
    parentTwoName: 'Ananya Desai',
    parentTwoPhone: '+91 98765 22012',
    parentTwoEmail: 'ananya.desai@email.com',
    followUpDate: '2026-08-01',
    createdBy: 'Priya Nair',
    nextAction: 'Schedule tour',
    callOutcome: '—',
    priority: 'Medium',
    center: 'CTR-001',
    stage: 'Contacted',
    updatedAt: '2026-07-30',
    channel: 'Email',
  },
  {
    studentName: 'Ishaan Banerjee',
    branch: 'East Wing',
    leadStatus: 'Tour Booked',
    activityDate: '2026-07-28',
    activityType: 'Tour',
    activityNote: 'Tour confirmed for infant care wing.',
    assignedTo: 'Rahul Mehta',
    enquiryId: 'ENQ-2403',
    source: 'Walk-in',
    interestProgram: 'Nest Room',
    parentOneName: 'Leena Banerjee',
    parentOnePhone: '+91 98765 22003',
    parentOneEmail: 'leena.b@email.com',
    parentTwoName: '—',
    parentTwoPhone: '—',
    parentTwoEmail: '—',
    followUpDate: '2026-07-31',
    createdBy: 'Front Desk',
    nextAction: 'Confirm attendance',
    callOutcome: '—',
    priority: 'High',
    center: 'CTR-002',
    stage: 'Tour Booked',
    updatedAt: '2026-07-28',
    channel: 'In-person',
  },
  {
    studentName: 'Kiara Mehta',
    branch: 'Main Campus',
    leadStatus: 'Closed',
    activityDate: '2026-07-27',
    activityType: 'Status Change',
    activityNote: 'Converted to enrollment after tour.',
    assignedTo: 'Front Desk',
    enquiryId: 'ENQ-2404',
    source: 'Instagram',
    interestProgram: 'Weekend Play Club',
    parentOneName: 'Arjun Mehta',
    parentOnePhone: '+91 98765 22004',
    parentOneEmail: 'arjun.mehta@email.com',
    parentTwoName: 'Ritu Mehta',
    parentTwoPhone: '+91 98765 22014',
    parentTwoEmail: 'ritu.mehta@email.com',
    followUpDate: '2026-07-28',
    createdBy: 'Front Desk',
    nextAction: 'Start onboarding',
    callOutcome: '—',
    priority: 'Low',
    center: 'CTR-001',
    stage: 'Closed',
    updatedAt: '2026-07-28',
    channel: 'System',
  },
  {
    studentName: 'Dev Reddy',
    branch: 'East Wing',
    leadStatus: 'Lost',
    activityDate: '2026-07-26',
    activityType: 'Note',
    activityNote: 'Family chose a closer center.',
    assignedTo: 'Malika Thimisetty',
    enquiryId: 'ENQ-2405',
    source: 'WhatsApp',
    interestProgram: 'Early Explorers',
    parentOneName: 'Nisha Reddy',
    parentOnePhone: '+91 98765 22005',
    parentOneEmail: 'nisha.reddy@email.com',
    parentTwoName: 'Karan Reddy',
    parentTwoPhone: '+91 98765 22015',
    parentTwoEmail: 'karan.reddy@email.com',
    followUpDate: '2026-07-26',
    createdBy: 'Front Desk',
    nextAction: 'Archive',
    callOutcome: 'No answer',
    priority: 'Medium',
    center: 'CTR-002',
    stage: 'Lost',
    updatedAt: '2026-07-26',
    channel: 'WhatsApp',
  },
  {
    studentName: 'Zoya Ali',
    branch: 'Main Campus',
    leadStatus: 'Follow-up',
    activityDate: '2026-07-31',
    activityType: 'WhatsApp',
    activityNote: 'Sent comparison sheet for fee plans.',
    assignedTo: 'Priya Nair',
    enquiryId: 'ENQ-2406',
    source: 'Campaign',
    interestProgram: 'Pre-K Prep',
    parentOneName: 'Farhan Ali',
    parentOnePhone: '+91 98765 22006',
    parentOneEmail: 'farhan.ali@email.com',
    parentTwoName: 'Sara Ali',
    parentTwoPhone: '+91 98765 22016',
    parentTwoEmail: 'sara.ali@email.com',
    followUpDate: '2026-08-04',
    createdBy: 'Priya Nair',
    nextAction: 'Callback Friday',
    callOutcome: '—',
    priority: 'High',
    center: 'CTR-001',
    stage: 'Contacted',
    updatedAt: '2026-07-31',
    channel: 'WhatsApp',
  },
  {
    studentName: 'Aditi Iyer',
    branch: 'Main Campus',
    leadStatus: 'New',
    activityDate: '2026-08-01',
    activityType: 'Assignment',
    activityNote: 'Assigned to Rahul for first outreach.',
    assignedTo: 'Rahul Mehta',
    enquiryId: 'ENQ-2407',
    source: 'Website',
    interestProgram: 'Little Learners',
    parentOneName: 'Meera Iyer',
    parentOnePhone: '+91 98765 22007',
    parentOneEmail: 'meera.iyer@email.com',
    parentTwoName: '—',
    parentTwoPhone: '—',
    parentTwoEmail: '—',
    followUpDate: '2026-08-05',
    createdBy: 'Website',
    nextAction: 'First call',
    callOutcome: '—',
    priority: 'Medium',
    center: 'CTR-001',
    stage: 'New',
    updatedAt: '2026-08-01',
    channel: 'Web Form',
  },
  {
    studentName: 'Mia Shah',
    branch: 'East Wing',
    leadStatus: 'Tour Booked',
    activityDate: '2026-07-29',
    activityType: 'Call',
    activityNote: 'Confirmed afternoon tour slot.',
    assignedTo: 'Malika Thimisetty',
    enquiryId: 'ENQ-2408',
    source: 'Referral',
    interestProgram: 'Pre-K Prep',
    parentOneName: 'Kabir Shah',
    parentOnePhone: '+91 98765 22008',
    parentOneEmail: 'kabir.shah@email.com',
    parentTwoName: 'Nina Shah',
    parentTwoPhone: '+91 98765 22018',
    parentTwoEmail: 'nina.shah@email.com',
    followUpDate: '2026-08-02',
    createdBy: 'Front Desk',
    nextAction: 'Tour checklist',
    callOutcome: 'Connected',
    priority: 'High',
    center: 'CTR-002',
    stage: 'Tour Booked',
    updatedAt: '2026-07-29',
    channel: 'Phone',
  },
];

export function defaultEnquiryActivityForm(): EnquiryActivityFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    branches: [],
    leadStatuses: ['New', 'Contacted', 'Tour Booked', 'Follow-up'],
    activityTypes: [],
    assignees: [],
    columnMode: 'custom',
    selectedColumns: [
      'studentName',
      'branch',
      'leadStatus',
      'activityDate',
      'activityType',
      'assignedTo',
      'parentOneName',
      'parentOnePhone',
    ],
  };
}

function activeColumns(values: EnquiryActivityFormValues) {
  if (values.columnMode === 'all') return ACTIVITY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return ACTIVITY_COLUMNS.filter((c) => set.has(c.id));
}

function display(iso: string) {
  return iso === '—' ? '—' : toDisplayDate(iso);
}

export function buildEnquiryActivityRows(
  values: EnquiryActivityFormValues,
): Record<string, string>[] {
  const cols = activeColumns(values);
  const branchSet = new Set(values.branches);
  const statusSet = new Set(values.leadStatuses);
  const typeSet = new Set(values.activityTypes);
  const assigneeSet = new Set(values.assignees);

  return SEED.filter((row) => {
    if (branchSet.size && !branchSet.has(row.branch)) return false;
    if (statusSet.size && !statusSet.has(row.leadStatus)) return false;
    if (typeSet.size && !typeSet.has(row.activityType)) return false;
    if (assigneeSet.size && !assigneeSet.has(row.assignedTo)) return false;
    if (values.startDate && row.activityDate < values.startDate) return false;
    if (values.endDate && row.activityDate > values.endDate) return false;
    return true;
  }).map((row) => {
    const full: Record<ActivityColumnId, string> = {
      studentName: row.studentName,
      branch: row.branch,
      leadStatus: row.leadStatus,
      activityDate: display(row.activityDate),
      activityType: row.activityType,
      activityNote: row.activityNote,
      assignedTo: row.assignedTo,
      enquiryId: row.enquiryId,
      source: row.source,
      interestProgram: row.interestProgram,
      parentOneName: row.parentOneName,
      parentOnePhone: row.parentOnePhone,
      parentOneEmail: row.parentOneEmail,
      parentTwoName: row.parentTwoName,
      parentTwoPhone: row.parentTwoPhone,
      parentTwoEmail: row.parentTwoEmail,
      followUpDate: display(row.followUpDate),
      createdBy: row.createdBy,
      nextAction: row.nextAction,
      callOutcome: row.callOutcome,
      priority: row.priority,
      center: row.center,
      stage: row.stage,
      updatedAt: display(row.updatedAt),
      channel: row.channel,
    };
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createEnquiryActivityReport(
  values: EnquiryActivityFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildEnquiryActivityRows(values);
  const now = new Date();
  const filterParts = [
    values.branches.length ? `Branches: ${values.branches.join(', ')}` : null,
    values.leadStatuses.length ? `Statuses: ${values.leadStatuses.join(', ')}` : null,
    values.activityTypes.length ? `Types: ${values.activityTypes.join(', ')}` : null,
    values.assignees.length ? `Assignees: ${values.assignees.join(', ')}` : null,
  ].filter(Boolean);

  return {
    id: `enq-activity-${now.getTime()}`,
    kind: 'enquiry-activity',
    name: `Enquiry_Activity_Log_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: filterParts.length ? filterParts.join(' · ') : 'All activities',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
