import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type DailyCollectionColumnMode = 'all' | 'custom';

export type DailyCollectionColumnId =
  | 'center'
  | 'paymentMode'
  | 'opening'
  | 'today'
  | 'closing';

export const DAILY_COLLECTION_COLUMNS: { id: DailyCollectionColumnId; label: string }[] = [
  { id: 'center', label: 'Center' },
  { id: 'paymentMode', label: 'Payment Mode' },
  { id: 'opening', label: 'Opening' },
  { id: 'today', label: 'Today' },
  { id: 'closing', label: 'Closing' },
];

export type DailyCollectionFormValues = {
  asOfDate: string;
  columnMode: DailyCollectionColumnMode;
  selectedColumns: DailyCollectionColumnId[];
};

type RowSeed = {
  center: string;
  paymentMode: string;
  opening: number;
  today: number;
};

const COLLECTION_ROWS: RowSeed[] = [
  { center: 'Main Campus', paymentMode: 'Cash', opening: 12500, today: 8400 },
  { center: 'Main Campus', paymentMode: 'UPI', opening: 18200, today: 15650 },
  { center: 'Main Campus', paymentMode: 'Card', opening: 9400, today: 7200 },
  { center: 'Main Campus', paymentMode: 'Net Banking', opening: 6100, today: 4500 },
  { center: 'East Wing', paymentMode: 'Cash', opening: 7800, today: 5200 },
  { center: 'East Wing', paymentMode: 'UPI', opening: 11200, today: 9800 },
  { center: 'East Wing', paymentMode: 'Card', opening: 4300, today: 3100 },
  { center: 'Main Campus', paymentMode: 'Cheque', opening: 2500, today: 0 },
];

function inr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export function defaultDailyCollectionForm(): DailyCollectionFormValues {
  return {
    asOfDate: '2026-08-04',
    columnMode: 'all',
    selectedColumns: [],
  };
}

function activeColumns(values: DailyCollectionFormValues) {
  if (values.columnMode === 'all') return DAILY_COLLECTION_COLUMNS;
  const set = new Set(values.selectedColumns);
  return DAILY_COLLECTION_COLUMNS.filter((c) => set.has(c.id));
}

export function buildDailyCollectionRows(
  values: DailyCollectionFormValues,
): Record<string, string>[] {
  const cols = activeColumns(values);

  return COLLECTION_ROWS.map((row) => {
    const closing = row.opening + row.today;
    const full: Record<DailyCollectionColumnId, string> = {
      center: row.center,
      paymentMode: row.paymentMode,
      opening: inr(row.opening),
      today: inr(row.today),
      closing: inr(closing),
    };

    const out: Record<string, string> = {};
    cols.forEach((col) => {
      out[col.label] = full[col.id];
    });
    return out;
  });
}

export function createDailyCollectionReport(
  values: DailyCollectionFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildDailyCollectionRows(values);
  const now = new Date();

  return {
    id: `dcs-${now.getTime()}`,
    kind: 'daily-collection',
    name: `Daily_Collection_Summary_${toFileDate(values.asOfDate)}.xlsx`,
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.asOfDate,
    endDate: values.asOfDate,
    filterBy: 'classroom',
    selectedLabel: `As of ${toDisplayDate(values.asOfDate)}`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
