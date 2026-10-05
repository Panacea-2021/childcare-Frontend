import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate } from '@/components/reports/attendance-summary/utils';
import type {
  AgeGroupAnalytics,
  GeneratedExcelReport,
} from '@/components/reports/shared/generatedReport';

export const AGE_GROUPS = [
  '0–1 Years',
  '2–3 Years',
  '4–5 Years',
  '6–7 Years',
  '8+ Years',
] as const;

export type AgeGroupLabel = (typeof AGE_GROUPS)[number];

export const AGE_GROUP_COLUMNS = ['Age Group', 'Student Count', 'Percentage'] as const;

export type StudentCountAgeFormValues = {
  startDate: string;
  endDate: string;
};

type MockAdmittedStudent = {
  id: string;
  name: string;
  admissionDate: string; // YYYY-MM-DD
  ageYears: number;
};

/** Students with admission dates spanning mid-2025 → Aug 2026 for realistic filtering. */
const MOCK_ADMITTED: MockAdmittedStudent[] = [
  { id: 'a1', name: 'Olivia Das', admissionDate: '2025-09-12', ageYears: 0.9 },
  { id: 'a2', name: 'Leo Fernandes', admissionDate: '2025-10-03', ageYears: 1.2 },
  { id: 'a3', name: 'Mia Patel', admissionDate: '2025-11-18', ageYears: 2.4 },
  { id: 'a4', name: 'Ava Joshi', admissionDate: '2025-12-02', ageYears: 2.8 },
  { id: 'a5', name: 'Rohan Mehta', admissionDate: '2026-01-09', ageYears: 3.1 },
  { id: 'a6', name: 'Aarav Sharma', admissionDate: '2026-01-22', ageYears: 3.6 },
  { id: 'a7', name: 'Isha Nair', admissionDate: '2026-02-14', ageYears: 4.0 },
  { id: 'a8', name: 'Sofia Mendes', admissionDate: '2026-02-28', ageYears: 4.5 },
  { id: 'a9', name: 'Kabir Singh', admissionDate: '2026-03-11', ageYears: 4.9 },
  { id: 'a10', name: 'Liam Chen', admissionDate: '2026-03-25', ageYears: 5.2 },
  { id: 'a11', name: 'Emma Watson', admissionDate: '2026-04-08', ageYears: 5.8 },
  { id: 'a12', name: 'Noah Kapoor', admissionDate: '2026-04-19', ageYears: 6.1 },
  { id: 'a13', name: 'Zara Khan', admissionDate: '2026-05-02', ageYears: 6.4 },
  { id: 'a14', name: 'Mason Verma', admissionDate: '2026-05-16', ageYears: 6.9 },
  { id: 'a15', name: 'Diya Rao', admissionDate: '2026-06-01', ageYears: 7.3 },
  { id: 'a16', name: 'Ethan Rao', admissionDate: '2026-06-20', ageYears: 7.7 },
  { id: 'a17', name: 'Lucas Nair', admissionDate: '2026-07-05', ageYears: 8.2 },
  { id: 'a18', name: 'Isabella Khan', admissionDate: '2026-07-18', ageYears: 8.8 },
  { id: 'a19', name: 'Vihaan Desai', admissionDate: '2026-07-29', ageYears: 9.4 },
  { id: 'a20', name: 'Anaya Pillai', admissionDate: '2026-08-02', ageYears: 10.1 },
  { id: 'a21', name: 'Arjun Bose', admissionDate: '2026-05-28', ageYears: 1.6 },
  { id: 'a22', name: 'Sara Malik', admissionDate: '2026-06-12', ageYears: 2.1 },
  { id: 'a23', name: 'Hugo Silva', admissionDate: '2026-03-07', ageYears: 5.5 },
  { id: 'a24', name: 'Nina Costa', admissionDate: '2025-08-21', ageYears: 3.3 },
  /* Dense cluster for the screenshot date range (29/07/2026 → 04/08/2026) */
  { id: 'a25', name: 'Priya Menon', admissionDate: '2026-07-29', ageYears: 0.7 },
  { id: 'a26', name: 'Jake Thomas', admissionDate: '2026-07-30', ageYears: 1.4 },
  { id: 'a27', name: 'Myra Kapoor', admissionDate: '2026-07-30', ageYears: 2.6 },
  { id: 'a28', name: 'Dev Sharma', admissionDate: '2026-07-31', ageYears: 3.2 },
  { id: 'a29', name: 'Elena Cruz', admissionDate: '2026-07-31', ageYears: 4.3 },
  { id: 'a30', name: 'Omar Farooq', admissionDate: '2026-08-01', ageYears: 5.1 },
  { id: 'a31', name: 'Lily Wong', admissionDate: '2026-08-01', ageYears: 5.9 },
  { id: 'a32', name: "Ryan D'Souza", admissionDate: '2026-08-02', ageYears: 6.5 },
  { id: 'a33', name: 'Aisha Rahman', admissionDate: '2026-08-03', ageYears: 7.1 },
  { id: 'a34', name: 'Theo Blake', admissionDate: '2026-08-03', ageYears: 7.8 },
  { id: 'a35', name: 'Kiara Jain', admissionDate: '2026-08-04', ageYears: 8.5 },
  { id: 'a36', name: 'Mateo Ruiz', admissionDate: '2026-08-04', ageYears: 9.0 },
];

export function defaultStudentCountAgeForm(): StudentCountAgeFormValues {
  return {
    startDate: '2026-07-29',
    endDate: '2026-08-04',
  };
}

export function ageGroupForYears(years: number): AgeGroupLabel {
  if (years < 2) return '0–1 Years';
  if (years < 4) return '2–3 Years';
  if (years < 6) return '4–5 Years';
  if (years < 8) return '6–7 Years';
  return '8+ Years';
}

function formatAgeYears(years: number) {
  const whole = Math.floor(years);
  const months = Math.round((years - whole) * 12);
  if (months <= 0) return `${whole} yr${whole === 1 ? '' : 's'}`;
  if (whole === 0) return `${months} mo`;
  return `${whole}y ${months}m`;
}

export function filterAdmittedStudents(startDate: string, endDate: string) {
  return MOCK_ADMITTED.filter((s) => s.admissionDate >= startDate && s.admissionDate <= endDate);
}

export function buildAgeGroupRows(startDate: string, endDate: string): Record<string, string>[] {
  const admitted = filterAdmittedStudents(startDate, endDate);
  const total = admitted.length;
  const counts = new Map<AgeGroupLabel, number>(AGE_GROUPS.map((g) => [g, 0]));

  admitted.forEach((s) => {
    const group = ageGroupForYears(s.ageYears);
    counts.set(group, (counts.get(group) ?? 0) + 1);
  });

  return AGE_GROUPS.map((group) => {
    const count = counts.get(group) ?? 0;
    const pct = total === 0 ? 0 : (count / total) * 100;
    return {
      'Age Group': group,
      'Student Count': String(count),
      Percentage: `${pct.toFixed(1)}%`,
    };
  });
}

export function buildAgeGroupAnalytics(startDate: string, endDate: string): AgeGroupAnalytics {
  const admitted = filterAdmittedStudents(startDate, endDate);
  if (!admitted.length) {
    return {
      totalStudents: 0,
      averageAge: 0,
      youngestAge: 0,
      oldestAge: 0,
      youngestLabel: '—',
      oldestLabel: '—',
    };
  }

  const ages = admitted.map((s) => s.ageYears);
  const sum = ages.reduce((a, b) => a + b, 0);
  const youngest = admitted.reduce((best, s) => (s.ageYears < best.ageYears ? s : best));
  const oldest = admitted.reduce((best, s) => (s.ageYears > best.ageYears ? s : best));

  return {
    totalStudents: admitted.length,
    averageAge: Number((sum / admitted.length).toFixed(1)),
    youngestAge: youngest.ageYears,
    oldestAge: oldest.ageYears,
    youngestLabel: `${youngest.name} · ${formatAgeYears(youngest.ageYears)}`,
    oldestLabel: `${oldest.name} · ${formatAgeYears(oldest.ageYears)}`,
  };
}

export function createStudentCountAgeReport(
  values: StudentCountAgeFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const columns = [...AGE_GROUP_COLUMNS];
  const rows = buildAgeGroupRows(values.startDate, values.endDate);
  const analytics = buildAgeGroupAnalytics(values.startDate, values.endDate);
  const now = new Date();

  return {
    id: `scag-${now.getTime()}`,
    kind: 'student-count-age',
    name: 'Student_Count_By_Age_Group_Report.xlsx',
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: `${toDisplayDate(values.startDate)} – ${toDisplayDate(values.endDate)}`,
    selectedColumns: columns,
    recordCount: analytics.totalStudents,
    status: 'Generated',
    columns,
    rows,
    format: 'excel',
    analytics,
  };
}
