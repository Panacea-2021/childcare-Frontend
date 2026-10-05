import type { BirthdayEntry, BirthdayFilter, PersonType, ProfileColor } from './types';
import { loadActiveCenterStaff, loadEnrolledCenterStudents } from '@/lib/center-management/programCatalog';
import { roomName } from '@/lib/center-management/studentsStore';

const PROFILE_COLORS: ProfileColor[] = [
  'sky',
  'mint',
  'yellow',
  'pink',
  'lavender',
  'peach',
  'purple',
  'rose',
];

export function loadCenterBirthdays(): BirthdayEntry[] {
  const fromStudents: BirthdayEntry[] = loadEnrolledCenterStudents()
    .filter((student) => student.dob)
    .map((student, index) => ({
      id: student.id,
      name: student.name,
      type: 'student' as const,
      birthDate: student.dob,
      profileColor: PROFILE_COLORS[index % PROFILE_COLORS.length],
      room: roomName(student.roomIds[0] || ''),
    }));
  const fromStaff: BirthdayEntry[] = loadActiveCenterStaff()
    .filter((member) => member.dob)
    .map((member, index) => ({
      id: member.id,
      name: member.name,
      type: 'staff' as const,
      birthDate: member.dob as string,
      profileColor: PROFILE_COLORS[(index + 3) % PROFILE_COLORS.length],
      role: member.role,
      room: member.rooms[0],
    }));
  return [...fromStudents, ...fromStaff];
}

export const seedBirthdays: BirthdayEntry[] = [
  {
    id: 'bd-1',
    name: 'Aarav Patel',
    type: 'student',
    birthDate: '2019-07-31',
    profileColor: 'sky',
    room: 'Sunshine Room',
    notes: 'Loves dinosaurs and painting',
  },
  {
    id: 'bd-2',
    name: 'Siya Sharma',
    type: 'student',
    birthDate: '2020-07-31',
    profileColor: 'pink',
    room: 'Rainbow Room',
  },
  {
    id: 'bd-3',
    name: 'Priya Nair',
    type: 'staff',
    birthDate: '1992-07-31',
    profileColor: 'lavender',
    role: 'Lead Teacher',
  },
  {
    id: 'bd-4',
    name: 'Emma Wilson',
    type: 'student',
    birthDate: '2018-08-01',
    profileColor: 'mint',
    room: 'Star Room',
  },
  {
    id: 'bd-5',
    name: 'Sophia Chen',
    type: 'student',
    birthDate: '2019-08-02',
    profileColor: 'yellow',
    room: 'Nest Room',
  },
  {
    id: 'bd-6',
    name: 'Ananya Rao',
    type: 'staff',
    birthDate: '1995-08-03',
    profileColor: 'peach',
    role: 'Teacher',
  },
  {
    id: 'bd-7',
    name: 'Liam Johnson',
    type: 'student',
    birthDate: '2020-08-05',
    profileColor: 'sky',
    room: 'Sunshine Room',
  },
  {
    id: 'bd-8',
    name: 'Olivia Brown',
    type: 'student',
    birthDate: '2018-08-07',
    profileColor: 'pink',
    room: 'Rainbow Room',
  },
  {
    id: 'bd-9',
    name: 'Meera Shah',
    type: 'staff',
    birthDate: '1990-08-08',
    profileColor: 'rose',
    role: 'Assistant',
  },
  {
    id: 'bd-10',
    name: 'Noah Garcia',
    type: 'student',
    birthDate: '2019-08-12',
    profileColor: 'mint',
    room: 'Star Room',
  },
  {
    id: 'bd-11',
    name: 'Mia Kapoor',
    type: 'student',
    birthDate: '2021-07-15',
    profileColor: 'yellow',
    room: 'Nest Room',
  },
  {
    id: 'bd-12',
    name: 'Rohit Menon',
    type: 'staff',
    birthDate: '1988-07-20',
    profileColor: 'purple',
    role: 'Admin',
  },
  {
    id: 'bd-13',
    name: 'Ethan Lee',
    type: 'student',
    birthDate: '2018-07-25',
    profileColor: 'sky',
    room: 'Sunshine Room',
  },
  {
    id: 'bd-14',
    name: 'Kavya Iyer',
    type: 'staff',
    birthDate: '1994-08-15',
    profileColor: 'lavender',
    role: 'Teacher',
  },
  {
    id: 'bd-15',
    name: 'Ava Martinez',
    type: 'student',
    birthDate: '2020-08-20',
    profileColor: 'pink',
    room: 'Rainbow Room',
  },
];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Next birthday occurrence on or after `from` (year adjusted). */
export function nextBirthdayDate(birthDate: string, from: Date = new Date()): Date {
  const born = parseISODate(birthDate);
  const base = startOfDay(from);
  let next = new Date(base.getFullYear(), born.getMonth(), born.getDate());
  if (next < base) {
    next = new Date(base.getFullYear() + 1, born.getMonth(), born.getDate());
  }
  return next;
}

export function daysUntilBirthday(birthDate: string, from: Date = new Date()): number {
  const next = nextBirthdayDate(birthDate, from);
  const base = startOfDay(from);
  return Math.round((next.getTime() - base.getTime()) / 86400000);
}

export function ageOnNextBirthday(birthDate: string, from: Date = new Date()): number {
  const born = parseISODate(birthDate);
  const next = nextBirthdayDate(birthDate, from);
  return next.getFullYear() - born.getFullYear();
}

export function isBirthdayToday(birthDate: string, from: Date = new Date()): boolean {
  return daysUntilBirthday(birthDate, from) === 0;
}

export function monthDayKey(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getMonth() + 1}-${d.getDate()}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function formatBirthdayLabel(birthDate: string): string {
  const d = parseISODate(birthDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatFullDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function monthTitle(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function buildMonthCells(viewMonth: Date): { date: Date; inMonth: boolean }[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: addDays(last, 1), inMonth: false });
  }
  return cells;
}

export function birthdaysOnDate(entries: BirthdayEntry[], date: Date): BirthdayEntry[] {
  const m = date.getMonth();
  const d = date.getDate();
  return entries.filter((e) => {
    const b = parseISODate(e.birthDate);
    return b.getMonth() === m && b.getDate() === d;
  });
}

export function filterBirthdays(
  entries: BirthdayEntry[],
  filter: BirthdayFilter,
  search: string,
  viewMonth: Date,
  today: Date = new Date(),
): BirthdayEntry[] {
  const q = search.trim().toLowerCase();
  const base = startOfDay(today);

  return entries
    .filter((e) => {
      if (q && !e.name.toLowerCase().includes(q)) return false;
      const days = daysUntilBirthday(e.birthDate, base);
      const next = nextBirthdayDate(e.birthDate, base);

      switch (filter) {
        case 'students':
          return e.type === 'student';
        case 'staff':
          return e.type === 'staff';
        case 'today':
          return days === 0;
        case 'week':
          return days >= 0 && days <= 7;
        case 'month':
          return (
            next.getMonth() === viewMonth.getMonth() &&
            next.getFullYear() === viewMonth.getFullYear()
          );
        case 'upcoming':
          return days > 0 && days <= 30;
        default:
          return true;
      }
    })
    .sort((a, b) => daysUntilBirthday(a.birthDate, base) - daysUntilBirthday(b.birthDate, base));
}

export function summarize(entries: BirthdayEntry[], today: Date = new Date()) {
  const base = startOfDay(today);
  const todayCount = entries.filter((e) => daysUntilBirthday(e.birthDate, base) === 0).length;
  const upcoming7 = entries.filter((e) => {
    const d = daysUntilBirthday(e.birthDate, base);
    return d > 0 && d <= 7;
  }).length;
  const students = entries.filter((e) => e.type === 'student').length;
  const staff = entries.filter((e) => e.type === 'staff').length;
  return { todayCount, upcoming7, students, staff };
}

export function upcomingTimeline(
  entries: BirthdayEntry[],
  today: Date = new Date(),
  limit = 8,
): { entry: BirthdayEntry; days: number; label: string }[] {
  const base = startOfDay(today);
  return entries
    .map((entry) => {
      const days = daysUntilBirthday(entry.birthDate, base);
      let label = 'Later';
      if (days === 0) label = 'Today';
      else if (days === 1) label = 'Tomorrow';
      else if (days === 2) label = '2 Days';
      else if (days <= 7) label = 'Next Week';
      else if (days <= 14) label = 'In 2 Weeks';
      else label = formatBirthdayLabel(entry.birthDate);
      return { entry, days, label };
    })
    .filter((x) => x.days >= 0 && x.days <= 21)
    .sort((a, b) => a.days - b.days)
    .slice(0, limit);
}

export function chipIcon(type: PersonType, index: number): string {
  if (type === 'staff') return index % 2 === 0 ? '🎀' : '💜';
  const icons = ['🎈', '🎁', '⭐', '🌈', '✨'];
  return icons[index % icons.length];
}
