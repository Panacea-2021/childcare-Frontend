import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type NewJoinerBreakdownFormValues = {
  startDate: string;
  endDate: string;
};

const PROGRAMS = [
  'Infant Care',
  'Toddler Enrichment',
  'Preschool Prep',
  'After School Club',
  'Kindergarten Ready',
  'Weekend Play Hub',
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const NEW_JOINER_COLUMNS = [
  'Month',
  'Year',
  'Program',
  'New Joiners',
  'Male',
  'Female',
  'Total Capacity Used %',
] as const;

export function defaultNewJoinerBreakdownForm(): NewJoinerBreakdownFormValues {
  return {
    startDate: '2026-01-01',
    endDate: '2026-08-04',
  };
}

function monthsInRange(start: string, end: string) {
  const [sy, sm] = start.split('-').map(Number);
  const [ey, em] = end.split('-').map(Number);
  const out: { year: number; monthIndex: number }[] = [];
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push({ year: y, monthIndex: m - 1 });
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

export function buildNewJoinerBreakdownRows(
  values: NewJoinerBreakdownFormValues,
): Record<string, string>[] {
  const months = monthsInRange(values.startDate, values.endDate);
  const rows: Record<string, string>[] = [];

  months.forEach(({ year, monthIndex }, mi) => {
    PROGRAMS.forEach((program, pi) => {
      const seed = mi * 11 + pi * 3;
      const joiners = 2 + (seed % 9);
      const male = Math.floor(joiners / 2) + (seed % 2);
      const female = joiners - male;
      rows.push({
        Month: MONTHS[monthIndex],
        Year: String(year),
        Program: program,
        'New Joiners': String(joiners),
        Male: String(male),
        Female: String(female),
        'Total Capacity Used %': `${40 + (seed % 45)}%`,
      });
    });
  });

  return rows;
}

export function createNewJoinerBreakdownReport(
  values: NewJoinerBreakdownFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...NEW_JOINER_COLUMNS];
  const rows = buildNewJoinerBreakdownRows(values);
  const now = new Date();

  return {
    id: `new-joiner-${now.getTime()}`,
    kind: 'new-joiner-breakdown',
    name: `New_Joiner_Breakdown_By_Month_${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: 'All programs',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
