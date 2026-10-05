import type { AttendanceRecord, Student } from './types';
import { loadGroups } from './groupsStore';
import { liveArray } from './liveList';
import { loadStudents, roomName, saveStudents } from './studentsStore';

export type DayAttendanceMap = Record<string, AttendanceRecord>;

export const ABSENT_TYPES = [
  'Fever',
  'Sick Leave',
  'Cough',
  'Cough & Cold',
  'Personal',
  'Vacation',
  'Medical',
] as const;

export const ATT_GROUP_FILTERS = liveArray(() => [
  { id: 'all', name: 'All Group' },
  ...loadGroups()
    .filter((g) => g.status !== 'Inactive')
    .map((g) => ({ id: g.id, name: g.name })),
]);

function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function dateInputValue(d = new Date()) {
  return todayKey(d);
}

export function formatAttDate(isoOrKey: string) {
  const d = new Date(isoOrKey.includes('T') ? isoOrKey : `${isoOrKey}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoOrKey;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatAttMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function formatTimeDisplay(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return iso;
  }
}

export function parseTimeParts(date = new Date()) {
  let h = date.getHours();
  const min = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return {
    hour: String(h),
    minute: String(min).padStart(2, '0'),
    ampm: ampm as 'AM' | 'PM',
  };
}

export function buildIsoFromParts(
  dateKey: string,
  hour: string,
  minute: string,
  ampm: 'AM' | 'PM',
) {
  let h = Number(hour) || 12;
  const m = Number(minute) || 0;
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const [y, mo, d] = dateKey.split('-').map(Number);
  return new Date(y, (mo || 1) - 1, d || 1, h, m, 0, 0).toISOString();
}

function ensureSeedForStudent(student: Student, dateKey: string): AttendanceRecord | undefined {
  const existing = student.attendanceRecords.find((r) => r.date === dateKey);
  if (existing) return existing;
  return undefined;
}

/** Seed a few demo statuses for today so the UI looks alive */
export function ensureTodayDemoAttendance(students: Student[], dateKey: string): Student[] {
  const today = todayKey();
  if (dateKey !== today) return students;

  let changed = false;
  let checkInSlot = 0;
  const next = students.map((s) => {
    if (s.attendanceRecords.some((r) => r.date === dateKey)) return s;
    const eligible = s.status === 'Active' || s.status === 'Signed up';
    if (!eligible) return s;

    const room = roomName(s.roomIds[0] ?? '') || 'Demo Room';
    let record: AttendanceRecord | null = null;
    const slot = checkInSlot++;

    // Most active students checked in; a few absent / pending for variety
    if (slot % 7 === 2) {
      record = {
        id: `att-${s.id}-${dateKey}`,
        date: dateKey,
        room,
        markedAbsent: true,
        absentType: 'Fever',
        absentNote: 'Little Fever',
      };
    } else if (slot % 7 === 5) {
      // leave pending (no record) so unchecked filter still lists them
      return s;
    } else {
      const hour = 8 + (slot % 4);
      const minute = String((slot * 7) % 60).padStart(2, '0');
      record = {
        id: `att-${s.id}-${dateKey}`,
        date: dateKey,
        room,
        checkIn: buildIsoFromParts(dateKey, String(hour), minute, 'AM'),
        checkInBy: 'Malika Thimisetty',
        temperature: '36.8',
      };
    }

    if (!record) return s;
    changed = true;
    return { ...s, attendanceRecords: [record, ...s.attendanceRecords] };
  });

  if (changed) saveStudents(next);
  return next;
}

export function getDayRecord(student: Student, dateKey: string): AttendanceRecord | undefined {
  return ensureSeedForStudent(student, dateKey);
}

export function upsertDayRecord(studentId: string, record: AttendanceRecord) {
  return upsertDayRecords([{ studentId, record }]);
}

/** Batch upsert — one load + one save for multi check-in/out. */
export function upsertDayRecords(entries: { studentId: string; record: AttendanceRecord }[]) {
  if (!entries.length) return loadStudents();
  const byId = new Map(entries.map((e) => [e.studentId, e.record]));
  const students = loadStudents();
  const next = students.map((s) => {
    const record = byId.get(s.id);
    if (!record) return s;
    const others = s.attendanceRecords.filter((r) => r.date !== record.date);
    return { ...s, attendanceRecords: [record, ...others] };
  });
  saveStudents(next);
  return next;
}

export function clearDayRecord(studentId: string, dateKey: string) {
  const students = loadStudents();
  const next = students.map((s) => {
    if (s.id !== studentId) return s;
    return {
      ...s,
      attendanceRecords: s.attendanceRecords.filter((r) => r.date !== dateKey),
    };
  });
  saveStudents(next);
  return next;
}

export function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export type MonthlyStats = {
  present: number;
  absent: number;
  leave: number;
  percentage: number;
};

export function monthlyStatsForStudent(student: Student, ym: string): MonthlyStats {
  const rows = student.attendanceRecords.filter((r) => r.date.startsWith(ym));
  const present = rows.filter((r) => r.checkIn && !r.markedAbsent).length;
  const absent = rows.filter((r) => r.markedAbsent).length;
  const leave = rows.filter((r) => r.leave).length;
  const denom = present + absent + leave;
  const percentage = denom === 0 ? 0 : Math.round((present / denom) * 100);
  return { present, absent, leave, percentage };
}

export function studentInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export type DayStatus = 'pending' | 'checked-in' | 'checked-out' | 'absent';

export function dayStatus(record?: AttendanceRecord): DayStatus {
  if (!record) return 'pending';
  if (record.markedAbsent) return 'absent';
  if (record.checkOut) return 'checked-out';
  if (record.checkIn) return 'checked-in';
  return 'pending';
}
