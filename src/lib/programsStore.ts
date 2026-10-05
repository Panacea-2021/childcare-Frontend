/**
 * Shared Program catalog for Program list & Program Dashboard.
 */

export type ProgramStatus = 'Active' | 'Expired' | 'Upcoming';

export type ProgramRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  durationLabel: string;
  days: string[];
  room: string;
  rooms?: string[];
  feePlanCount: number;
  status: ProgramStatus;
  occupancy: number;
  labels: string[];
  maxStudents?: number;
  maxStaff?: number;
  allowExtraStudents?: boolean;
  allowExtraStaff?: boolean;
  extraStudents?: number;
  extraStaff?: number;
  minAgeYears?: number;
  minAgeMonths?: number;
  maxAgeYears?: number;
  maxAgeMonths?: number;
};

export type ProgramInsightStudent = {
  id: string;
  name: string;
};

const STORAGE_KEY = 'panacea.programs.catalog.v1';

const SEED_PROGRAMS: ProgramRecord[] = [
  {
    id: 'p1',
    name: 'ABC',
    startDate: '01/07/2026',
    endDate: '31/07/2026',
    startTime: '1:00 PM',
    endTime: '1:02 PM',
    durationLabel: '2 minutes',
    days: ['Tue'],
    room: 'Demo Room',
    rooms: ['Demo Room'],
    feePlanCount: 0,
    status: 'Active',
    occupancy: 0,
    labels: [],
    maxStudents: 20,
    maxStaff: 20,
    minAgeYears: 0,
    minAgeMonths: 0,
    maxAgeYears: 0,
    maxAgeMonths: 0,
  },
  {
    id: 'p2',
    name: 'Toddler Program (Sample)',
    startDate: '01/07/2026',
    endDate: '',
    startTime: '8:30 AM',
    endTime: '3:30 PM',
    durationLabel: '7 hours',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    room: 'Demo Room',
    rooms: ['Demo Room'],
    feePlanCount: 0,
    status: 'Active',
    occupancy: 1,
    labels: [],
    maxStudents: 20,
    maxStaff: 20,
    minAgeYears: 0,
    minAgeMonths: 0,
    maxAgeYears: 0,
    maxAgeMonths: 0,
  },
];

function clonePrograms(list: ProgramRecord[]): ProgramRecord[] {
  return list.map((p) => ({
    ...p,
    days: [...p.days],
    labels: [...p.labels],
    rooms: p.rooms ? [...p.rooms] : undefined,
  }));
}

function loadFromStorage(): ProgramRecord[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgramRecord[];
    if (!Array.isArray(parsed)) return null;
    return clonePrograms(parsed);
  } catch {
    return null;
  }
}

function saveToStorage(list: ProgramRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

let cache: ProgramRecord[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function ensureCache(): ProgramRecord[] {
  if (cache) return cache;
  cache = loadFromStorage() ?? clonePrograms(SEED_PROGRAMS);
  return cache;
}

export function getPrograms(): ProgramRecord[] {
  return clonePrograms(ensureCache());
}

export function setPrograms(next: ProgramRecord[] | ((prev: ProgramRecord[]) => ProgramRecord[])) {
  const prev = ensureCache();
  const resolved = typeof next === 'function' ? next(clonePrograms(prev)) : clonePrograms(next);
  cache = resolved;
  saveToStorage(resolved);
  emit();
}

export function addProgram(program: ProgramRecord) {
  setPrograms((items) => [program, ...items]);
}

export function removeProgram(id: string) {
  setPrograms((items) => items.filter((p) => p.id !== id));
}

export function updateProgram(id: string, patch: Partial<ProgramRecord>) {
  setPrograms((items) =>
    items.map((p) =>
      p.id === id
        ? {
            ...p,
            ...patch,
            days: patch.days ? [...patch.days] : p.days,
            labels: patch.labels ? [...patch.labels] : p.labels,
            rooms: patch.rooms ? [...patch.rooms] : p.rooms,
          }
        : p,
    ),
  );
}

export function subscribePrograms(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getProgramKpis() {
  return {
    totalPrograms: ensureCache().length,
  };
}

/** Insight lists are computed live in UI via programAssignmentsStore helpers. */
export const MOCK_STUDENTS_STARTING: ProgramInsightStudent[] = [];
export const MOCK_STUDENTS_LEAVING: ProgramInsightStudent[] = [];
export const MOCK_STUDENTS_WITHOUT_PROGRAM: ProgramInsightStudent[] = [];
