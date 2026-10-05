import type { ScheduleShift, ScheduleStaff } from './types';

import { liveArray } from '@/lib/center-management/liveList';
import { loadActiveCenterRooms, loadActiveCenterStaff } from '@/lib/center-management/programCatalog';
import { initials } from '@/lib/center-management/studentsStore';

const SCHEDULE_TONES: ScheduleStaff['tone'][] = ['mint', 'lavender', 'beige', 'blush'];

export const scheduleStaff: ScheduleStaff[] = liveArray(() =>
  loadActiveCenterStaff().map((member, index) => ({
    id: member.id,
    name: member.name,
    role: member.role,
    initials: initials(member.name),
    online: index % 3 !== 2,
    tone: SCHEDULE_TONES[index % SCHEDULE_TONES.length],
  })),
);

export const scheduleRooms = liveArray(() => loadActiveCenterRooms().map((room) => room.name));

export const scheduleCategories = ['Classroom', 'Admin', 'Training', 'Special Event'];

export const scheduleLessons = ['Story Circle', 'Sensory Play', 'Outdoor Adventure', 'Art & Craft', 'Nap Support', 'General Duty'];

/** Seed shifts for the week of 19–25 Jul 2026 (frontend-only). */
const SEED_SHIFT_TEMPLATES: ScheduleShift[] = [
  {
    id: 'sh1',
    staffId: 's1',
    date: '2026-07-20',
    shiftType: 'morning',
    title: 'Morning Circle',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Sunshine Room',
    lesson: 'Story Circle',
    category: 'Classroom',
    status: 'confirmed',
  },
  {
    id: 'sh2',
    staffId: 's1',
    date: '2026-07-22',
    shiftType: 'afternoon',
    title: 'Art Lab',
    startTime: '13:00',
    endTime: '17:00',
    room: 'Sunshine Room',
    lesson: 'Art & Craft',
    category: 'Classroom',
    status: 'confirmed',
  },
  {
    id: 'sh3',
    staffId: 's2',
    date: '2026-07-21',
    shiftType: 'morning',
    title: 'Sensory Hour',
    startTime: '09:00',
    endTime: '12:30',
    room: 'Rainbow Room',
    lesson: 'Sensory Play',
    category: 'Classroom',
    status: 'confirmed',
  },
  {
    id: 'sh4',
    staffId: 's2',
    date: '2026-07-23',
    shiftType: 'evening',
    title: 'Parent Prep',
    startTime: '16:00',
    endTime: '19:00',
    room: 'Rainbow Room',
    lesson: 'General Duty',
    category: 'Admin',
    status: 'pending',
  },
  {
    id: 'sh5',
    staffId: 's5',
    date: '2026-07-20',
    shiftType: 'afternoon',
    title: 'Nest Care',
    startTime: '12:00',
    endTime: '16:00',
    room: 'Nest Room',
    lesson: 'Nap Support',
    category: 'Classroom',
    status: 'confirmed',
  },
  {
    id: 'sh6',
    staffId: 's4',
    date: '2026-07-24',
    shiftType: 'morning',
    title: 'Office Hours',
    startTime: '08:30',
    endTime: '13:00',
    room: 'Star Room',
    lesson: 'General Duty',
    category: 'Admin',
    status: 'confirmed',
  },
  {
    id: 'sh7',
    staffId: 's6',
    date: '2026-07-21',
    shiftType: 'afternoon',
    title: 'Coordination',
    startTime: '13:00',
    endTime: '17:30',
    room: 'Sunshine Room',
    lesson: 'General Duty',
    category: 'Admin',
    status: 'draft',
  },
  {
    id: 'sh8',
    staffId: 's3',
    date: '2026-07-25',
    shiftType: 'morning',
    title: 'Return Shift',
    startTime: '08:00',
    endTime: '12:00',
    room: 'Star Room',
    lesson: 'Outdoor Adventure',
    category: 'Classroom',
    status: 'pending',
  },
];

export const seedShifts: ScheduleShift[] = liveArray(() => {
  const staff = loadActiveCenterStaff();
  const rooms = loadActiveCenterRooms();
  return SEED_SHIFT_TEMPLATES.map((shift, index) => ({
    ...shift,
    staffId: staff[index % Math.max(staff.length, 1)]?.id ?? shift.staffId,
    room: rooms[index % Math.max(rooms.length, 1)]?.name ?? shift.room,
  }));
});

export function formatHoursMinutes(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return '0h';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function toDisplayTime(t: string): string {
  const [hRaw, m] = t.split(':').map(Number);
  const suffix = hRaw >= 12 ? 'PM' : 'AM';
  const h = hRaw % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatRangeLabel(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

export function monthBadge(d: Date): string {
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

export function weekdayShort(d: Date): string {
  return d.toLocaleString('en-US', { weekday: 'short' });
}
