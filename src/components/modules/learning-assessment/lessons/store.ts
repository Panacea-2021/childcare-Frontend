import {
  DEFAULT_DEVELOPMENT_AREAS,
  DEFAULT_LABELS,
  SEED_LESSONS,
} from './constants';
import type { Lesson, LessonLabel } from './types';

const LESSONS_KEY = 'panacea.learningAssessment.lessons';
const AREAS_KEY = 'panacea.learningAssessment.devAreas';
const LABELS_KEY = 'panacea.learningAssessment.labels';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadLessons(): Lesson[] {
  if (typeof window === 'undefined') return SEED_LESSONS;
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) {
      localStorage.setItem(LESSONS_KEY, JSON.stringify(SEED_LESSONS));
      return SEED_LESSONS;
    }
    const parsed = safeParse<Lesson[]>(raw, SEED_LESSONS);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_LESSONS;
  } catch {
    return SEED_LESSONS;
  }
}

export function saveLessons(lessons: Lesson[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
  } catch (err) {
    console.error('Failed to save lessons:', err);
  }
}

export function loadDevelopmentAreas(): string[] {
  if (typeof window === 'undefined') return [...DEFAULT_DEVELOPMENT_AREAS];
  const stored = safeParse<string[]>(localStorage.getItem(AREAS_KEY), []);
  const merged = [...DEFAULT_DEVELOPMENT_AREAS, ...stored];
  return Array.from(new Set(merged.map((a) => a.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function addDevelopmentArea(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return loadDevelopmentAreas();
  if (typeof window === 'undefined') return loadDevelopmentAreas();
  const custom = safeParse<string[]>(localStorage.getItem(AREAS_KEY), []);
  if (!custom.some((a) => a.toLowerCase() === trimmed.toLowerCase())) {
    custom.push(trimmed);
    localStorage.setItem(AREAS_KEY, JSON.stringify(custom));
  }
  return loadDevelopmentAreas();
}

export function loadLessonLabels(): LessonLabel[] {
  if (typeof window === 'undefined') return DEFAULT_LABELS;
  const custom = safeParse<LessonLabel[]>(localStorage.getItem(LABELS_KEY), []);
  const byId = new Map<string, LessonLabel>();
  for (const l of [...DEFAULT_LABELS, ...custom]) byId.set(l.id, l);
  return Array.from(byId.values());
}

export function addLessonLabel(name: string, color: string): LessonLabel[] {
  const trimmed = name.trim();
  if (!trimmed) return loadLessonLabels();
  if (typeof window === 'undefined') return loadLessonLabels();
  const custom = safeParse<LessonLabel[]>(localStorage.getItem(LABELS_KEY), []);
  const exists = [...DEFAULT_LABELS, ...custom].some(
    (l) => l.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (!exists) {
    custom.push({
      id: `lbl-${Date.now()}`,
      name: trimmed,
      color: color || '#5D5FEF',
    });
    localStorage.setItem(LABELS_KEY, JSON.stringify(custom));
  }
  return loadLessonLabels();
}

export function formatLessonDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed);
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '') || null;
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts[0] === 'embed' || parts[0] === 'shorts') return parts[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

export function isValidYoutubeUrl(url: string): boolean {
  if (!url.trim()) return true;
  return Boolean(extractYoutubeId(url));
}
