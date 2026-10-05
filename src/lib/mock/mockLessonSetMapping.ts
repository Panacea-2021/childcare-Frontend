import type { LessonSetMapping, MappableClassroom } from '@/types/lessonSetMapping';
import { liveArray } from '@/lib/center-management/liveList';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';

export const MAPPABLE_CLASSROOMS: MappableClassroom[] = liveArray(() =>
  loadActiveCenterRooms().map((room) => ({ id: room.id, name: room.name })),
);

/** Default age-band lesson sets with Demo Room mapped so filters work out of the box. */
export const DEFAULT_LESSON_SET_MAPPINGS: LessonSetMapping[] = [
  { id: 'ls-elem-6-12', name: 'Elementary (6-12)', ageLabel: '6-12', classroomIds: ['demo-room'] },
  { id: 'ls-elem-6-9', name: 'Elementary (6-9)', ageLabel: '6-9', classroomIds: ['demo-room'] },
  { id: 'ls-elem-9-12', name: 'Elementary (9-12)', ageLabel: '9-12', classroomIds: ['demo-room'] },
  { id: 'ls-primary-3-6', name: 'Primary (3-6)', ageLabel: '3-6', classroomIds: ['demo-room'] },
  { id: 'ls-toddler', name: 'Toddler (1.5-3)', ageLabel: '1.5-3', classroomIds: ['demo-room'] },
];

const STORAGE_KEY = 'panacea.lessonSetMappings.v3';
const LEGACY_KEYS = ['panacea.lessonSetMappings.v2', 'panacea.lessonSetMappings.v1'];

function normalizeRow(row: LessonSetMapping): LessonSetMapping {
  const ageFromName = row.name.match(/\(([^)]+)\)\s*$/)?.[1]?.trim() ?? '';
  return {
    id: row.id,
    name: row.name,
    ageLabel: row.ageLabel || ageFromName,
    classroomIds: Array.isArray(row.classroomIds) ? row.classroomIds : [],
  };
}

/** If every row is still unmapped, treat as empty seed and use defaults. */
function isAllUnmapped(rows: LessonSetMapping[]) {
  return rows.length > 0 && rows.every((r) => !r.classroomIds.length);
}

export function loadLessonSetMappings(): LessonSetMapping[] {
  if (typeof window === 'undefined') return DEFAULT_LESSON_SET_MAPPINGS;
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = window.localStorage.getItem(key);
        if (raw) break;
      }
    }
    if (!raw) return DEFAULT_LESSON_SET_MAPPINGS;
    const parsed = JSON.parse(raw) as LessonSetMapping[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_LESSON_SET_MAPPINGS;
    const rows = parsed.map(normalizeRow);
    if (isAllUnmapped(rows)) return DEFAULT_LESSON_SET_MAPPINGS;
    return rows;
  } catch {
    return DEFAULT_LESSON_SET_MAPPINGS;
  }
}

export function saveLessonSetMappings(rows: LessonSetMapping[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function hasAnyClassroomMapped(rows: LessonSetMapping[]): boolean {
  return rows.some((r) => r.classroomIds.length > 0);
}

/** Options for Progress Tracking lesson-set dropdowns (includes All). */
export function lessonSetFilterOptions(rows: LessonSetMapping[] = DEFAULT_LESSON_SET_MAPPINGS) {
  return [
    { id: 'all', name: 'All Lesson Sets' },
    ...rows.map((r) => ({ id: r.id, name: r.name })),
  ];
}

/** Match grid age bands (`3-6`) to LSM / catalog labels (`Primary (3-6)`, `3-6`). */
export function ageBandMatchesSet(lessonAge: string | undefined, setAgeLabel: string): boolean {
  if (!lessonAge || !setAgeLabel) return true;
  const compact = (s: string) => s.replace(/\s+/g, '').toLowerCase();
  if (compact(lessonAge) === compact(setAgeLabel)) return true;
  if (lessonAge.includes(setAgeLabel) || setAgeLabel.includes(lessonAge)) return true;
  const a = lessonAge.match(/([\d.]+-[\d.]+)/)?.[1];
  const b = setAgeLabel.match(/([\d.]+-[\d.]+)/)?.[1] ?? setAgeLabel;
  return Boolean(a && b && a === b);
}

export function roomIdsForLessonSet(
  setId: string,
  rows: LessonSetMapping[],
): string[] {
  if (setId === 'all') return [];
  return rows.find((r) => r.id === setId)?.classroomIds ?? [];
}

export function ageLabelForLessonSet(
  setId: string,
  rows: LessonSetMapping[],
): string | null {
  if (setId === 'all') return null;
  return rows.find((r) => r.id === setId)?.ageLabel ?? null;
}
