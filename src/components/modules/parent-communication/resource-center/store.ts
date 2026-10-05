import type { ResourceItem } from '@/types/resourceCenter';
import { MOCK_RESOURCES } from '@/lib/mock/mockResources';

const RESOURCES_KEY = 'panacea.parentComm.resources';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadResources(): ResourceItem[] {
  if (typeof window === 'undefined') return MOCK_RESOURCES;
  try {
    const raw = localStorage.getItem(RESOURCES_KEY);
    if (!raw) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(MOCK_RESOURCES));
      return MOCK_RESOURCES;
    }
    const parsed = safeParse<ResourceItem[]>(raw, MOCK_RESOURCES);
    return Array.isArray(parsed) && parsed.length ? parsed : MOCK_RESOURCES;
  } catch {
    return MOCK_RESOURCES;
  }
}

export function saveResources(resources: ResourceItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
  } catch (err) {
    console.error('Failed to save resources:', err);
  }
}

export function addResource(input: Omit<ResourceItem, 'id' | 'updated'> & { updated?: string }): ResourceItem {
  const item: ResourceItem = {
    ...input,
    id: `res-${Date.now()}`,
    updated: input.updated ?? new Date().toISOString().slice(0, 10),
  };
  const next = [item, ...loadResources()];
  saveResources(next);
  return item;
}

export function updateResource(id: string, patch: Partial<ResourceItem>): ResourceItem[] {
  const next = loadResources().map((r) => (r.id === id ? { ...r, ...patch, id } : r));
  saveResources(next);
  return next;
}

export function removeResource(id: string): ResourceItem[] {
  const next = loadResources().filter((r) => r.id !== id);
  saveResources(next);
  return next;
}
