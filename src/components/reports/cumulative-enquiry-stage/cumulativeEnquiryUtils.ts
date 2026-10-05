import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type CumulativeEnquiryColumnMode = 'all' | 'custom';

export type CumulativeEnquiryColumnId =
  | 'centerName'
  | 'status'
  | 'enquiryCount'
  | 'open'
  | 'lost'
  | 'admittedEnquiries'
  | 'activeFunnel'
  | 'totalFunnel';

export const CUMULATIVE_ENQUIRY_COLUMNS: { id: CumulativeEnquiryColumnId; label: string }[] = [
  { id: 'centerName', label: 'Center Name' },
  { id: 'status', label: 'Status' },
  { id: 'enquiryCount', label: 'Enquiry Count' },
  { id: 'open', label: 'Open' },
  { id: 'lost', label: 'Lost' },
  { id: 'admittedEnquiries', label: 'Admitted Enquiries' },
  { id: 'activeFunnel', label: 'Active Funnel' },
  { id: 'totalFunnel', label: 'Total Funnel' },
];

export type CumulativeEnquiryFormValues = {
  startDate: string;
  endDate: string;
  columnMode: CumulativeEnquiryColumnMode;
  selectedColumns: CumulativeEnquiryColumnId[];
};

type CumulativeSeed = {
  centerName: string;
  status: string;
  enquiryCount: number;
  open: number;
  lost: number;
  admittedEnquiries: number;
};

const SEED: CumulativeSeed[] = [
  {
    centerName: 'Main Campus',
    status: 'Active',
    enquiryCount: 86,
    open: 28,
    lost: 18,
    admittedEnquiries: 40,
  },
  {
    centerName: 'East Wing',
    status: 'Active',
    enquiryCount: 54,
    open: 19,
    lost: 12,
    admittedEnquiries: 23,
  },
  {
    centerName: 'West Annex',
    status: 'Active',
    enquiryCount: 41,
    open: 14,
    lost: 9,
    admittedEnquiries: 18,
  },
  {
    centerName: 'North Hub',
    status: 'Inactive',
    enquiryCount: 22,
    open: 6,
    lost: 8,
    admittedEnquiries: 8,
  },
];

export function defaultCumulativeEnquiryForm(): CumulativeEnquiryFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    columnMode: 'custom',
    selectedColumns: CUMULATIVE_ENQUIRY_COLUMNS.map((c) => c.id),
  };
}

function activeColumns(values: CumulativeEnquiryFormValues) {
  if (values.columnMode === 'all') return CUMULATIVE_ENQUIRY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return CUMULATIVE_ENQUIRY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildCumulativeEnquiryRows(
  values: CumulativeEnquiryFormValues,
): Record<string, string>[] {
  const cols = activeColumns(values);

  return SEED.map((row) => {
    const activeFunnel = row.open + row.admittedEnquiries;
    const totalFunnel = row.enquiryCount;
    const full: Record<CumulativeEnquiryColumnId, string> = {
      centerName: row.centerName,
      status: row.status,
      enquiryCount: String(row.enquiryCount),
      open: String(row.open),
      lost: String(row.lost),
      admittedEnquiries: String(row.admittedEnquiries),
      activeFunnel: String(activeFunnel),
      totalFunnel: String(totalFunnel),
    };
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createCumulativeEnquiryReport(
  values: CumulativeEnquiryFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildCumulativeEnquiryRows(values);
  const now = new Date();
  const period =
    values.startDate && values.endDate
      ? `${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}`
      : toFileDate(now.toISOString().slice(0, 10));

  return {
    id: `enq-cumulative-${now.getTime()}`,
    kind: 'cumulative-enquiry-stage',
    name: `Cumulative_Enquiry_By_Stage_${period}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: 'Cumulative enquiry by stage',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
