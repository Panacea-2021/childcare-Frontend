import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type WeeklyEnquiryColumnMode = 'all' | 'custom';

export type WeeklyEnquiryColumnId =
  | 'centerName'
  | 'thisWeek'
  | 'previousWeek'
  | 'changeInPercentage';

export const WEEKLY_ENQUIRY_COLUMNS: { id: WeeklyEnquiryColumnId; label: string }[] = [
  { id: 'centerName', label: 'Center Name' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'previousWeek', label: 'Previous Week' },
  { id: 'changeInPercentage', label: 'Change In Percentage' },
];

export type WeeklyEnquiryFormValues = {
  columnMode: WeeklyEnquiryColumnMode;
  selectedColumns: WeeklyEnquiryColumnId[];
};

type WeeklyEnquirySeed = {
  centerName: string;
  thisWeek: number;
  previousWeek: number;
};

const SEED: WeeklyEnquirySeed[] = [
  { centerName: 'Main Campus', thisWeek: 28, previousWeek: 22 },
  { centerName: 'East Wing', thisWeek: 19, previousWeek: 24 },
  { centerName: 'West Annex', thisWeek: 15, previousWeek: 12 },
  { centerName: 'North Branch', thisWeek: 21, previousWeek: 18 },
  { centerName: 'South Hub', thisWeek: 11, previousWeek: 14 },
  { centerName: 'City Center', thisWeek: 33, previousWeek: 29 },
];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toIsoDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Current calendar week (Mon–Sun) and the prior week, for report metadata. */
export function getWeeklyComparisonRange(now = new Date()) {
  const thisWeekStart = startOfWeek(now);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

  const previousWeekStart = new Date(thisWeekStart);
  previousWeekStart.setDate(thisWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(thisWeekStart);
  previousWeekEnd.setDate(thisWeekStart.getDate() - 1);

  return {
    startDate: toIsoDate(previousWeekStart),
    endDate: toIsoDate(thisWeekEnd),
    thisWeekStart: toIsoDate(thisWeekStart),
    thisWeekEnd: toIsoDate(thisWeekEnd),
    previousWeekStart: toIsoDate(previousWeekStart),
    previousWeekEnd: toIsoDate(previousWeekEnd),
  };
}

function formatChangePercent(thisWeek: number, previousWeek: number) {
  if (previousWeek === 0) {
    if (thisWeek === 0) return '0.0%';
    return '+100.0%';
  }
  const change = ((thisWeek - previousWeek) / previousWeek) * 100;
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export function defaultWeeklyEnquiryForm(): WeeklyEnquiryFormValues {
  return {
    columnMode: 'custom',
    selectedColumns: ['centerName', 'thisWeek', 'previousWeek', 'changeInPercentage'],
  };
}

function activeColumns(values: WeeklyEnquiryFormValues) {
  if (values.columnMode === 'all') return WEEKLY_ENQUIRY_COLUMNS;
  const set = new Set(values.selectedColumns);
  return WEEKLY_ENQUIRY_COLUMNS.filter((c) => set.has(c.id));
}

export function buildWeeklyEnquiryRows(values: WeeklyEnquiryFormValues): Record<string, string>[] {
  const cols = activeColumns(values);

  return SEED.map((row) => {
    const full: Record<WeeklyEnquiryColumnId, string> = {
      centerName: row.centerName,
      thisWeek: String(row.thisWeek),
      previousWeek: String(row.previousWeek),
      changeInPercentage: formatChangePercent(row.thisWeek, row.previousWeek),
    };
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createWeeklyEnquirySummaryReport(
  values: WeeklyEnquiryFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildWeeklyEnquiryRows(values);
  const now = new Date();
  const range = getWeeklyComparisonRange(now);

  return {
    id: `enq-weekly-${now.getTime()}`,
    kind: 'weekly-enquiry-summary',
    name: `Weekly_Enquiry_Summary_${toFileDate(range.thisWeekStart)}_vs_${toFileDate(range.previousWeekStart)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: range.startDate,
    endDate: range.endDate,
    filterBy: 'classroom',
    selectedLabel: 'Current week vs previous week by center',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
