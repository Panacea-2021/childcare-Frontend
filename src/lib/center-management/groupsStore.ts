export type GroupItem = {
  id: string;
  name: string;
  createdAt: string;
  status?: 'Active' | 'Inactive';
};

const STORAGE_KEY = 'panacea.centerManagement.groups';
const VERSION_KEY = 'panacea.centerManagement.groups.seedVersion';
const CURRENT_VERSION = '2';

export const DEFAULT_GROUPS: GroupItem[] = [
  { id: 'group-1', name: 'Special Interests', createdAt: '2026-01-08T09:00:00.000Z', status: 'Active' },
  { id: 'group-2', name: 'Allergy Watch', createdAt: '2026-01-12T10:30:00.000Z', status: 'Active' },
  { id: 'group-3', name: 'Infant Care', createdAt: '2026-02-02T08:15:00.000Z', status: 'Active' },
  { id: 'group-4', name: 'Early Readers', createdAt: '2026-02-18T11:00:00.000Z', status: 'Active' },
  { id: 'group-5', name: 'Outdoor Explorers', createdAt: '2026-03-05T09:45:00.000Z', status: 'Active' },
  { id: 'group-6', name: 'STEM Club', createdAt: '2026-03-22T14:20:00.000Z', status: 'Active' },
  { id: 'group-7', name: 'Music Circle', createdAt: '2026-04-10T10:00:00.000Z', status: 'Inactive' },
  { id: 'group-8', name: 'Aftercare Friends', createdAt: '2026-05-01T13:00:00.000Z', status: 'Active' },
];

export function loadGroups(): GroupItem[] {
  if (typeof window === 'undefined') return DEFAULT_GROUPS;
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return DEFAULT_GROUPS;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return DEFAULT_GROUPS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
      return DEFAULT_GROUPS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load groups:', err);
    return DEFAULT_GROUPS;
  }
}

export function saveGroups(groups: GroupItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (err) {
    console.error('Failed to save groups:', err);
  }
}

export function resetGroups(): GroupItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_GROUPS));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
  return DEFAULT_GROUPS;
}
