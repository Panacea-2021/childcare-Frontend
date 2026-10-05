import type {
  Holiday,
  LeavePolicyGroup,
  LeaveTypeRow,
  WeekdayKey,
  WeekendDayConfig,
} from './types';

export const WEEKDAY_LABELS: Record<WeekdayKey, string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
};

export const WEEKDAY_ORDER: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export const SESSION_YEAR_LABEL = '01/01/2026 - 01/01/2027';

const defaultLeaveRows = (): LeaveTypeRow[] => [
  {
    id: 'lt-sick',
    leaveType: 'Sick Leave',
    totalLeave: 12,
    monthlyIncrement: 1,
    defaultLeave: 12,
    halfDayLeave: true,
  },
  {
    id: 'lt-casual',
    leaveType: 'Casual Leave',
    totalLeave: 12,
    monthlyIncrement: 1,
    defaultLeave: 12,
    halfDayLeave: false,
  },
  {
    id: 'lt-medical',
    leaveType: 'Medical Leave',
    totalLeave: 12,
    monthlyIncrement: 1,
    defaultLeave: 12,
    halfDayLeave: true,
  },
];

export const seedHolidays: Holiday[] = [
  {
    id: 'hol-1',
    name: 'Special Holiday',
    startDate: '2026-07-31',
    endDate: '2026-08-01',
  },
];

export const seedLeavePolicies: LeavePolicyGroup[] = [
  {
    id: 'pol-all',
    name: 'All Roles',
    isGeneral: true,
    allowNegativeBalance: true,
    rows: defaultLeaveRows().map((r) => ({ ...r, id: `all-${r.id}` })),
  },
  {
    id: 'pol-teacher',
    name: 'Teacher',
    isGeneral: false,
    allowNegativeBalance: true,
    rows: defaultLeaveRows().map((r) => ({ ...r, id: `teacher-${r.id}` })),
  },
];

export const seedWeekendConfig: WeekendDayConfig[] = [
  {
    day: 'sun',
    weeks: [true, true, true, true, true],
  },
];

export function holidayEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('christmas') || n.includes('xmas')) return '🎄';
  if (n.includes('diwali') || n.includes('deepavali')) return '🪔';
  if (n.includes('spring') || n.includes('holi') || n.includes('flower')) return '🌸';
  if (n.includes('beach') || n.includes('summer') || n.includes('vacation')) return '🏖';
  if (n.includes('world') || n.includes('independence') || n.includes('republic') || n.includes('national'))
    return '🌍';
  if (n.includes('new year') || n.includes('party') || n.includes('special') || n.includes('celebration'))
    return '🎉';
  return '🏖';
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatHolidayRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) => {
    const d = parseISODate(iso);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}, ${days[d.getDay()]}`;
  };
  if (!endIso || endIso === startIso) return fmt(startIso);
  return `${fmt(startIso)} - ${fmt(endIso)}`;
}

export function holidayDayCount(startIso: string, endIso: string): number {
  const start = parseISODate(startIso);
  const end = parseISODate(endIso || startIso);
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return 0;
  return Math.max(1, Math.round(ms / 86400000));
}

export function availableYears(holidays: Holiday[]): number[] {
  const years = new Set<number>([2025, 2026, 2027]);
  holidays.forEach((h) => {
    years.add(parseISODate(h.startDate).getFullYear());
    if (h.endDate) years.add(parseISODate(h.endDate).getFullYear());
  });
  return Array.from(years).sort((a, b) => b - a);
}
