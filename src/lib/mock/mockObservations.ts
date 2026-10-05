import type { ProgressRecordDraft } from '@/types/progressTracking';
import { resolveCatalogLessonId } from '@/lib/mock/lessonResolve';

export type ObservationRecord = {
  id: string;
  date: string;
  hiddenFromParents: boolean;
  stage: NonNullable<ProgressRecordDraft['stage']>;
  note: string;
  studentIds: string[];
  lessonIds: string[];
  createdAt: string;
  recordType: 'observation';
  classroom: string;
};

const STORAGE_KEY = 'panacea.observations.v2';
const LEGACY_KEY = 'panacea.observations.v1';

const SEED: ObservationRecord[] = [
  {
    id: 'obs-seed-1',
    date: '2026-08-03',
    hiddenFromParents: false,
    stage: 'introduced',
    note: 'Mia explored Story of the Created Image with focused attention.',
    studentIds: ['st-mia'],
    lessonIds: ['-OwY4Fa-OQiQCcuKs3tA'],
    createdAt: '2026-08-03T09:15:00.000Z',
    recordType: 'observation',
    classroom: 'Demo Room',
  },
  {
    id: 'obs-seed-2',
    date: '2026-08-02',
    hiddenFromParents: true,
    stage: 'practiced',
    note: 'Alex practiced Experiments with Color independently.',
    studentIds: ['st-alex'],
    lessonIds: ['-OwY4EMCkVNmCDRi7A58'],
    createdAt: '2026-08-02T14:40:00.000Z',
    recordType: 'observation',
    classroom: 'Demo Room',
  },
  {
    id: 'obs-seed-3',
    date: '2026-07-28',
    hiddenFromParents: false,
    stage: 'mastered',
    note: 'Narasimha demonstrated Parts of a Plant with confidence.',
    studentIds: ['st-nara'],
    lessonIds: ['-OwY4FM8lfNe2UzUsOFc'],
    createdAt: '2026-07-28T11:05:00.000Z',
    recordType: 'observation',
    classroom: 'Demo Room',
  },
];

function migrateLessonIds(rows: ObservationRecord[]): ObservationRecord[] {
  return rows.map((r) => ({
    ...r,
    lessonIds: r.lessonIds
      .map((id) => resolveCatalogLessonId(id) ?? id)
      .filter(Boolean),
  }));
}

export function loadObservations(): ObservationRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw =
      window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED.map((r) => ({ ...r }));
    }
    const parsed = JSON.parse(raw) as ObservationRecord[];
    if (!Array.isArray(parsed)) return SEED.map((r) => ({ ...r }));
    const migrated = migrateLessonIds(parsed);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return SEED.map((r) => ({ ...r }));
  }
}

export function saveObservations(rows: ObservationRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function draftToObservation(
  draft: ProgressRecordDraft,
  classroom = 'Demo Room',
): ObservationRecord | null {
  if (!draft.stage) return null;
  return {
    id: `obs-${Date.now()}`,
    date: draft.date,
    hiddenFromParents: draft.hiddenFromParents,
    stage: draft.stage,
    note: draft.note,
    studentIds: draft.studentIds,
    lessonIds: draft.lessonIds,
    createdAt: new Date().toISOString(),
    recordType: 'observation',
    classroom,
  };
}
