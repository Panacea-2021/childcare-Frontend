import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type EnquiryColumnMode = 'all' | 'custom';

export type EnquiryColumnId =
  | 'parentName'
  | 'phone'
  | 'email'
  | 'childName'
  | 'childAge'
  | 'programInterest'
  | 'source'
  | 'stage'
  | 'owner'
  | 'enquiryDate'
  | 'followUpDate'
  | 'lastContact'
  | 'remarks'
  | 'branch'
  | 'priority'
  | 'preferredSchedule'
  | 'howHeard'
  | 'tourDate'
  | 'lostReason'
  | 'createdBy'
  | 'updatedBy'
  | 'tags'
  | 'status';

export const ENQUIRY_COLUMNS: { id: EnquiryColumnId; label: string }[] = [
  { id: 'parentName', label: 'Parent Name' },
  { id: 'phone', label: 'Phone' },
  { id: 'email', label: 'Email' },
  { id: 'childName', label: 'Child Name' },
  { id: 'childAge', label: 'Child Age' },
  { id: 'programInterest', label: 'Program Interest' },
  { id: 'source', label: 'Source' },
  { id: 'stage', label: 'Stage' },
  { id: 'owner', label: 'Owner' },
  { id: 'enquiryDate', label: 'Enquiry Date' },
  { id: 'followUpDate', label: 'Follow-up Date' },
  { id: 'lastContact', label: 'Last Contact' },
  { id: 'remarks', label: 'Remarks' },
  { id: 'branch', label: 'Branch' },
  { id: 'priority', label: 'Priority' },
  { id: 'preferredSchedule', label: 'Preferred Schedule' },
  { id: 'howHeard', label: 'How Heard' },
  { id: 'tourDate', label: 'Tour Date' },
  { id: 'lostReason', label: 'Lost Reason' },
  { id: 'createdBy', label: 'Created By' },
  { id: 'updatedBy', label: 'Updated By' },
  { id: 'tags', label: 'Tags' },
  { id: 'status', label: 'Status' },
];

export const ENQUIRY_STAGES = ['New', 'Contacted', 'Tour Booked', 'Closed', 'Lost'] as const;
export const ENQUIRY_SOURCES = ['Website', 'Referral', 'Walk-in', 'Instagram', 'WhatsApp', 'Campaign'] as const;
export const ENQUIRY_OWNERS = [
  'Malika Thimisetty',
  'Priya Nair',
  'Rahul Mehta',
  'Front Desk',
] as const;
export const ENQUIRY_PROGRAMS = [
  'Early Explorers',
  'Little Learners',
  'Pre-K Prep',
  'Weekend Play Club',
  'Nest Room',
] as const;

export type EnquiryStage = (typeof ENQUIRY_STAGES)[number];
export type EnquirySource = (typeof ENQUIRY_SOURCES)[number];

export type EnquiryReportFormValues = {
  startDate: string;
  endDate: string;
  stages: EnquiryStage[];
  sources: EnquirySource[];
  owners: string[];
  programs: string[];
  columnMode: EnquiryColumnMode;
  selectedColumns: EnquiryColumnId[];
};

type EnquirySeed = {
  parentName: string;
  phone: string;
  email: string;
  childName: string;
  childAge: string;
  programInterest: string;
  source: EnquirySource;
  stage: EnquiryStage;
  owner: string;
  enquiryDate: string;
  followUpDate: string;
  lastContact: string;
  remarks: string;
  branch: string;
  priority: string;
  preferredSchedule: string;
  howHeard: string;
  tourDate: string;
  lostReason: string;
  createdBy: string;
  updatedBy: string;
  tags: string;
  status: string;
};

const SEED: EnquirySeed[] = [
  {
    parentName: 'Sneha Kapoor',
    phone: '+91 98765 22001',
    email: 'sneha.kapoor@email.com',
    childName: 'Aanya Kapoor',
    childAge: '3 yrs 2 mo',
    programInterest: 'Pre-K Prep',
    source: 'Website',
    stage: 'New',
    owner: 'Malika Thimisetty',
    enquiryDate: '2026-07-29',
    followUpDate: '2026-08-02',
    lastContact: '2026-07-29',
    remarks: 'Interested in morning batch',
    branch: 'Main Campus',
    priority: 'High',
    preferredSchedule: 'Full Day',
    howHeard: 'Google search',
    tourDate: '—',
    lostReason: '—',
    createdBy: 'Front Desk',
    updatedBy: 'Malika Thimisetty',
    tags: 'Hot lead',
    status: 'Open',
  },
  {
    parentName: 'Vikram Desai',
    phone: '+91 98765 22002',
    email: 'vikram.desai@email.com',
    childName: 'Rohan Desai',
    childAge: '2 yrs 6 mo',
    programInterest: 'Little Learners',
    source: 'Referral',
    stage: 'Contacted',
    owner: 'Priya Nair',
    enquiryDate: '2026-07-28',
    followUpDate: '2026-08-01',
    lastContact: '2026-07-30',
    remarks: 'Sibling already enrolled',
    branch: 'Main Campus',
    priority: 'Medium',
    preferredSchedule: 'Half Day',
    howHeard: 'Parent referral',
    tourDate: '2026-08-05',
    lostReason: '—',
    createdBy: 'Priya Nair',
    updatedBy: 'Priya Nair',
    tags: 'Referral',
    status: 'In progress',
  },
  {
    parentName: 'Leena Banerjee',
    phone: '+91 98765 22003',
    email: 'leena.b@email.com',
    childName: 'Ishaan Banerjee',
    childAge: '1 yr 4 mo',
    programInterest: 'Nest Room',
    source: 'Walk-in',
    stage: 'Tour Booked',
    owner: 'Rahul Mehta',
    enquiryDate: '2026-07-27',
    followUpDate: '2026-07-31',
    lastContact: '2026-07-28',
    remarks: 'Wants infant care options',
    branch: 'East Wing',
    priority: 'High',
    preferredSchedule: 'Full Day',
    howHeard: 'Walk-in',
    tourDate: '2026-08-03',
    lostReason: '—',
    createdBy: 'Front Desk',
    updatedBy: 'Rahul Mehta',
    tags: 'Tour',
    status: 'Open',
  },
  {
    parentName: 'Arjun Mehta',
    phone: '+91 98765 22004',
    email: 'arjun.mehta@email.com',
    childName: 'Kiara Mehta',
    childAge: '4 yrs 1 mo',
    programInterest: 'Weekend Play Club',
    source: 'Instagram',
    stage: 'Closed',
    owner: 'Front Desk',
    enquiryDate: '2026-07-25',
    followUpDate: '2026-07-28',
    lastContact: '2026-07-28',
    remarks: 'Enrolled after tour',
    branch: 'Main Campus',
    priority: 'Low',
    preferredSchedule: 'Weekend',
    howHeard: 'Instagram ad',
    tourDate: '2026-07-27',
    lostReason: '—',
    createdBy: 'Front Desk',
    updatedBy: 'Front Desk',
    tags: 'Converted',
    status: 'Won',
  },
  {
    parentName: 'Nisha Reddy',
    phone: '+91 98765 22005',
    email: 'nisha.reddy@email.com',
    childName: 'Dev Reddy',
    childAge: '2 yrs 9 mo',
    programInterest: 'Early Explorers',
    source: 'WhatsApp',
    stage: 'Lost',
    owner: 'Malika Thimisetty',
    enquiryDate: '2026-07-22',
    followUpDate: '2026-07-26',
    lastContact: '2026-07-26',
    remarks: 'Chose another center',
    branch: 'East Wing',
    priority: 'Medium',
    preferredSchedule: 'Full Day',
    howHeard: 'WhatsApp campaign',
    tourDate: '—',
    lostReason: 'Distance',
    createdBy: 'Front Desk',
    updatedBy: 'Malika Thimisetty',
    tags: 'Lost',
    status: 'Lost',
  },
  {
    parentName: 'Farhan Ali',
    phone: '+91 98765 22006',
    email: 'farhan.ali@email.com',
    childName: 'Zoya Ali',
    childAge: '3 yrs 8 mo',
    programInterest: 'Pre-K Prep',
    source: 'Campaign',
    stage: 'Contacted',
    owner: 'Priya Nair',
    enquiryDate: '2026-07-30',
    followUpDate: '2026-08-04',
    lastContact: '2026-07-31',
    remarks: 'Comparing fee plans',
    branch: 'Main Campus',
    priority: 'High',
    preferredSchedule: 'Full Day',
    howHeard: 'Open day campaign',
    tourDate: '—',
    lostReason: '—',
    createdBy: 'Priya Nair',
    updatedBy: 'Priya Nair',
    tags: 'Campaign',
    status: 'Open',
  },
  {
    parentName: 'Meera Iyer',
    phone: '+91 98765 22007',
    email: 'meera.iyer@email.com',
    childName: 'Aditi Iyer',
    childAge: '2 yrs 1 mo',
    programInterest: 'Little Learners',
    source: 'Website',
    stage: 'New',
    owner: 'Rahul Mehta',
    enquiryDate: '2026-08-01',
    followUpDate: '2026-08-05',
    lastContact: '2026-08-01',
    remarks: 'Requested brochure',
    branch: 'Main Campus',
    priority: 'Medium',
    preferredSchedule: 'Half Day',
    howHeard: 'Website form',
    tourDate: '—',
    lostReason: '—',
    createdBy: 'Website',
    updatedBy: 'Rahul Mehta',
    tags: 'New',
    status: 'Open',
  },
  {
    parentName: 'Kabir Shah',
    phone: '+91 98765 22008',
    email: 'kabir.shah@email.com',
    childName: 'Mia Shah',
    childAge: '4 yrs 6 mo',
    programInterest: 'Pre-K Prep',
    source: 'Referral',
    stage: 'Tour Booked',
    owner: 'Malika Thimisetty',
    enquiryDate: '2026-07-26',
    followUpDate: '2026-08-02',
    lastContact: '2026-07-29',
    remarks: 'Prefers afternoon slot',
    branch: 'East Wing',
    priority: 'High',
    preferredSchedule: 'Afternoon',
    howHeard: 'Staff referral',
    tourDate: '2026-08-06',
    lostReason: '—',
    createdBy: 'Front Desk',
    updatedBy: 'Malika Thimisetty',
    tags: 'Tour',
    status: 'In progress',
  },
];

export function defaultEnquiryReportForm(): EnquiryReportFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    stages: ['New', 'Contacted', 'Tour Booked'],
    sources: [],
    owners: [],
    programs: [],
    columnMode: 'custom',
    selectedColumns: [
      'parentName',
      'phone',
      'email',
      'childName',
      'programInterest',
      'source',
      'stage',
      'owner',
    ],
  };
}

function activeColumns(values: EnquiryReportFormValues) {
  if (values.columnMode === 'all') return ENQUIRY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return ENQUIRY_COLUMNS.filter((c) => set.has(c.id));
}

function display(iso: string) {
  return iso === '—' ? '—' : toDisplayDate(iso);
}

export function buildEnquiryReportRows(values: EnquiryReportFormValues): Record<string, string>[] {
  const cols = activeColumns(values);
  const stageSet = new Set(values.stages);
  const sourceSet = new Set(values.sources);
  const ownerSet = new Set(values.owners);
  const programSet = new Set(values.programs);

  return SEED.filter((row) => {
    if (stageSet.size && !stageSet.has(row.stage)) return false;
    if (sourceSet.size && !sourceSet.has(row.source)) return false;
    if (ownerSet.size && !ownerSet.has(row.owner)) return false;
    if (programSet.size && !programSet.has(row.programInterest)) return false;
    if (values.startDate && row.enquiryDate < values.startDate) return false;
    if (values.endDate && row.enquiryDate > values.endDate) return false;
    return true;
  }).map((row) => {
    const full: Record<EnquiryColumnId, string> = {
      parentName: row.parentName,
      phone: row.phone,
      email: row.email,
      childName: row.childName,
      childAge: row.childAge,
      programInterest: row.programInterest,
      source: row.source,
      stage: row.stage,
      owner: row.owner,
      enquiryDate: display(row.enquiryDate),
      followUpDate: display(row.followUpDate),
      lastContact: display(row.lastContact),
      remarks: row.remarks,
      branch: row.branch,
      priority: row.priority,
      preferredSchedule: row.preferredSchedule,
      howHeard: row.howHeard,
      tourDate: display(row.tourDate),
      lostReason: row.lostReason,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      tags: row.tags,
      status: row.status,
    };
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createEnquiryReport(
  values: EnquiryReportFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildEnquiryReportRows(values);
  const now = new Date();
  const filterParts = [
    values.stages.length ? `Stages: ${values.stages.join(', ')}` : null,
    values.sources.length ? `Sources: ${values.sources.join(', ')}` : null,
    values.owners.length ? `Owners: ${values.owners.join(', ')}` : null,
    values.programs.length ? `Programs: ${values.programs.join(', ')}` : null,
  ].filter(Boolean);

  return {
    id: `enq-report-${now.getTime()}`,
    kind: 'enquiry-report',
    name: `Enquiry_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: filterParts.length ? filterParts.join(' · ') : 'All enquiries',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
