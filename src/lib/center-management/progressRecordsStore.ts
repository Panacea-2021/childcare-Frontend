import type { ProgressRecord, ProgressRecordDraft, ProgressRecordKind } from '@/types/progressRecord';

const STORAGE_KEY = 'panacea.center.progress-records.v1';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatSeedDate(offsetDays = 0) {
  const d = new Date(2026, 7, 8);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

const SEED: ProgressRecord[] = [
  {
    id: 'pr-obs-alex-1',
    kind: 'observation',
    status: 'published',
    date: formatSeedDate(0),
    hiddenFromParents: true,
    studentIds: ['st-alex'],
    staffIds: ['staff-malika'],
    ageBands: ['Primary (3-6)'],
    developmentAreas: ['Mathematics'],
    lessonIds: ['-OwY4FjbPkdJ8wwRoBEd'],
    description: 'New Syllabus',
    nextSteps: 'Up coming',
    mediaNames: [],
    createdAt: '2026-08-08T10:15:00.000Z',
    updatedAt: '2026-08-08T10:15:00.000Z',
    authorId: 'staff-malika',
    authorName: 'Malika Thimisetty',
    commentCount: 0,
  },
  {
    id: 'pr-refl-alex-1',
    kind: 'reflection',
    status: 'published',
    date: formatSeedDate(-2),
    hiddenFromParents: true,
    studentIds: ['st-alex'],
    staffIds: ['staff-malika'],
    ageBands: ['Primary (3-6)'],
    developmentAreas: ['Language'],
    lessonIds: [],
    description: 'Alex is settling into peer conversations during circle time with more confidence.',
    nextSteps: 'Invite him to lead a short sharing moment next week.',
    mediaNames: [],
    createdAt: '2026-08-06T14:20:00.000Z',
    updatedAt: '2026-08-06T14:20:00.000Z',
    authorId: 'staff-malika',
    authorName: 'Malika Thimisetty',
    commentCount: 1,
  },
  {
    id: 'pr-con-alex-1',
    kind: 'concern',
    status: 'published',
    date: formatSeedDate(-1),
    hiddenFromParents: true,
    studentIds: ['st-alex'],
    staffIds: ['staff-darshan'],
    ageBands: [],
    developmentAreas: [],
    lessonIds: [],
    description: 'Anxiety at outdoor transition — Alex hesitated leaving the classroom for outdoor play.',
    nextSteps: 'Pair with a buddy and preview the schedule visually before outdoor time.',
    mediaNames: [],
    createdAt: '2026-08-07T09:05:00.000Z',
    updatedAt: '2026-08-07T09:05:00.000Z',
    authorId: 'staff-darshan',
    authorName: 'Darshan',
    commentCount: 0,
  },
];

function readRaw(): ProgressRecord[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProgressRecord[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadProgressRecords(): ProgressRecord[] {
  const existing = readRaw();
  if (!existing) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
    }
    return SEED.map((r) => ({ ...r }));
  }
  return existing.map((r) => ({ ...r }));
}

export function saveProgressRecords(rows: ProgressRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export function createRecordId(kind: ProgressRecordKind) {
  return `pr-${kind.slice(0, 3)}-${Date.now()}`;
}

export function emptyDraft(
  kind: ProgressRecordKind,
  presetStudentId?: string | null,
): ProgressRecordDraft {
  const alwaysHidden = kind !== 'observation';
  return {
    kind,
    status: 'published',
    date: todayKey(),
    hiddenFromParents: alwaysHidden ? true : false,
    studentIds: presetStudentId ? [presetStudentId] : [],
    staffIds: [],
    ageBands: [],
    developmentAreas: [],
    lessonIds: [],
    description: '',
    nextSteps: '',
    mediaNames: [],
  };
}

export function draftFromRecord(record: ProgressRecord): ProgressRecordDraft {
  return {
    kind: record.kind,
    status: record.status,
    date: record.date,
    hiddenFromParents: record.hiddenFromParents,
    studentIds: [...record.studentIds],
    staffIds: [...record.staffIds],
    ageBands: [...record.ageBands],
    developmentAreas: [...record.developmentAreas],
    lessonIds: [...record.lessonIds],
    description: record.description,
    nextSteps: record.nextSteps,
    mediaNames: [...record.mediaNames],
  };
}

export function upsertProgressRecord(
  rows: ProgressRecord[],
  draft: ProgressRecordDraft,
  opts: {
    id?: string;
    authorId?: string;
    authorName?: string;
  } = {},
): ProgressRecord[] {
  const now = new Date().toISOString();
  const authorId = opts.authorId ?? 'staff-malika';
  const authorName = opts.authorName ?? 'Malika Thimisetty';
  const existing = opts.id ? rows.find((r) => r.id === opts.id) : undefined;

  const next: ProgressRecord = {
    id: existing?.id ?? createRecordId(draft.kind),
    kind: draft.kind,
    status: draft.status,
    date: draft.date,
    hiddenFromParents: draft.kind === 'observation' ? draft.hiddenFromParents : true,
    studentIds: draft.studentIds,
    staffIds: draft.staffIds,
    ageBands: draft.ageBands,
    developmentAreas: draft.developmentAreas,
    lessonIds: draft.lessonIds,
    description: draft.description.trim(),
    nextSteps: draft.nextSteps.trim(),
    mediaNames: draft.mediaNames,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    authorId,
    authorName,
    commentCount: existing?.commentCount ?? 0,
  };

  if (existing) {
    return rows.map((r) => (r.id === existing.id ? next : r));
  }
  return [next, ...rows];
}

export function deleteProgressRecord(rows: ProgressRecord[], id: string): ProgressRecord[] {
  return rows.filter((r) => r.id !== id);
}

export function kindLabel(kind: ProgressRecordKind) {
  if (kind === 'observation') return 'Observation';
  if (kind === 'reflection') return 'Reflection';
  return 'Concern';
}

export function kindPlural(kind: ProgressRecordKind) {
  if (kind === 'observation') return 'Observations';
  if (kind === 'reflection') return 'Reflections';
  return 'Concerns';
}
