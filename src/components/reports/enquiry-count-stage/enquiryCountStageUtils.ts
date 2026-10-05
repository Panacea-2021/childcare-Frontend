import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const ENQUIRY_COUNT_STAGE_COLUMNS = [
  'Stage',
  'Enquiry Count',
  'Percentage of Total',
] as const;

export type EnquiryCountStageFormValues = {
  startDate: string;
  endDate: string;
};

export function defaultEnquiryCountStageForm(): EnquiryCountStageFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
  };
}

type StageSeed = {
  stage: string;
  count: number;
};

const STAGES: StageSeed[] = [
  { stage: 'New', count: 36 },
  { stage: 'Contacted', count: 48 },
  { stage: 'Tour Booked', count: 22 },
  { stage: 'Closed', count: 14 },
  { stage: 'Lost', count: 19 },
];

export function buildEnquiryCountStageRows(
  values: EnquiryCountStageFormValues,
): Record<string, string>[] {
  void values;
  const total = STAGES.reduce((sum, row) => sum + row.count, 0);

  return STAGES.map((row) => ({
    Stage: row.stage,
    'Enquiry Count': String(row.count),
    'Percentage of Total': total > 0 ? `${((row.count / total) * 100).toFixed(1)}%` : '0.0%',
  }));
}

export function createEnquiryCountStageReport(
  values: EnquiryCountStageFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...ENQUIRY_COUNT_STAGE_COLUMNS];
  const rows = buildEnquiryCountStageRows(values);
  const now = new Date();

  return {
    id: `enq-count-stage-${now.getTime()}`,
    kind: 'enquiry-count-stage',
    name: `Enquiry_Count_By_Stage_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
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
