import { SEED_DOCUMENTS, SEED_FOLDERS } from './constants';
import type { CurriculumDocument, CurriculumFolder } from './types';

const FOLDERS_KEY = 'panacea.learningAssessment.curriculumFolders';
const DOCS_KEY = 'panacea.learningAssessment.curriculumDocuments';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadFolders(): CurriculumFolder[] {
  if (typeof window === 'undefined') return SEED_FOLDERS;
  try {
    const raw = localStorage.getItem(FOLDERS_KEY);
    if (!raw) {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(SEED_FOLDERS));
      return SEED_FOLDERS;
    }
    const parsed = safeParse<CurriculumFolder[]>(raw, SEED_FOLDERS);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_FOLDERS;
  } catch {
    return SEED_FOLDERS;
  }
}

export function saveFolders(folders: CurriculumFolder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save curriculum folders:', err);
  }
}

export function loadDocuments(): CurriculumDocument[] {
  if (typeof window === 'undefined') return SEED_DOCUMENTS;
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    if (!raw) {
      localStorage.setItem(DOCS_KEY, JSON.stringify(SEED_DOCUMENTS));
      return SEED_DOCUMENTS;
    }
    const parsed = safeParse<CurriculumDocument[]>(raw, SEED_DOCUMENTS);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED_DOCUMENTS;
  } catch {
    return SEED_DOCUMENTS;
  }
}

export function saveDocuments(documents: CurriculumDocument[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DOCS_KEY, JSON.stringify(documents));
  } catch (err) {
    console.error('Failed to save curriculum documents:', err);
  }
}

export function formatDate(iso: string): string {
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

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
