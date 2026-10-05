import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type {
  GeneratedExcelReport,
  ReportExportFormat,
} from '@/components/reports/shared/generatedReport';

export type StudentFormSubmissionValues = {
  formId: string;
  startDate: string;
  endDate: string;
  includePending: boolean;
  format: ReportExportFormat;
};

export const STUDENT_FORM_OPTIONS = [
  { value: 'enrollment', label: 'Enrollment Form' },
  { value: 'allergy-medical', label: 'Allergy & Medical' },
  { value: 'field-trip', label: 'Field Trip Consent' },
  { value: 'emergency-contacts', label: 'Emergency Contacts Update' },
  { value: 'media-release', label: 'Media Release Form' },
  { value: 'pickup-authorization', label: 'Pickup Authorization' },
  { value: 'health-screening', label: 'Health Screening Questionnaire' },
] as const;

export const STUDENT_FORM_COLUMNS = [
  'Form Name',
  'Student Name',
  'Parent / Guardian',
  'Submitted On',
  'Status',
  'Reviewed By',
] as const;

export function defaultStudentFormSubmissionValues(): StudentFormSubmissionValues {
  return {
    formId: '',
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    includePending: true,
    format: 'excel',
  };
}

type SubmissionSeed = {
  formId: string;
  studentName: string;
  parentName: string;
  submittedOn: string;
  status: 'Submitted' | 'Pending' | 'Reviewed';
  reviewedBy: string;
};

const SEED: SubmissionSeed[] = [
  {
    formId: 'enrollment',
    studentName: 'Aanya Kapoor',
    parentName: 'Sneha Kapoor',
    submittedOn: '2026-07-28',
    status: 'Reviewed',
    reviewedBy: 'Malika Thimisetty',
  },
  {
    formId: 'allergy-medical',
    studentName: 'Rohan Desai',
    parentName: 'Vikram Desai',
    submittedOn: '2026-07-29',
    status: 'Pending',
    reviewedBy: '—',
  },
  {
    formId: 'field-trip',
    studentName: 'Ishaan Banerjee',
    parentName: 'Leena Banerjee',
    submittedOn: '2026-07-30',
    status: 'Submitted',
    reviewedBy: '—',
  },
  {
    formId: 'enrollment',
    studentName: 'Kiara Mehta',
    parentName: 'Arjun Mehta',
    submittedOn: '2026-07-31',
    status: 'Reviewed',
    reviewedBy: 'Priya Nair',
  },
  {
    formId: 'emergency-contacts',
    studentName: 'Dev Reddy',
    parentName: 'Nisha Reddy',
    submittedOn: '2026-08-01',
    status: 'Pending',
    reviewedBy: '—',
  },
  {
    formId: 'media-release',
    studentName: 'Zoya Ali',
    parentName: 'Farhan Ali',
    submittedOn: '2026-08-02',
    status: 'Submitted',
    reviewedBy: '—',
  },
  {
    formId: 'pickup-authorization',
    studentName: 'Aditi Iyer',
    parentName: 'Meera Iyer',
    submittedOn: '2026-08-03',
    status: 'Reviewed',
    reviewedBy: 'Front Desk',
  },
  {
    formId: 'health-screening',
    studentName: 'Mia Shah',
    parentName: 'Kabir Shah',
    submittedOn: '2026-08-04',
    status: 'Pending',
    reviewedBy: '—',
  },
];

function formLabel(formId: string) {
  return STUDENT_FORM_OPTIONS.find((f) => f.value === formId)?.label ?? formId;
}

export function buildStudentFormSubmissionRows(
  values: StudentFormSubmissionValues,
): Record<string, string>[] {
  return SEED.filter((row) => {
    if (values.formId && row.formId !== values.formId) return false;
    if (values.startDate && row.submittedOn < values.startDate) return false;
    if (values.endDate && row.submittedOn > values.endDate) return false;
    if (!values.includePending && row.status === 'Pending') return false;
    return true;
  }).map((row) => ({
    'Form Name': formLabel(row.formId),
    'Student Name': row.studentName,
    'Parent / Guardian': row.parentName,
    'Submitted On': toDisplayDate(row.submittedOn),
    Status: row.status,
    'Reviewed By': row.reviewedBy,
  }));
}

export function createStudentFormSubmissionReport(
  values: StudentFormSubmissionValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...STUDENT_FORM_COLUMNS];
  const rows = buildStudentFormSubmissionRows(values);
  const now = new Date();
  const isPdf = values.format === 'pdf';
  const form = formLabel(values.formId);
  const period = `${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}`;
  const ext = isPdf ? 'pdf' : 'xlsx';

  return {
    id: `form-student-${now.getTime()}`,
    kind: 'student-form-submission',
    name: `Student_Form_Submission_${period}.${ext}`,
    format: values.format,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: [
      form,
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
