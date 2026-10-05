/**
 * In-memory + localStorage assignments per program.
 * Keeps Assign Students/Staff in sync with View/Edit tabs across navigation.
 */

import { students as seedStudents } from '@/lib/moduleData';
import { enrollStudentsInProgram } from '@/lib/center-management/studentsStore';
import { updateProgram } from '@/lib/programsStore';
import type { WeekDay } from '@/lib/center-management/types';

export type ProgramAssignmentStatus =
  | 'Active'
  | 'Completed'
  | 'Upcoming'
  | 'On hold'
  | 'Withdrawn'
  | 'Inactive';

export type ProgramPersonStatus = 'Active' | 'On hold' | 'Withdrawn' | 'Inactive' | 'Signed up';

export type ProgramAssignedStudent = {
  id: string;
  /** Center-management student id — used for student profile Programs tab sync */
  studentId?: string;
  name: string;
  age: string;
  studentStatus: ProgramPersonStatus;
  status: ProgramAssignmentStatus;
  startDate: string;
  endDate: string;
  days: string[];
};

export type ProgramAssignedStaff = {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  startDate: string;
  endDate: string;
  days: string[];
  rooms?: string;
};

export type ProgramAssignments = {
  students: ProgramAssignedStudent[];
  staff: ProgramAssignedStaff[];
};

const STORAGE_KEY = 'panacea.program.assignments.v1';

const SAMPLE_STUDENTS: ProgramAssignedStudent[] = [
  {
    id: 'avs1',
    name: 'Alex Demo Student',
    age: '9 year 3 month',
    studentStatus: 'Active',
    status: 'Completed',
    startDate: '01/07/2026',
    endDate: '31/07/2026',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    id: 'avs2',
    name: 'Abhi Demo Student',
    age: '4 year 1 month',
    studentStatus: 'Active',
    status: 'Active',
    startDate: '01/07/2026',
    endDate: '01/01/2031',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
];

type Cache = Record<string, ProgramAssignments>;

function emptyAssignments(): ProgramAssignments {
  return { students: [], staff: [] };
}

function defaultAssignments(programName: string): ProgramAssignments {
  if (programName === 'Toddler Program (Sample)') {
    return {
      students: SAMPLE_STUDENTS.map((s) => ({ ...s, days: [...s.days] })),
      staff: [],
    };
  }
  return emptyAssignments();
}

function readCache(): Cache {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Cache;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeCache(cache: Cache) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore quota */
  }
}

let memory: Cache | null = null;

function ensureCache(): Cache {
  if (!memory) memory = readCache();
  return memory;
}

function cloneAssignments(data: ProgramAssignments): ProgramAssignments {
  return {
    students: data.students.map((s) => ({ ...s, days: [...s.days] })),
    staff: data.staff.map((s) => ({ ...s, days: [...s.days] })),
  };
}

function activeStudentCount(students: ProgramAssignedStudent[]) {
  return students.filter(
    (s) => s.status === 'Active' || (s.status !== 'Completed' && s.studentStatus === 'Active'),
  ).length;
}

function syncOccupancy(programId: string, students: ProgramAssignedStudent[]) {
  updateProgram(programId, { occupancy: activeStudentCount(students) });
}

export function getProgramAssignments(
  programId: string,
  programName: string,
): ProgramAssignments {
  const cache = ensureCache();
  if (!cache[programId]) {
    cache[programId] = defaultAssignments(programName);
    writeCache(cache);
    if (cache[programId].students.length) {
      syncOccupancy(programId, cache[programId].students);
    }
  }
  return cloneAssignments(cache[programId]);
}

export function setProgramStudents(
  programId: string,
  programName: string,
  students: ProgramAssignedStudent[],
  opts?: { labels?: string[] },
): ProgramAssignments {
  const cache = ensureCache();
  const current = cache[programId] ?? defaultAssignments(programName);
  cache[programId] = {
    ...current,
    students: students.map((s) => ({ ...s, days: [...s.days] })),
  };
  writeCache(cache);
  syncOccupancy(programId, cache[programId].students);

  enrollStudentsInProgram(
    students
      .filter((s) => s.studentId)
      .map((s) => ({
        studentId: s.studentId!,
        programId,
        programName,
        startDate: s.startDate,
        endDate: s.endDate,
        days: s.days as WeekDay[],
        labels: opts?.labels ?? [],
        stage: s.status === 'Completed' ? 'Completed' : s.status === 'Upcoming' ? 'Upcoming' : 'Active',
      })),
  );

  emit();
  return cloneAssignments(cache[programId]);
}

export function setProgramStaff(
  programId: string,
  programName: string,
  staff: ProgramAssignedStaff[],
): ProgramAssignments {
  const cache = ensureCache();
  const current = cache[programId] ?? defaultAssignments(programName);
  cache[programId] = {
    ...current,
    staff: staff.map((s) => ({ ...s, days: [...s.days] })),
  };
  writeCache(cache);
  emit();
  return cloneAssignments(cache[programId]);
}

export function removeProgramAssignments(programId: string) {
  const cache = ensureCache();
  if (!cache[programId]) return;
  delete cache[programId];
  writeCache(cache);
  emit();
}

export function listAllAssignedStudents(): ProgramAssignedStudent[] {
  const cache = ensureCache();
  return Object.values(cache).flatMap((a) => a.students.map((s) => ({ ...s, days: [...s.days] })));
}

function parseDisplayDate(raw: string): Date | null {
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfWeekMon(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

function endOfWeekSun(d: Date) {
  const start = startOfWeekMon(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/** Live insight cards for Program list / Dashboard. */
export function getAssignmentInsightStudents() {
  const all = listAllAssignedStudents();
  const now = new Date();
  const weekStart = startOfWeekMon(now);
  const weekEnd = endOfWeekSun(now);
  const inThisWeek = (raw: string) => {
    const d = parseDisplayDate(raw);
    if (!d) return false;
    return d >= weekStart && d <= weekEnd;
  };

  const toShort = (raw: string) => {
    const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return raw;
    return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3].slice(-2)}`;
  };

  const starting = all
    .filter((s) => s.startDate && inThisWeek(s.startDate))
    .map((s) => ({ id: s.id, name: s.name, date: toShort(s.startDate) }));
  const leaving = all
    .filter((s) => s.endDate && inThisWeek(s.endDate))
    .map((s) => ({ id: s.id, name: s.name, date: toShort(s.endDate) }));

  const assignedIds = new Set(all.map((s) => s.id));
  const without = seedStudents
    .filter((s) => !assignedIds.has(s.id))
    .map((s) => ({ id: s.id, name: s.name }));

  return { starting, leaving, without };
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeProgramAssignments(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
