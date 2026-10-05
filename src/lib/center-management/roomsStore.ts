export type RoomItem = {
  id: string;
  name: string;
  capacity: number;
  occupiedStudents?: number;
  activeStudents?: number;
  staffCount?: number;
  activeStaff?: number;
  minAgeYears?: number;
  minAgeMonths?: number;
  maxAgeYears?: number;
  maxAgeMonths?: number;
  ageRange?: string;
  status?: 'Active' | 'Inactive';
};

const STORAGE_KEY = 'panacea.centerManagement.rooms';
const VERSION_KEY = 'panacea.centerManagement.rooms.seedVersion';
const CURRENT_VERSION = '2';

export const DEFAULT_ROOMS: RoomItem[] = [
  {
    id: 'room-1',
    name: 'Demo Room',
    capacity: 100,
    occupiedStudents: 4,
    activeStudents: 3,
    staffCount: 2,
    activeStaff: 2,
    minAgeYears: 2,
    minAgeMonths: 0,
    maxAgeYears: 5,
    maxAgeMonths: 0,
    ageRange: '2Y - 5Y',
    status: 'Active',
  },
  {
    id: 'room-2',
    name: 'Demo Roomie',
    capacity: 120,
    occupiedStudents: 2,
    activeStudents: 1,
    staffCount: 3,
    activeStaff: 3,
    minAgeYears: 12,
    minAgeMonths: 5,
    maxAgeYears: 18,
    maxAgeMonths: 5,
    ageRange: '12y 5m - 18y 5m',
    status: 'Active',
  },
  {
    id: 'room-3',
    name: 'Sunshine Room',
    capacity: 30,
    occupiedStudents: 6,
    activeStudents: 5,
    staffCount: 4,
    activeStaff: 4,
    minAgeYears: 1,
    minAgeMonths: 0,
    maxAgeYears: 3,
    maxAgeMonths: 0,
    ageRange: '1Y - 3Y',
    status: 'Active',
  },
  {
    id: 'room-4',
    name: 'Rainbow Room',
    capacity: 25,
    occupiedStudents: 5,
    activeStudents: 4,
    staffCount: 3,
    activeStaff: 3,
    minAgeYears: 3,
    minAgeMonths: 0,
    maxAgeYears: 6,
    maxAgeMonths: 0,
    ageRange: '3Y - 6Y',
    status: 'Active',
  },
  {
    id: 'room-5',
    name: 'Star Room',
    capacity: 40,
    occupiedStudents: 8,
    activeStudents: 8,
    staffCount: 4,
    activeStaff: 4,
    minAgeYears: 4,
    minAgeMonths: 0,
    maxAgeYears: 7,
    maxAgeMonths: 0,
    ageRange: '4Y - 7Y',
    status: 'Active',
  },
  {
    id: 'room-6',
    name: 'Nest Room',
    capacity: 18,
    occupiedStudents: 3,
    activeStudents: 3,
    staffCount: 2,
    activeStaff: 2,
    minAgeYears: 0,
    minAgeMonths: 6,
    maxAgeYears: 2,
    maxAgeMonths: 0,
    ageRange: '6M - 2Y',
    status: 'Active',
  },
  {
    id: 'room-7',
    name: 'Moon Room',
    capacity: 22,
    occupiedStudents: 0,
    activeStudents: 0,
    staffCount: 1,
    activeStaff: 0,
    minAgeYears: 2,
    minAgeMonths: 0,
    maxAgeYears: 4,
    maxAgeMonths: 0,
    ageRange: '2Y - 4Y',
    status: 'Inactive',
  },
  {
    id: 'room-8',
    name: 'Garden Room',
    capacity: 28,
    occupiedStudents: 2,
    activeStudents: 2,
    staffCount: 2,
    activeStaff: 2,
    minAgeYears: 3,
    minAgeMonths: 0,
    maxAgeYears: 5,
    maxAgeMonths: 6,
    ageRange: '3Y - 5Y 6M',
    status: 'Active',
  },
];

export function loadRooms(): RoomItem[] {
  if (typeof window === 'undefined') return DEFAULT_ROOMS;
  try {
    const version = localStorage.getItem(VERSION_KEY);
    if (version !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROOMS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return DEFAULT_ROOMS;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROOMS));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      return DEFAULT_ROOMS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROOMS));
      return DEFAULT_ROOMS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load rooms:', err);
    return DEFAULT_ROOMS;
  }
}

export function saveRooms(rooms: RoomItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch (err) {
    console.error('Failed to save rooms:', err);
  }
}

export function resetRooms(): RoomItem[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROOMS));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
  return DEFAULT_ROOMS;
}
