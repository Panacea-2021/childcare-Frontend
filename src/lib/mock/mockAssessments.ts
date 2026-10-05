import type { StudentAssessment, PortfolioEntry } from '@/types/assessment';
import { MOCK_STUDENTS } from './mockStudents';

const AREAS = [
  'Language',
  'Mathematics',
  'Motor Skills',
  'Social-Emotional',
  'Cognitive',
  'Practical Life',
  'Sensorial',
  'Cultural Studies',
];

const SCORES = ['Emerging', 'Developing', 'Proficient', 'Mastered'] as const;

function roomOf(studentId: string): string {
  const s = MOCK_STUDENTS.find((x) => x.id === studentId);
  return s?.room ?? 'Unassigned';
}

function nameOf(studentId: string): string {
  const s = MOCK_STUDENTS.find((x) => x.id === studentId);
  return s?.name ?? 'Unknown Student';
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Deterministic pseudo-random index from a string (stable across reloads). */
function seededIndex(seed: string, size: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % size;
}

function buildAssessments(): StudentAssessment[] {
  const dates = ['2026-07-20', '2026-07-21', '2026-07-22', '2026-07-24', '2026-07-28', '2026-07-30'];
  const rows: StudentAssessment[] = [];
  const used = new Set<string>();

  // ~24 assessments across the first 16 students, one per (student, area).
  for (let i = 0; i < 24; i++) {
    const student = MOCK_STUDENTS[i % 16];
    const area = AREAS[seededIndex(`${student.id}-${i}`, AREAS.length)];
    const key = `${student.id}:${area}`;
    if (used.has(key)) continue;
    used.add(key);
    rows.push({
      id: `as-${i + 1}`,
      studentId: student.id,
      studentName: nameOf(student.id),
      roomId: `room-${(i % 4) + 1}`,
      roomName: roomOf(student.id),
      area,
      score: SCORES[seededIndex(`${student.id}${area}`, SCORES.length)],
      date: dates[i % dates.length],
      updatedBy: pick(['Priya Nair', 'Ananya Rao', 'Meera Shah', 'Rohit Menon']),
    });
  }
  return rows;
}

export const MOCK_ASSESSMENTS: StudentAssessment[] = buildAssessments();

export const MOCK_PORTFOLIO: PortfolioEntry[] = [
  {
    id: 'pf-1',
    studentId: 'student-1',
    studentName: 'Aarav Sharma',
    roomName: 'Nursery A',
    area: 'Language',
    summary: 'Retold a familiar story with sequencing and expressive vocabulary during circle time.',
    date: '2026-07-28',
  },
  {
    id: 'pf-2',
    studentId: 'student-2',
    studentName: 'Anika Patel',
    roomName: 'Nursery B',
    area: 'Mathematics',
    summary: 'Completed number rods 1–10 independently and matched numerals to quantities.',
    date: '2026-07-27',
  },
  {
    id: 'pf-3',
    studentId: 'student-3',
    studentName: 'Diya Verma',
    roomName: 'LKG',
    area: 'Practical Life',
    summary: 'Demonstrated care in setting the table — pouring water without spills and folding napkins.',
    date: '2026-07-25',
  },
  {
    id: 'pf-4',
    studentId: 'student-4',
    studentName: 'Riya Sengupta',
    roomName: 'UKG',
    area: 'Sensorial',
    summary: 'Explored the binomial cube and showed growing precision in visual discrimination.',
    date: '2026-07-24',
  },
];
