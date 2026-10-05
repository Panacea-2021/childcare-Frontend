'use client';

import { assignCenterIdByIndex, DEFAULT_CENTER_ID } from './centers';

const STUDENTS_KEY = 'panacea.center.students.v3';
const STAFF_KEY = 'panacea.cm.staff';
const MIGRATION_KEY = 'panacea.org.centerIdMigration';
const MIGRATION_VERSION = '1';

/**
 * One-time client migration: stamp centerId on students/staff so org scope filtering works.
 * Existing untagged rows are distributed across demo centers.
 */
export function migrateCenterIdsIfNeeded() {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(MIGRATION_KEY) === MIGRATION_VERSION) return;

    stampList(STUDENTS_KEY);
    stampList(STAFF_KEY);

    window.localStorage.setItem(MIGRATION_KEY, MIGRATION_VERSION);
  } catch {
    /* ignore */
  }
}

function stampList(storageKey: string) {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return;
  const parsed = JSON.parse(raw) as Array<{ centerId?: string }>;
  if (!Array.isArray(parsed) || !parsed.length) return;

  let changed = false;
  const next = parsed.map((item, index) => {
    if (item.centerId) return item;
    changed = true;
    return { ...item, centerId: assignCenterIdByIndex(index) };
  });

  if (changed) {
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }
}

export function defaultCenterIdForNewRecord(activeScope: string): string {
  return activeScope === 'all' ? DEFAULT_CENTER_ID : activeScope;
}
