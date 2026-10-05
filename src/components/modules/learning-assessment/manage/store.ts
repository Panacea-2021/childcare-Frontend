import type { DevelopmentArea, LearningSettings, ScoringScale } from '@/types/learningManage';
import { DEFAULT_AREAS, DEFAULT_SCALES, DEFAULT_SETTINGS } from '@/lib/mock/mockLearningManage';

const AREAS_KEY = 'panacea.learningAssessment.manage.areas';
const SCALES_KEY = 'panacea.learningAssessment.manage.scales';
const SETTINGS_KEY = 'panacea.learningAssessment.manage.settings';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadAreas(): DevelopmentArea[] {
  if (typeof window === 'undefined') return DEFAULT_AREAS;
  try {
    const raw = localStorage.getItem(AREAS_KEY);
    if (!raw) {
      localStorage.setItem(AREAS_KEY, JSON.stringify(DEFAULT_AREAS));
      return DEFAULT_AREAS;
    }
    const parsed = safeParse<DevelopmentArea[]>(raw, DEFAULT_AREAS);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_AREAS;
  } catch {
    return DEFAULT_AREAS;
  }
}

export function saveAreas(list: DevelopmentArea[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AREAS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save development areas:', err);
  }
}

export function loadScales(): ScoringScale[] {
  if (typeof window === 'undefined') return DEFAULT_SCALES;
  try {
    const raw = localStorage.getItem(SCALES_KEY);
    if (!raw) {
      localStorage.setItem(SCALES_KEY, JSON.stringify(DEFAULT_SCALES));
      return DEFAULT_SCALES;
    }
    const parsed = safeParse<ScoringScale[]>(raw, DEFAULT_SCALES);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SCALES;
  } catch {
    return DEFAULT_SCALES;
  }
}

export function saveScales(list: ScoringScale[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SCALES_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save scoring scales:', err);
  }
}

export function loadSettings(): LearningSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return safeParse<LearningSettings>(raw, DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: LearningSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save learning settings:', err);
  }
}
