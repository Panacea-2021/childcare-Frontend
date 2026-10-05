import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const ENQUIRY_SOURCE_COLUMNS = [
  'Source',
  'Enquiry Count',
  'Percentage',
  'Converted',
  'Lost',
  'In Progress',
] as const;

export type EnquirySourceFormValues = {
  startDate: string;
  endDate: string;
};

export function defaultEnquirySourceForm(): EnquirySourceFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-07-30',
  };
}

type SourceSeed = {
  source: string;
  count: number;
  converted: number;
  lost: number;
  inProgress: number;
};

const SOURCES: SourceSeed[] = [
  { source: 'Website', count: 42, converted: 12, lost: 8, inProgress: 22 },
  { source: 'Walk-in', count: 28, converted: 14, lost: 4, inProgress: 10 },
  { source: 'Referral', count: 19, converted: 9, lost: 3, inProgress: 7 },
  { source: 'Social Media', count: 35, converted: 7, lost: 11, inProgress: 17 },
  { source: 'Google Ads', count: 16, converted: 3, lost: 5, inProgress: 8 },
  { source: 'School Fair', count: 11, converted: 4, lost: 2, inProgress: 5 },
  { source: 'Partner Center', count: 8, converted: 2, lost: 1, inProgress: 5 },
];

export function buildEnquirySourceRows(
  values: EnquirySourceFormValues,
): Record<string, string>[] {
  void values;
  const total = SOURCES.reduce((sum, s) => sum + s.count, 0);

  return SOURCES.map((s) => ({
    Source: s.source,
    'Enquiry Count': String(s.count),
    Percentage: `${((s.count / total) * 100).toFixed(1)}%`,
    Converted: String(s.converted),
    Lost: String(s.lost),
    'In Progress': String(s.inProgress),
  }));
}

export function createEnquirySourceReport(
  values: EnquirySourceFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...ENQUIRY_SOURCE_COLUMNS];
  const rows = buildEnquirySourceRows(values);
  const now = new Date();

  return {
    id: `esrc-${now.getTime()}`,
    kind: 'enquiry-source',
    name: `Enquiry_Source_Report_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${toDisplayDate(values.startDate)} → ${toDisplayDate(values.endDate)}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
