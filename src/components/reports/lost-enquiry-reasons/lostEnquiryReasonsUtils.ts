import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type LostEnquiryColumnMode = 'all' | 'custom';

export type LostEnquiryColumnId = 'centerName' | 'reason' | 'leadsLost' | 'percentageOfTotal';

export const LOST_ENQUIRY_COLUMNS: { id: LostEnquiryColumnId; label: string }[] = [
  { id: 'centerName', label: 'Center Name' },
  { id: 'reason', label: 'Reason' },
  { id: 'leadsLost', label: 'Leads Lost' },
  { id: 'percentageOfTotal', label: 'Percentage of Total' },
];

export type LostEnquiryFormValues = {
  startDate: string;
  endDate: string;
  columnMode: LostEnquiryColumnMode;
  selectedColumns: LostEnquiryColumnId[];
};

type LostEnquirySeed = {
  centerName: string;
  reason: string;
  leadsLost: number;
};

const SEED: LostEnquirySeed[] = [
  { centerName: 'Main Campus', reason: 'Distance / Location', leadsLost: 12 },
  { centerName: 'Main Campus', reason: 'Fee / Pricing', leadsLost: 9 },
  { centerName: 'Main Campus', reason: 'Chose another center', leadsLost: 7 },
  { centerName: 'East Wing', reason: 'Schedule mismatch', leadsLost: 6 },
  { centerName: 'East Wing', reason: 'Program not available', leadsLost: 5 },
  { centerName: 'East Wing', reason: 'Fee / Pricing', leadsLost: 4 },
  { centerName: 'West Annex', reason: 'No response / Unresponsive', leadsLost: 8 },
  { centerName: 'West Annex', reason: 'Distance / Location', leadsLost: 3 },
  { centerName: 'West Annex', reason: 'Sibling enrolled elsewhere', leadsLost: 2 },
];

export function defaultLostEnquiryForm(): LostEnquiryFormValues {
  return {
    startDate: '2026-07-01',
    endDate: '2026-08-04',
    columnMode: 'custom',
    selectedColumns: ['centerName', 'reason', 'leadsLost', 'percentageOfTotal'],
  };
}

function activeColumns(values: LostEnquiryFormValues) {
  if (values.columnMode === 'all') return LOST_ENQUIRY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return LOST_ENQUIRY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildLostEnquiryRows(values: LostEnquiryFormValues): Record<string, string>[] {
  const cols = activeColumns(values);
  const totalLeads = SEED.reduce((sum, row) => sum + row.leadsLost, 0);

  return SEED.map((row) => {
    const pct = totalLeads > 0 ? ((row.leadsLost / totalLeads) * 100).toFixed(1) : '0.0';
    const full: Record<LostEnquiryColumnId, string> = {
      centerName: row.centerName,
      reason: row.reason,
      leadsLost: String(row.leadsLost),
      percentageOfTotal: `${pct}%`,
    };
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createLostEnquiryReport(
  values: LostEnquiryFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildLostEnquiryRows(values);
  const now = new Date();
  const period =
    values.startDate && values.endDate
      ? `${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}`
      : toFileDate(now.toISOString().slice(0, 10));

  return {
    id: `enq-lost-${now.getTime()}`,
    kind: 'lost-enquiry-reasons',
    name: `Lost_Enquiry_Reasons_${period}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: 'Lost enquiry reasons summary',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
