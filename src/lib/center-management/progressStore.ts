'use client';

import { loadAreas } from '@/components/modules/learning-assessment/manage/store';
import { getLatestPublishedAssessment } from '@/lib/center-management/profileAssessmentsStore';

export type ProgressLevel = 'Secure' | 'Emerging' | null;

export type DevelopmentArea = {
  id: string;
  name: string;
  level: ProgressLevel;
  /** Raw scale label from the latest assessment (e.g. Proficient). */
  scaleLevel?: string;
  notes?: string;
};

export type ProgressEntryKind = 'observation' | 'reflection' | 'concern';

export type ProgressEntry = {
  id: string;
  kind: ProgressEntryKind;
  title: string;
  body: string;
  createdAt: string;
  author: string;
};

export type StudentProgress = {
  studentId: string;
  areas: DevelopmentArea[];
  entries: ProgressEntry[];
  lastAssessmentAt?: string;
};

const STORAGE_KEY = 'panacea.center.student-progress.v1';

export const DEFAULT_AREAS: { id: string; name: string }[] = [
  { id: 'area-pse', name: 'Personal, Social & Emotional' },
  { id: 'area-com', name: 'Communication & Language' },
  { id: 'area-phy', name: 'Physical Development' },
  { id: 'area-lit', name: 'Literacy' },
  { id: 'area-math', name: 'Mathematics' },
  { id: 'area-world', name: 'Understanding the World' },
  { id: 'area-arts', name: 'Expressive Arts & Design' },
];

function blankAreas(): DevelopmentArea[] {
  return DEFAULT_AREAS.map((a) => ({ ...a, level: null }));
}

function canUseStorage() {
  return typeof window !== 'undefined';
}

function readAll(): Record<string, StudentProgress> {
  if (!canUseStorage()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, StudentProgress>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, StudentProgress>) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function loadStudentProgress(studentId: string): StudentProgress {
  const all = readAll();
  const existing = all[studentId];
  if (existing?.areas?.length) {
    return {
      ...existing,
      entries: existing.entries ?? [],
    };
  }
  return {
    studentId,
    areas: blankAreas(),
    entries: [],
  };
}

export function saveStudentProgress(progress: StudentProgress) {
  const all = readAll();
  all[progress.studentId] = progress;
  writeAll(all);
}

export function createProgressId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const PROGRESS_EVENT = 'panacea.center.student-progress';

/** Map learning-assessment scale labels to tracker Secure / Emerging bands. */
export function mapScaleLevelToProgress(level?: string): ProgressLevel {
  if (!level?.trim()) return null;
  const lower = level.trim().toLowerCase();
  if (['proficient', 'mastered', 'advanced', 'secure', 'exceeding'].includes(lower)) {
    return 'Secure';
  }
  if (['emerging', 'developing', 'working toward', 'beginning'].includes(lower)) {
    return 'Emerging';
  }
  return 'Emerging';
}

function areasFromAssessmentLevels(areaLevels: Record<string, string>): DevelopmentArea[] {
  return loadAreas()
    .filter((area) => area.active)
    .map((area) => {
      const scaleLevel = areaLevels[area.id]?.trim();
      return {
        id: area.id,
        name: area.name,
        level: mapScaleLevelToProgress(scaleLevel),
        scaleLevel: scaleLevel || undefined,
      };
    });
}

/** Persist assessed development areas from a saved profile assessment. */
export function applyAssessmentToProgress(
  studentId: string,
  areaLevels: Record<string, string>,
  assessedAt?: string,
) {
  const areas = areasFromAssessmentLevels(areaLevels);
  const existing = loadStudentProgress(studentId);
  saveStudentProgress({
    ...existing,
    studentId,
    areas,
    lastAssessmentAt: assessedAt ?? new Date().toISOString(),
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(PROGRESS_EVENT));
  }
}

/** Progress tracker view — merges stored progress with the latest published assessment. */
export function buildStudentProgressView(studentId: string): StudentProgress {
  const stored = loadStudentProgress(studentId);
  const latest = getLatestPublishedAssessment(studentId);
  if (!latest || !Object.keys(latest.areaLevels).length) {
    return stored;
  }

  const areas = areasFromAssessmentLevels(latest.areaLevels);
  const assessed = areas.some((area) => area.scaleLevel || area.level);
  if (!assessed) return stored;

  return {
    ...stored,
    studentId,
    areas,
    lastAssessmentAt: latest.updatedAt,
  };
}

export function subscribeStudentProgress(cb: () => void) {
  if (!canUseStorage()) return () => undefined;
  const handler = () => cb();
  window.addEventListener(PROGRESS_EVENT, handler);
  window.addEventListener('panacea.profile-assessments', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, handler);
    window.removeEventListener('panacea.profile-assessments', handler);
    window.removeEventListener('storage', handler);
  };
}
