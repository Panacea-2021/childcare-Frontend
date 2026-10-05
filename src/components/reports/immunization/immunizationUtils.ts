import {
  MOCK_STUDENTS,
  CURRENT_USER,
  type StudentStatus,
} from '@/components/reports/attendance-summary/types';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export const ALL_IMMUNIZATIONS_VALUE = '__all__';

export const IMMUNIZATIONS = [
  'Hepatitis B',
  'BCG',
  'Polio',
  'DTP',
  'Hib',
  'Rotavirus',
  'MMR',
  'Chickenpox',
  'Hepatitis A',
  'Influenza',
  'COVID-19',
  'Pneumococcal',
  'Typhoid',
  'HPV',
] as const;

export type ImmunizationName = (typeof IMMUNIZATIONS)[number];

export type ImmunizationFormValues = {
  immunizations: string[];
  pastDueEnabled: boolean;
  dueWithinDays: string;
  rooms: string[];
  statuses: StudentStatus[];
};

export const IMMUNIZATION_COLUMNS = [
  'Student Name',
  'Admission Number',
  'Classroom',
  'Immunization',
  'Dose Number',
  'Vaccination Date',
  'Due Date',
  'Days Remaining',
  'Status',
  'Student Status',
  'Branch',
] as const;

export function defaultImmunizationForm(): ImmunizationFormValues {
  return {
    immunizations: [ALL_IMMUNIZATIONS_VALUE],
    pastDueEnabled: false,
    dueWithinDays: '',
    rooms: [],
    statuses: ['Active'],
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function daysBetween(a: Date, b: Date) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function resolveImmunizations(selected: string[]): ImmunizationName[] {
  if (!selected.length || selected.includes(ALL_IMMUNIZATIONS_VALUE)) {
    return [...IMMUNIZATIONS];
  }
  return selected.filter((v): v is ImmunizationName =>
    (IMMUNIZATIONS as readonly string[]).includes(v),
  );
}

export function immunizationSelectionLabel(selected: string[]) {
  if (!selected.length) return '—';
  if (selected.includes(ALL_IMMUNIZATIONS_VALUE)) return 'All Immunizations';
  return selected.join(', ');
}

type ShotSeed = {
  immunization: ImmunizationName;
  dose: string;
  dueOffsetDays: number;
  vaccinatedOffsetDays: number | null;
};

/** Deterministic mock schedule offsets from “today” (2026-08-04). */
const SHOTS: ShotSeed[] = [
  { immunization: 'Hepatitis B', dose: 'Dose 3', dueOffsetDays: -12, vaccinatedOffsetDays: null },
  { immunization: 'Polio', dose: 'Booster', dueOffsetDays: 8, vaccinatedOffsetDays: null },
  { immunization: 'MMR', dose: 'Dose 2', dueOffsetDays: 22, vaccinatedOffsetDays: null },
  { immunization: 'DTP', dose: 'Dose 4', dueOffsetDays: -3, vaccinatedOffsetDays: null },
  { immunization: 'Influenza', dose: 'Annual', dueOffsetDays: 45, vaccinatedOffsetDays: null },
  { immunization: 'Hib', dose: 'Dose 3', dueOffsetDays: 14, vaccinatedOffsetDays: -120 },
  { immunization: 'Chickenpox', dose: 'Dose 1', dueOffsetDays: 60, vaccinatedOffsetDays: null },
  { immunization: 'Hepatitis A', dose: 'Dose 2', dueOffsetDays: -40, vaccinatedOffsetDays: null },
  { immunization: 'Pneumococcal', dose: 'Dose 2', dueOffsetDays: 5, vaccinatedOffsetDays: null },
  { immunization: 'COVID-19', dose: 'Booster', dueOffsetDays: 90, vaccinatedOffsetDays: -180 },
  { immunization: 'Rotavirus', dose: 'Dose 2', dueOffsetDays: -20, vaccinatedOffsetDays: null },
  { immunization: 'BCG', dose: 'Dose 1', dueOffsetDays: -365, vaccinatedOffsetDays: -700 },
  { immunization: 'Typhoid', dose: 'Dose 1', dueOffsetDays: 28, vaccinatedOffsetDays: null },
  { immunization: 'HPV', dose: 'Dose 1', dueOffsetDays: 120, vaccinatedOffsetDays: null },
];

export function buildImmunizationRows(values: ImmunizationFormValues): Record<string, string>[] {
  const today = new Date(2026, 7, 4); // Aug 4, 2026
  const selectedShots = resolveImmunizations(values.immunizations);
  const dueWindow = values.pastDueEnabled ? Math.max(0, Number(values.dueWithinDays) || 0) : null;

  let students = [...MOCK_STUDENTS];
  if (values.rooms.length) {
    students = students.filter((s) => values.rooms.includes(s.room));
  }
  if (values.statuses.length) {
    students = students.filter((s) => values.statuses.includes(s.status));
  }

  const rows: Record<string, string>[] = [];

  students.forEach((student, si) => {
    SHOTS.forEach((shot, di) => {
      if (!selectedShots.includes(shot.immunization)) return;

      // Rotate shots across students so exports stay readable
      if ((si + di) % 3 === 0 && di > 6) return;

      const due = addDays(today, shot.dueOffsetDays + ((si % 5) - 2));
      const remaining = daysBetween(today, due);
      const vaccinated =
        shot.vaccinatedOffsetDays != null && (si + di) % 4 === 0
          ? addDays(today, shot.vaccinatedOffsetDays)
          : null;

      let status: string;
      if (vaccinated) status = 'Completed';
      else if (remaining < 0) status = 'Overdue';
      else if (remaining === 0) status = 'Due Today';
      else status = 'Upcoming';

      if (dueWindow != null) {
        // Overdue OR due within N days (exclude completed & far-future)
        const inWindow = remaining < 0 || remaining <= dueWindow;
        if (!inWindow || status === 'Completed') return;
      }

      rows.push({
        'Student Name': student.name,
        'Admission Number': student.admissionNo,
        Classroom: student.room,
        Immunization: shot.immunization,
        'Dose Number': shot.dose,
        'Vaccination Date': vaccinated ? formatDate(vaccinated) : '—',
        'Due Date': formatDate(due),
        'Days Remaining': String(remaining),
        Status: status,
        'Student Status': student.status,
        Branch: 'Main Campus',
      });
    });
  });

  return rows;
}

export function createImmunizationReport(
  values: ImmunizationFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...IMMUNIZATION_COLUMNS];
  const rows = buildImmunizationRows(values);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const immLabel = immunizationSelectionLabel(values.immunizations);
  const roomsLabel = values.rooms.length ? values.rooms.join(', ') : 'All classrooms';
  const statusLabel = values.statuses.length ? values.statuses.join(', ') : 'All statuses';

  return {
    id: `imm-${now.getTime()}`,
    kind: 'immunization',
    name: 'Immunization_Report.xlsx',
    format: 'excel',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: today,
    endDate: today,
    filterBy: 'classroom',
    selectedLabel: `${immLabel} · ${roomsLabel} · ${statusLabel}${
      values.pastDueEnabled ? ` · Due ≤ ${values.dueWithinDays || '0'} days` : ''
    }`,
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
