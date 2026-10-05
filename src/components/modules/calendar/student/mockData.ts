import {
  addDays,
  parseISODate,
  scheduleRooms,
  scheduleStaff,
  startOfWeek,
  toDisplayTime,
  toISODate,
  weekdayShort,
} from '../mockData';
import type {
  StudentActivity,
  StudentActivityFormState,
  StudentActivityType,
  StudentScheduleFilters,
  StudentScheduleStats,
} from './types';

export {
  scheduleRooms,
  scheduleStaff,
  addDays,
  parseISODate,
  startOfWeek,
  toISODate,
  toDisplayTime,
  weekdayShort,
};

/** Seed week aligned with Staff Schedule (19–25 Jul 2026). */
export const STUDENT_SEED_WEEK_START = new Date(2026, 6, 19);

export const emptyActivityForm = (date = ''): StudentActivityFormState => ({
  date,
  startTime: '09:00',
  title: '',
  type: '',
  room: '',
  staffIds: [],
  durationMinutes: 45,
  notes: '',
});

function endFromDuration(start: string, minutes: number): string {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const eh = Math.floor(total / 60) % 24;
  const em = total % 60;
  return `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
}

function act(
  id: string,
  date: string,
  startTime: string,
  title: string,
  type: StudentActivityType,
  room: string,
  staffIds: string[],
  durationMinutes: number,
  notes?: string,
): StudentActivity {
  return {
    id,
    date,
    startTime,
    endTime: endFromDuration(startTime, durationMinutes),
    title,
    type,
    room,
    staffIds,
    durationMinutes,
    notes,
  };
}

/** Frontend-only seed activities for 19–25 Jul 2026. */
export const seedStudentActivities: StudentActivity[] = [
  act('sa1', '2026-07-20', '08:30', 'Morning Circle', 'circle', 'Sunshine Room', ['s1', 's3'], 30, 'Welcome songs and attendance.'),
  act('sa2', '2026-07-20', '09:15', 'Sensory Play', 'activity', 'Sunshine Room', ['s1'], 45),
  act('sa3', '2026-07-20', '11:30', 'Lunch Time', 'meal', 'Sunshine Room', ['s3'], 40),
  act('sa4', '2026-07-20', '12:30', 'Quiet Nap', 'nap', 'Nest Room', ['s5'], 90),
  act('sa5', '2026-07-20', '15:00', 'Garden Walk', 'outdoor', 'Rainbow Room', ['s2'], 35),

  act('sa6', '2026-07-21', '08:45', 'Story Circle', 'circle', 'Rainbow Room', ['s2'], 25),
  act('sa7', '2026-07-21', '09:30', 'Art & Craft', 'activity', 'Rainbow Room', ['s2', 's3'], 50, 'Finger painting theme: ocean.'),
  act('sa8', '2026-07-21', '11:45', 'Snack Break', 'meal', 'Rainbow Room', ['s3'], 20),
  act('sa9', '2026-07-21', '14:00', 'Music & Movement', 'special', 'Star Room', ['s5'], 40),

  act('sa10', '2026-07-22', '08:30', 'Morning Circle', 'circle', 'Sunshine Room', ['s1'], 30),
  act('sa11', '2026-07-22', '10:00', 'Outdoor Adventure', 'outdoor', 'Star Room', ['s1', 's4'], 55),
  act('sa12', '2026-07-22', '12:00', 'Lunch Time', 'meal', 'Sunshine Room', ['s3'], 40),
  act('sa13', '2026-07-22', '13:00', 'Quiet Nap', 'nap', 'Nest Room', ['s5'], 75),
  act('sa14', '2026-07-22', '15:30', 'Science Discovery', 'activity', 'Star Room', ['s4'], 45),

  act('sa15', '2026-07-23', '09:00', 'Language Circle', 'circle', 'Rainbow Room', ['s2'], 30),
  act('sa16', '2026-07-23', '10:00', 'Block Building', 'activity', 'Sunshine Room', ['s1'], 40),
  act('sa17', '2026-07-23', '11:30', 'Healthy Lunch', 'meal', 'Rainbow Room', ['s3'], 40),
  act('sa18', '2026-07-23', '14:30', 'Water Play', 'outdoor', 'Rainbow Room', ['s2', 's5'], 40),
  act('sa19', '2026-07-23', '16:00', 'Parent Preview', 'special', 'Star Room', ['s6'], 50, 'End-of-week showcase.'),

  act('sa20', '2026-07-24', '08:30', 'Friday Circle', 'circle', 'Sunshine Room', ['s1', 's2'], 35),
  act('sa21', '2026-07-24', '09:30', 'Yoga Stretch', 'activity', 'Star Room', ['s5'], 30),
  act('sa22', '2026-07-24', '11:30', 'Picnic Lunch', 'meal', 'Nest Room', ['s3'], 45),
  act('sa23', '2026-07-24', '13:00', 'Rest Time', 'nap', 'Nest Room', ['s5'], 60),
  act('sa24', '2026-07-24', '15:00', 'Free Play Yard', 'outdoor', 'Sunshine Room', ['s1'], 45),

  act('sa25', '2026-07-25', '10:00', 'Weekend Craft Club', 'special', 'Star Room', ['s4'], 60),
  act('sa26', '2026-07-25', '11:30', 'Brunch Snack', 'meal', 'Sunshine Room', ['s3'], 30),
];

export function minutesBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function formatWeekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const fmt = (d: Date) =>
    `${d.toLocaleString('en-US', { weekday: 'short' })} ${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-US', { month: 'short' })}`;
  return `${fmt(weekStart)} — ${fmt(end)}`;
}

export function staffNames(staffIds: string[]): string {
  return staffIds
    .map((id) => scheduleStaff.find((s) => s.id === id)?.name ?? id)
    .join(', ');
}

export function filterActivities(
  list: StudentActivity[],
  weekStart: Date,
  filters: StudentScheduleFilters,
): StudentActivity[] {
  const startIso = toISODate(weekStart);
  const endIso = toISODate(addDays(weekStart, 6));
  const q = filters.search.trim().toLowerCase();

  return list
    .filter((a) => {
      if (a.date < startIso || a.date > endIso) return false;
      if (filters.room !== 'all' && a.room !== filters.room) return false;
      if (filters.type !== 'all' && a.type !== filters.type) return false;
      if (filters.staffId !== 'all' && !a.staffIds.includes(filters.staffId)) return false;
      if (q) {
        const hay = `${a.title} ${a.room} ${a.type} ${staffNames(a.staffIds)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime) || a.title.localeCompare(b.title));
}

export function summarizeActivities(
  weekList: StudentActivity[],
  todayIso: string,
): StudentScheduleStats {
  const rooms = new Set(weekList.map((a) => a.room));
  const staff = new Set(weekList.flatMap((a) => a.staffIds));
  const weeklyMinutes = weekList.reduce((sum, a) => sum + a.durationMinutes, 0);
  const todayActivities = weekList.filter((a) => a.date === todayIso).length;
  const upcomingActivities = weekList.filter((a) => a.date > todayIso).length;

  return {
    totalActivities: weekList.length,
    roomsScheduled: rooms.size,
    todayActivities,
    weeklyHours: Math.round((weeklyMinutes / 60) * 10) / 10,
    upcomingActivities,
    activeStaff: staff.size,
  };
}

/** Generate a compact “today” demo set for the visible seed week’s weekday, or todayIso. */
export function generateTodayActivities(todayIso: string): StudentActivity[] {
  const room = scheduleRooms[0] ?? 'Sunshine Room';
  const stamp = Date.now();
  return [
    act(`gen-${stamp}-1`, todayIso, '08:30', 'Generated Morning Circle', 'circle', room, ['s1'], 30),
    act(`gen-${stamp}-2`, todayIso, '10:00', 'Generated Free Play', 'activity', room, ['s2'], 45),
    act(`gen-${stamp}-3`, todayIso, '11:30', 'Generated Lunch', 'meal', room, ['s3'], 40),
  ];
}

export function formToActivity(
  form: StudentActivityFormState,
  existingId?: string,
): StudentActivity | null {
  if (!form.date || !form.startTime || !form.title.trim() || !form.type || !form.room) return null;
  const duration = Math.max(5, Number(form.durationMinutes) || 45);
  return {
    id: existingId ?? `sa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: form.date,
    startTime: form.startTime,
    endTime: endFromDuration(form.startTime, duration),
    title: form.title.trim(),
    type: form.type,
    room: form.room,
    staffIds: form.staffIds,
    durationMinutes: duration,
    notes: form.notes.trim() || undefined,
  };
}

export function activityToForm(a: StudentActivity): StudentActivityFormState {
  return {
    date: a.date,
    startTime: a.startTime,
    title: a.title,
    type: a.type,
    room: a.room,
    staffIds: [...a.staffIds],
    durationMinutes: a.durationMinutes,
    notes: a.notes ?? '',
  };
}
