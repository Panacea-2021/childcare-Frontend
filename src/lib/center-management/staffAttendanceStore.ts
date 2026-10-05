import type { AttendanceRecord } from './types';
import {
  ABSENT_TYPES,
  buildIsoFromParts,
  dateInputValue,
  dayStatus,
  formatAttDate,
  formatAttMonth,
  formatTimeDisplay,
  monthKey,
  parseTimeParts,
  studentInitials,
  type DayStatus,
  type MonthlyStats,
} from './attendanceStore';
import { liveArray } from './liveList';
import {
  loadStaff,
  type StaffMember,
  STAFF_GROUP_OPTIONS,
  STAFF_ROLES,
  STAFF_ROOM_OPTIONS,
} from './staffStore';

export {
  ABSENT_TYPES,
  buildIsoFromParts,
  dateInputValue,
  dayStatus,
  formatAttDate,
  formatAttMonth,
  formatTimeDisplay,
  monthKey,
  parseTimeParts,
  studentInitials,
};
export type { DayStatus, MonthlyStats };

const STORAGE_KEY = 'panacea.cm.staffAttendance';

/** Cache attendance map between clicks. */
let attendanceMapCache: Record<string, AttendanceRecord[]> | null = null;

export type StaffAttendee = StaffMember & { attendanceRecords: AttendanceRecord[] };

export const STAFF_ROOM_FILTERS = liveArray(() => [
  { id: 'all', name: 'All Room' },
  ...STAFF_ROOM_OPTIONS.map((name) => ({ id: name, name })),
]);

export const STAFF_GROUP_FILTERS = liveArray(() => [
  { id: 'all', name: 'All Group' },
  ...STAFF_GROUP_OPTIONS.map((name) => ({ id: name, name })),
]);

export const STAFF_ROLE_FILTERS = [
  { id: 'all', name: 'All Roles' },
  ...STAFF_ROLES.map((role) => ({ id: role, name: role })),
];

function loadMap(): Record<string, AttendanceRecord[]> {
  if (attendanceMapCache) return attendanceMapCache;
  if (typeof window === 'undefined') {
    attendanceMapCache = {};
    return attendanceMapCache;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    attendanceMapCache = raw ? (JSON.parse(raw) as Record<string, AttendanceRecord[]>) : {};
    return attendanceMapCache;
  } catch {
    attendanceMapCache = {};
    return attendanceMapCache;
  }
}

function saveMap(map: Record<string, AttendanceRecord[]>) {
  attendanceMapCache = map;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function activeStaff(): StaffMember[] {
  return loadStaff().filter((s) => s.status === 'Active');
}

export function loadStaffAttendees(): StaffAttendee[] {
  const map = loadMap();
  return activeStaff().map((s) => ({
    ...s,
    attendanceRecords: map[s.id] ?? [],
  }));
}

export function getStaffDayRecord(staff: StaffAttendee, dateKey: string): AttendanceRecord | undefined {
  return staff.attendanceRecords.find((r) => r.date === dateKey);
}

export function upsertStaffDayRecord(staffId: string, record: AttendanceRecord): StaffAttendee[] {
  return upsertStaffDayRecords([{ staffId, record }]);
}

export function upsertStaffDayRecords(
  entries: { staffId: string; record: AttendanceRecord }[],
): StaffAttendee[] {
  if (!entries.length) return loadStaffAttendees();
  const map = { ...loadMap() };
  for (const { staffId, record } of entries) {
    const rows = map[staffId] ?? [];
    map[staffId] = [record, ...rows.filter((r) => r.date !== record.date)];
  }
  saveMap(map);
  return loadStaffAttendees();
}

export function clearStaffDayRecord(staffId: string, dateKey: string): StaffAttendee[] {
  const map = { ...loadMap() };
  map[staffId] = (map[staffId] ?? []).filter((r) => r.date !== dateKey);
  saveMap(map);
  return loadStaffAttendees();
}

/** Seed a couple of demo rows for today so the UI looks alive */
export function ensureTodayDemoStaffAttendance(
  staff: StaffAttendee[],
  dateKey: string,
): StaffAttendee[] {
  const today = dateInputValue();
  if (dateKey !== today) return staff;

  const map = loadMap();
  let changed = false;

  staff.forEach((s, idx) => {
    if ((map[s.id] ?? []).some((r) => r.date === dateKey)) return;
    const room = s.rooms[0] || 'Demo Room';
    let record: AttendanceRecord | null = null;

    if (idx === 0) {
      record = {
        id: `satt-${s.id}-${dateKey}`,
        date: dateKey,
        room,
        checkIn: buildIsoFromParts(dateKey, '9', '05', 'AM'),
        checkInBy: 'System',
        temperature: '36.6',
      };
    } else if (idx === 2) {
      record = {
        id: `satt-${s.id}-${dateKey}`,
        date: dateKey,
        room,
        markedAbsent: true,
        absentType: 'Personal',
        absentNote: 'Personal leave',
      };
    }

    if (!record) return;
    changed = true;
    map[s.id] = [record, ...(map[s.id] ?? [])];
  });

  if (changed) saveMap(map);
  return loadStaffAttendees();
}

export function monthlyStatsForStaff(staff: StaffAttendee, ym: string): MonthlyStats {
  const rows = staff.attendanceRecords.filter((r) => r.date.startsWith(ym));
  const present = rows.filter((r) => r.checkIn && !r.markedAbsent).length;
  const absent = rows.filter((r) => r.markedAbsent).length;
  const leave = rows.filter((r) => r.leave).length;
  const denom = present + absent + leave;
  const percentage = denom === 0 ? 0 : Math.round((present / denom) * 100);
  return { present, absent, leave, percentage };
}

export function staffPrimaryRoom(staff: StaffMember, fallback?: string) {
  return staff.rooms[0] || fallback || '—';
}
