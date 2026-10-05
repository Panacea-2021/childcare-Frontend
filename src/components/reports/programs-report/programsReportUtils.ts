import { CLASSROOMS, CURRENT_USER } from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type ProgramsReportFormValues = {
  rooms: string[];
};

export const PROGRAMS_REPORT_LAST_GENERATED = {
  dateLabel: '28/07/2026',
  timeLabel: '04:15:40 PM',
  by: 'Malika Thimisetty',
};

export const PROGRAMS_REPORT_COLUMNS = [
  'Program Name',
  'Classroom',
  'Capacity',
  'Enrolled',
  'Available Seats',
  'Age Group',
  'Status',
] as const;

const PROGRAM_CATALOG = [
  { name: 'Infant Care', ageGroup: '0–12 months', capacity: 12 },
  { name: 'Toddler Enrichment', ageGroup: '1–2 years', capacity: 16 },
  { name: 'Preschool Prep', ageGroup: '3–4 years', capacity: 20 },
  { name: 'Kindergarten Ready', ageGroup: '4–5 years', capacity: 22 },
  { name: 'After School Club', ageGroup: '5–8 years', capacity: 24 },
  { name: 'Weekend Play Hub', ageGroup: '2–6 years', capacity: 18 },
];

export function defaultProgramsReportForm(): ProgramsReportFormValues {
  return { rooms: [] };
}

export function buildProgramsReportRows(
  values: ProgramsReportFormValues,
): Record<string, string>[] {
  const rooms = values.rooms.length ? values.rooms : [...CLASSROOMS];
  const rows: Record<string, string>[] = [];

  rooms.forEach((room, ri) => {
    PROGRAM_CATALOG.forEach((program, pi) => {
      const seed = ri * 7 + pi;
      const enrolled = Math.max(4, program.capacity - (seed % 8));
      rows.push({
        'Program Name': program.name,
        Classroom: room,
        Capacity: String(program.capacity),
        Enrolled: String(enrolled),
        'Available Seats': String(Math.max(0, program.capacity - enrolled)),
        'Age Group': program.ageGroup,
        Status: seed % 9 === 0 ? 'Waitlist' : 'Open',
      });
    });
  });

  return rows;
}

export function createProgramsReport(
  values: ProgramsReportFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...PROGRAMS_REPORT_COLUMNS];
  const rows = buildProgramsReportRows(values);
  const now = new Date();
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';

  return {
    id: `programs-${now.getTime()}`,
    kind: 'programs',
    name: `Programs_Report_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: '',
    endDate: '',
    filterBy: 'classroom',
    selectedLabel: roomsLabel,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
