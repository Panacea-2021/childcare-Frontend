import type {
  ParentCalendarCategory,
  ParentCalendarEvent,
  ParentCalendarFiltersState,
  ParentCalendarTimeRange,
} from './types';
import { PARENT_CALENDAR_ROOMS } from './types';

/** Reference “today” matching the Parent Calendar screenshot (Aug 12, 2026). */
export const PARENT_CALENDAR_TODAY = new Date(2026, 7, 12);

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}

export function monthTitle(d: Date): string {
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return '—';
  return parseISODate(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'All Day';
  if (start && !end) return start;
  if (start && end) return `${start} – ${end}`;
  return end ?? 'All Day';
}

export function buildMonthCells(viewMonth: Date): { date: Date; inMonth: boolean }[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i -= 1) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]!.date;
    cells.push({ date: addDays(last, 1), inMonth: false });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1]!.date;
    cells.push({ date: addDays(last, 1), inMonth: false });
  }
  return cells;
}

/**
 * Frontend-only seed data for Parent Portal calendar.
 * Replace with API events later — shape already matches a typical calendar DTO.
 */
export const seedParentCalendarEvents: ParentCalendarEvent[] = [
  // ——— July 2026 ———
  {
    id: 'evt-jul-001',
    title: 'Summer Camp Closing Ceremony',
    category: 'Event',
    date: '2026-07-25',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'School Auditorium',
    description: 'Closing ceremony for summer camp with certificates and performances.',
    studentId: null,
  },
  {
    id: 'evt-jul-002',
    title: 'Staff Development Holiday',
    category: 'Holiday',
    date: '2026-07-28',
    startTime: null,
    endTime: null,
    room: null,
    description: 'School closed for staff professional development.',
    studentId: null,
  },
  {
    id: 'evt-jul-003',
    title: 'Term Fee Reminder',
    category: 'Important Date',
    date: '2026-07-30',
    startTime: null,
    endTime: null,
    room: null,
    description: 'Reminder to clear any pending Term 1 fee balances before August.',
    studentId: null,
  },

  // ——— August 2026 (primary demo month) ———
  {
    id: 'evt-001',
    title: 'Parent-Teacher Meeting',
    category: 'Event',
    date: '2026-08-04',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    room: 'Classroom 5A',
    description: 'Parent-teacher interaction for Term 1 progress and classroom goals.',
    studentId: 'st-alex',
  },
  {
    id: 'evt-002',
    title: 'Independence Day Celebration',
    category: 'Event',
    date: '2026-08-07',
    startTime: '9:00 AM',
    endTime: '11:30 AM',
    room: 'School Auditorium',
    description: 'Flag hoisting, cultural performances, and a special assembly. Families welcome.',
    studentId: null,
  },
  {
    id: 'evt-003',
    title: 'Raksha Bandhan',
    category: 'Holiday',
    date: '2026-08-10',
    startTime: null,
    endTime: null,
    room: null,
    description: 'School holiday for Raksha Bandhan.',
    studentId: null,
  },
  {
    id: 'evt-004',
    title: 'Term 1 Progress Report',
    category: 'Important Date',
    date: '2026-08-12',
    startTime: null,
    endTime: null,
    room: null,
    description: 'Term 1 progress reports are shared with parents via the portal.',
    studentId: null,
  },
  {
    id: 'evt-004b',
    title: 'Parent Meeting',
    category: 'Event',
    date: '2026-08-12',
    startTime: '3:00 PM',
    endTime: '4:00 PM',
    room: 'Classroom 5B',
    description: 'Optional follow-up meeting to discuss Term 1 report highlights.',
    studentId: 'st-demo-r1-2',
  },
  {
    id: 'evt-004c',
    title: 'Fee Reminder',
    category: 'Important Date',
    date: '2026-08-12',
    startTime: null,
    endTime: null,
    room: null,
    description: 'Gentle reminder about upcoming fee payment deadlines this month.',
    studentId: null,
  },
  {
    id: 'evt-005',
    title: 'Independence Day',
    category: 'Holiday',
    date: '2026-08-15',
    startTime: null,
    endTime: null,
    room: null,
    description: 'National holiday — school closed for Independence Day.',
    studentId: null,
  },
  {
    id: 'evt-006',
    title: 'Science Exhibition',
    category: 'Event',
    date: '2026-08-18',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    room: 'Science Block',
    description: 'Students will showcase their science projects and experiments.',
    studentId: null,
  },
  {
    id: 'evt-007',
    title: 'Fee Payment Deadline',
    category: 'Important Date',
    date: '2026-08-21',
    startTime: null,
    endTime: null,
    room: null,
    description: 'Last date to clear Term 1 fee payments without late charges.',
    studentId: null,
  },
  {
    id: 'evt-008',
    title: 'Unit Test Begins',
    category: 'Important Date',
    date: '2026-08-24',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    room: 'Classroom 5A',
    description: 'Unit tests begin across core subjects. Please ensure children arrive on time.',
    studentId: 'st-alex',
  },
  {
    id: 'evt-009',
    title: 'Sports Day Practice',
    category: 'Event',
    date: '2026-08-27',
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    room: 'School Ground',
    description: 'Practice session for upcoming Sports Day events and relays.',
    studentId: null,
  },
  {
    id: 'evt-010',
    title: 'Monthly Parent Interaction',
    category: 'Event',
    date: '2026-08-30',
    startTime: '11:00 AM',
    endTime: '1:00 PM',
    room: 'Classroom 5A',
    description: 'Open interaction session with class teachers for monthly updates.',
    studentId: null,
  },
  {
    id: 'evt-011',
    title: 'Library Book Fair',
    category: 'Event',
    date: '2026-08-20',
    startTime: '9:30 AM',
    endTime: '1:00 PM',
    room: 'Classroom 5B',
    description: 'Browse and purchase age-appropriate books. Volunteers welcome.',
    studentId: null,
  },

  // ——— September 2026 ———
  {
    id: 'evt-sep-001',
    title: 'Teachers’ Day Celebration',
    category: 'Event',
    date: '2026-09-05',
    startTime: '10:00 AM',
    endTime: '12:30 PM',
    room: 'School Auditorium',
    description: 'Students celebrate Teachers’ Day with performances and thank-you notes.',
    studentId: null,
  },
  {
    id: 'evt-sep-002',
    title: 'Sports Day',
    category: 'Event',
    date: '2026-09-12',
    startTime: '8:30 AM',
    endTime: '1:00 PM',
    room: 'School Ground',
    description: 'Annual Sports Day with track events, fun games, and prize distribution.',
    studentId: null,
  },
  {
    id: 'evt-sep-003',
    title: 'Mid-Term Break Begins',
    category: 'Holiday',
    date: '2026-09-20',
    startTime: null,
    endTime: null,
    room: null,
    description: 'Mid-term break begins. Classes resume after the holiday window.',
    studentId: null,
  },
  {
    id: 'evt-sep-004',
    title: 'Science Project Submission',
    category: 'Important Date',
    date: '2026-09-15',
    startTime: null,
    endTime: null,
    room: 'Science Block',
    description: 'Deadline for science fair project submissions.',
    studentId: null,
  },
];

export function roomOptions() {
  return [
    { value: 'all', label: 'All Classroom' },
    ...PARENT_CALENDAR_ROOMS.map((r) => ({ value: r, label: r })),
  ];
}

export function eventsOnDate(events: ParentCalendarEvent[], date: Date): ParentCalendarEvent[] {
  const key = toISODate(date);
  return events.filter((e) => e.date === key);
}

function matchesTimeRange(
  event: ParentCalendarEvent,
  timeRange: ParentCalendarTimeRange,
  today: Date,
): boolean {
  if (timeRange === 'all') return true;
  const todayKey = toISODate(today);
  if (timeRange === 'upcoming') return event.date > todayKey;
  if (timeRange === 'past') return event.date < todayKey;
  return true;
}

export function filterParentCalendarEvents(
  events: ParentCalendarEvent[],
  filters: ParentCalendarFiltersState,
  today: Date,
  selectedStudentId?: string | null,
): ParentCalendarEvent[] {
  const q = filters.search.trim().toLowerCase();

  return events.filter((e) => {
    if (selectedStudentId && e.studentId && e.studentId !== selectedStudentId) {
      return false;
    }
    if (q && !e.title.toLowerCase().includes(q)) return false;
    if (filters.room !== 'all' && e.room !== filters.room) return false;
    if (filters.category !== 'all' && e.category !== filters.category) return false;
    if (!matchesTimeRange(e, filters.timeRange, today)) return false;
    return true;
  });
}

export function sortEventsChronologically(events: ParentCalendarEvent[]): ParentCalendarEvent[] {
  return [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const at = a.startTime ?? '';
    const bt = b.startTime ?? '';
    return at.localeCompare(bt);
  });
}

export function groupEventsByDate(
  events: ParentCalendarEvent[],
): { date: string; events: ParentCalendarEvent[] }[] {
  const map = new Map<string, ParentCalendarEvent[]>();
  for (const ev of sortEventsChronologically(events)) {
    const list = map.get(ev.date) ?? [];
    list.push(ev);
    map.set(ev.date, list);
  }
  return Array.from(map.entries()).map(([date, list]) => ({ date, events: list }));
}

export function categoryLabel(category: ParentCalendarCategory): string {
  return category;
}

export const DEFAULT_PARENT_CALENDAR_FILTERS: ParentCalendarFiltersState = {
  search: '',
  room: 'all',
  category: 'all',
  timeRange: 'all',
};

export function hasActiveFilters(filters: ParentCalendarFiltersState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.room !== 'all' ||
    filters.category !== 'all' ||
    filters.timeRange !== 'all'
  );
}
