import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type {
  GeneratedExcelReport,
  ReportExportFormat,
} from '@/components/reports/shared/generatedReport';

export type StaffFormStatusFilter = 'all' | 'live' | 'draft';

export type StaffFormFilters = {
  status: StaffFormStatusFilter;
  createdOnStart: string;
  createdOnEnd: string;
};

export type StaffFormSubmissionValues = {
  formId: string;
  startDate: string;
  endDate: string;
  includePending: boolean;
  format: ReportExportFormat;
  filters: StaffFormFilters;
};

export type StaffFormOption = {
  value: string;
  label: string;
  status: Exclude<StaffFormStatusFilter, 'all'>;
  createdOn: string;
};

export const STAFF_FORM_STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'live', label: 'Live' },
  { value: 'draft', label: 'Draft' },
] as const;

export const STAFF_FORM_OPTIONS: StaffFormOption[] = [
  { value: 'employee-onboarding', label: 'Employee Onboarding', status: 'live', createdOn: '2026-06-12' },
  { value: 'incident-report', label: 'Incident Report', status: 'live', createdOn: '2026-07-01' },
  { value: 'leave-request', label: 'Leave Request Form', status: 'live', createdOn: '2026-07-08' },
  { value: 'training-ack', label: 'Training Acknowledgement', status: 'draft', createdOn: '2026-07-15' },
  { value: 'emergency-contacts', label: 'Emergency Contacts Update', status: 'live', createdOn: '2026-07-20' },
  { value: 'policy-ack', label: 'Policy Acknowledgement', status: 'draft', createdOn: '2026-07-28' },
  { value: 'shift-preference', label: 'Shift Preference Form', status: 'live', createdOn: '2026-08-01' },
];

export const STAFF_FORM_COLUMNS = [
  'Form Name',
  'Staff Name',
  'Department',
  'Submitted On',
  'Status',
  'Reviewed By',
] as const;

export function defaultStaffFormFilters(): StaffFormFilters {
  return {
    status: 'all',
    createdOnStart: '',
    createdOnEnd: '',
  };
}

export function defaultStaffFormSubmissionValues(): StaffFormSubmissionValues {
  return {
    formId: '',
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    includePending: true,
    format: 'excel',
    filters: defaultStaffFormFilters(),
  };
}

export function filterStaffFormOptions(filters: StaffFormFilters): StaffFormOption[] {
  return STAFF_FORM_OPTIONS.filter((form) => {
    if (filters.status !== 'all' && form.status !== filters.status) return false;
    if (filters.createdOnStart && form.createdOn < filters.createdOnStart) return false;
    if (filters.createdOnEnd && form.createdOn > filters.createdOnEnd) return false;
    return true;
  });
}

export function hasActiveStaffFormFilters(filters: StaffFormFilters) {
  return Boolean(filters.status !== 'all' || filters.createdOnStart || filters.createdOnEnd);
}

type SubmissionSeed = {
  formId: string;
  staffName: string;
  department: string;
  submittedOn: string;
  status: 'Submitted' | 'Pending' | 'Reviewed';
  reviewedBy: string;
};

const SEED: SubmissionSeed[] = [
  {
    formId: 'employee-onboarding',
    staffName: 'Priya Nair',
    department: 'Administration',
    submittedOn: '2026-07-28',
    status: 'Reviewed',
    reviewedBy: 'Malika Thimisetty',
  },
  {
    formId: 'incident-report',
    staffName: 'Rahul Mehta',
    department: 'Classroom',
    submittedOn: '2026-07-29',
    status: 'Pending',
    reviewedBy: '—',
  },
  {
    formId: 'leave-request',
    staffName: 'Ananya Iyer',
    department: 'Classroom',
    submittedOn: '2026-07-30',
    status: 'Submitted',
    reviewedBy: '—',
  },
  {
    formId: 'training-ack',
    staffName: 'Dev Sharma',
    department: 'Kitchen',
    submittedOn: '2026-07-31',
    status: 'Reviewed',
    reviewedBy: 'Front Desk',
  },
  {
    formId: 'emergency-contacts',
    staffName: 'Sneha Kapoor',
    department: 'Administration',
    submittedOn: '2026-08-01',
    status: 'Pending',
    reviewedBy: '—',
  },
  {
    formId: 'policy-ack',
    staffName: 'Kabir Shah',
    department: 'Transport',
    submittedOn: '2026-08-02',
    status: 'Submitted',
    reviewedBy: '—',
  },
  {
    formId: 'shift-preference',
    staffName: 'Meera Reddy',
    department: 'Classroom',
    submittedOn: '2026-08-03',
    status: 'Reviewed',
    reviewedBy: 'Priya Nair',
  },
  {
    formId: 'incident-report',
    staffName: 'Farhan Ali',
    department: 'Security',
    submittedOn: '2026-08-04',
    status: 'Pending',
    reviewedBy: '—',
  },
];

function formLabel(formId: string) {
  return STAFF_FORM_OPTIONS.find((f) => f.value === formId)?.label ?? formId;
}

export function buildStaffFormSubmissionRows(
  values: StaffFormSubmissionValues,
): Record<string, string>[] {
  const allowedForms = new Set(filterStaffFormOptions(values.filters).map((f) => f.value));

  return SEED.filter((row) => {
    if (values.formId && row.formId !== values.formId) return false;
    if (!allowedForms.has(row.formId)) return false;
    if (values.startDate && row.submittedOn < values.startDate) return false;
    if (values.endDate && row.submittedOn > values.endDate) return false;
    if (!values.includePending && row.status === 'Pending') return false;
    return true;
  }).map((row) => ({
    'Form Name': formLabel(row.formId),
    'Staff Name': row.staffName,
    Department: row.department,
    'Submitted On': toDisplayDate(row.submittedOn),
    Status: row.status,
    'Reviewed By': row.reviewedBy,
  }));
}

export function createStaffFormSubmissionReport(
  values: StaffFormSubmissionValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...STAFF_FORM_COLUMNS];
  const rows = buildStaffFormSubmissionRows(values);
  const now = new Date();
  const isPdf = values.format === 'pdf';
  const form = formLabel(values.formId);
  const period = `${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}`;
  const ext = isPdf ? 'pdf' : 'xlsx';
  const statusLabel =
    STAFF_FORM_STATUS_OPTIONS.find((s) => s.value === values.filters.status)?.label ?? 'All Status';

  return {
    id: `form-staff-${now.getTime()}`,
    kind: 'staff-form-submission',
    name: `Staff_Form_Submission_${period}.${ext}`,
    format: values.format,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: [
      form || 'All forms',
      statusLabel,
      values.includePending ? 'Including pending' : 'Excluding pending',
      values.format.toUpperCase(),
    ].join(' · '),
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
