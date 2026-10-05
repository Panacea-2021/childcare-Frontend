import { loadScales } from '@/components/modules/learning-assessment/manage/store';
import type {
  AssessmentTemplate,
  ProfileAssessment,
  ProfileAssessmentDraft,
} from '@/types/profileAssessment';

const STORAGE_KEY = 'panacea.center.profile-assessments.v1';

const BASE_TEMPLATES: Array<Omit<AssessmentTemplate, 'scaleId'> & { scaleId?: string }> = [
  {
    id: 'tmpl-term',
    name: 'Term Assessment',
    scaleId: 'scale-4',
    description: 'Full-term developmental review across learning areas.',
  },
  {
    id: 'tmpl-progress-check',
    name: 'Progress Check',
    scaleId: 'scale-3',
    description: 'Mid-cycle progress check for key milestones.',
  },
  {
    id: 'tmpl-eyfs',
    name: 'EYFS Snapshot',
    scaleId: 'scale-4',
    description: 'Snapshot across EYFS-style development areas.',
  },
  {
    id: 'tmpl-parent-share',
    name: 'Parent Share Summary',
    scaleId: 'scale-3',
    description: 'Parent-facing summary with next steps.',
  },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  dt.setDate(dt.getDate() + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

/** Templates resolved against Learning Manage scales (active scales preferred). */
export function loadAssessmentTemplates(): AssessmentTemplate[] {
  const scales = loadScales();
  const active = scales.filter((s) => s.active);
  const fallback = scales[0]?.id ?? 'scale-4';
  return BASE_TEMPLATES.map((t) => {
    const preferred = t.scaleId ?? fallback;
    const scaleId =
      active.find((s) => s.id === preferred)?.id ??
      scales.find((s) => s.id === preferred)?.id ??
      active[0]?.id ??
      fallback;
    return {
      id: t.id,
      name: t.name,
      description: t.description,
      scaleId,
    };
  });
}

export function emptyAssessmentDraft(): ProfileAssessmentDraft {
  const from = todayKey();
  return {
    templateId: '',
    periodFrom: from,
    periodTo: addDays(from, 2),
    staffComments: '',
    nextSteps: '',
    mediaNames: [],
    sharedWithParents: false,
    status: 'published',
    areaLevels: {},
  };
}

function readRaw(): ProfileAssessment[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ProfileAssessment[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadProfileAssessments(): ProfileAssessment[] {
  return readRaw()?.map((r) => ({ ...r, areaLevels: { ...r.areaLevels } })) ?? [];
}

export function saveProfileAssessments(rows: ProfileAssessment[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent('panacea.profile-assessments'));
}

export function getLatestPublishedAssessment(studentId: string): ProfileAssessment | null {
  return (
    loadProfileAssessments()
      .filter((row) => row.studentId === studentId && row.status === 'published')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null
  );
}

export function upsertProfileAssessment(
  rows: ProfileAssessment[],
  draft: ProfileAssessmentDraft,
  opts: {
    studentId: string;
    templateName: string;
    scaleId: string;
    id?: string;
    authorName?: string;
  },
): ProfileAssessment[] {
  const now = new Date().toISOString();
  const existing = opts.id ? rows.find((r) => r.id === opts.id) : undefined;
  const next: ProfileAssessment = {
    id: existing?.id ?? `pa-${Date.now()}`,
    studentId: opts.studentId,
    templateId: draft.templateId,
    templateName: opts.templateName,
    scaleId: opts.scaleId,
    periodFrom: draft.periodFrom,
    periodTo: draft.periodTo,
    staffComments: draft.staffComments.trim(),
    nextSteps: draft.nextSteps.trim(),
    mediaNames: [...draft.mediaNames],
    sharedWithParents: draft.sharedWithParents,
    status: draft.status,
    areaLevels: { ...draft.areaLevels },
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    authorName: opts.authorName ?? 'Malika Thimisetty',
  };
  if (existing) return rows.map((r) => (r.id === existing.id ? next : r));
  return [next, ...rows];
}
