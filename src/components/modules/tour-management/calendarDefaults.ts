import type { DayAvailability, DayKey, TourCalendarConfig } from './calendarTypes';
import { DAY_KEYS } from './calendarTypes';

function defaultDay(enabled: boolean): DayAvailability {
  return {
    enabled,
    slots: enabled ? [{ start: '09:00', end: '17:00' }] : [],
  };
}

export function createDefaultAvailability(): Record<DayKey, DayAvailability> {
  return {
    Mon: defaultDay(true),
    Tue: defaultDay(true),
    Wed: defaultDay(true),
    Thu: defaultDay(true),
    Fri: defaultDay(true),
    Sat: defaultDay(false),
    Sun: defaultDay(false),
  };
}

export function createEmptyCalendar(partial?: Partial<TourCalendarConfig>): TourCalendarConfig {
  return {
    id: `cal-${Date.now()}`,
    name: '',
    labels: [],
    startDate: '2026-08-16',
    endDate: '2026-08-18',
    maxCapacity: 1,
    totalDurationMin: 30,
    availability: createDefaultAvailability(),
    assignedStaff: ['Darshan'],
    notifyEmail: true,
    notifyInApp: false,
    notifyNewBookings: ['Darshan'],
    notifyCalendarEdits: ['Darshan'],
    autoAssignStaff: true,
    createEnquiryOnBook: false,
    defaultEnquiryStatus: 'Tour Scheduled',
    advanceBookingEnabled: false,
    advanceBookingDays: 30,
    minNoticeEnabled: true,
    minNoticeHours: 1,
    reminders: [
      { id: 'r1', amount: 1, unit: 'days' },
      { id: 'r2', amount: 1, unit: 'hours' },
    ],
    allowOnStaffHolidays: false,
    standardFields: {
      name: 'required',
      email: 'required',
      phone: 'required',
      childName: 'required',
      childGender: 'required',
    },
    customFields: [],
    formTitle: '',
    hideSchoolLogo: false,
    hideSchoolName: false,
    hideTitle: false,
    hideDuration: false,
    fontFamily: 'System default',
    baseSize: 15,
    fontWeight: 'Regular (400)',
    textColor: '#1A1A1A',
    accentColor: '#5D5FEF',
    buttonTextColor: '#FFFFFF',
    cardBackground: '#FFFFFF',
    active: true,
    color: '#5D5FEF',
    ...partial,
  };
}

export const SAMPLE_CALENDARS: TourCalendarConfig[] = [
  createEmptyCalendar({
    id: 'cal-test',
    name: 'Test',
    labels: ['Tour'],
    startDate: '2026-08-16',
    endDate: '2026-08-18',
    maxCapacity: 1,
    totalDurationMin: 30,
    assignedStaff: ['Darshan'],
    createEnquiryOnBook: false,
    active: true,
    color: '#5D5FEF',
  }),
  createEmptyCalendar({
    id: 'cal-open',
    name: 'Open House Tours',
    labels: ['Open House'],
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    maxCapacity: 2,
    totalDurationMin: 45,
    assignedStaff: ['Priya Nair', 'Darshan'],
    createEnquiryOnBook: true,
    active: true,
    color: '#0F766E',
  }),
];

export function formatDisplayDate(iso: string) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[Number(m) - 1]} ${y}`;
}

export function formatTimeLabel(hhmm: string) {
  const [hRaw, mRaw] = hhmm.split(':').map(Number);
  const h = hRaw || 0;
  const m = mRaw || 0;
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function enabledDays(cal: TourCalendarConfig) {
  return DAY_KEYS.filter((d) => cal.availability[d].enabled);
}
