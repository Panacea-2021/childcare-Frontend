export type ParentLessonStatus = 'weekly-plan' | 'completed' | 'pending' | 'stars';

export type ParentLessonAssignment = {
  id: string;
  name: string;
  description: string;
  status: ParentLessonStatus;
  /** ISO date YYYY-MM-DD */
  date: string;
};

export const PARENT_LESSON_STATUS_OPTIONS: { id: 'all' | ParentLessonStatus; label: string }[] =
  [
    { id: 'all', label: 'All' },
    { id: 'weekly-plan', label: 'Weekly Plan' },
    { id: 'completed', label: 'Completed' },
    { id: 'pending', label: 'Pending' },
    { id: 'stars', label: 'Stars' },
  ];

export type ParentLessonDatePreset =
  | 'today'
  | 'tomorrow'
  | 'yesterday'
  | 'this-month'
  | 'last-month'
  | 'this-year'
  | 'custom';

export const PARENT_LESSON_DATE_PRESETS: { id: ParentLessonDatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-year', label: 'This Year' },
  { id: 'custom', label: 'Custom Date' },
];

/** Seed assignments — none fall on “today” so empty state matches the reference. */
export const PARENT_LESSON_SEED: ParentLessonAssignment[] = [
  {
    id: 'pla-1',
    name: 'Practical Life — Pouring',
    description: 'Introduction to pouring dry grains with a small pitcher.',
    status: 'weekly-plan',
    date: '2026-08-05',
  },
  {
    id: 'pla-2',
    name: 'Sensorial — Pink Tower',
    description: 'Visual discrimination of size using the pink tower cubes.',
    status: 'completed',
    date: '2026-08-04',
  },
  {
    id: 'pla-3',
    name: 'Language — Sandpaper Letters',
    description: 'Tracing sandpaper letters and associating sounds.',
    status: 'pending',
    date: '2026-08-11',
  },
  {
    id: 'pla-4',
    name: 'Math — Number Rods',
    description: 'Counting and associating quantity with number rods.',
    status: 'stars',
    date: '2026-07-28',
  },
  {
    id: 'pla-5',
    name: 'Culture — Land & Water Forms',
    description: 'Exploring island, lake, peninsula and gulf forms.',
    status: 'pending',
    date: '2026-08-01',
  },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function formatDisplayDate(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)}`;
}

export function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function resolveDateRange(
  preset: ParentLessonDatePreset,
  customStart?: string,
  customEnd?: string,
  now = new Date(),
): { start: Date; end: Date } {
  const today = startOfDay(now);

  if (preset === 'today') return { start: today, end: today };

  if (preset === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return { start: t, end: t };
  }

  if (preset === 'yesterday') {
    const y = new Date(today);
    y.setDate(y.getDate() - 1);
    return { start: y, end: y };
  }

  if (preset === 'this-month') {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start, end };
  }

  if (preset === 'last-month') {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start, end };
  }

  if (preset === 'this-year') {
    const start = new Date(today.getFullYear(), 0, 1);
    const end = new Date(today.getFullYear(), 11, 31);
    return { start, end };
  }

  const start = customStart ? startOfDay(new Date(`${customStart}T00:00:00`)) : today;
  const end = customEnd ? startOfDay(new Date(`${customEnd}T00:00:00`)) : start;
  return { start, end: end < start ? start : end };
}

export function statusLabel(status: ParentLessonStatus) {
  return PARENT_LESSON_STATUS_OPTIONS.find((o) => o.id === status)?.label ?? status;
}

export function startOfWeekSunday(d: Date) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

export function weekRangeFromOffset(weekOffset: number, now = new Date()) {
  const start = addDays(startOfWeekSunday(now), weekOffset * 7);
  const end = addDays(start, 6);
  return { start, end };
}

export function filterParentLessons(
  items: ParentLessonAssignment[],
  opts: {
    start: Date;
    end: Date;
    status: 'all' | ParentLessonStatus;
    query: string;
  },
) {
  const q = opts.query.trim().toLowerCase();
  const startIso = toIsoDate(opts.start);
  const endIso = toIsoDate(opts.end);

  return items.filter((item) => {
    if (item.date < startIso || item.date > endIso) return false;
    if (opts.status !== 'all' && item.status !== opts.status) return false;
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    );
  });
}
