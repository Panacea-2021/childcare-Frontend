export type ShiftType = 'morning' | 'afternoon' | 'evening';

export type ShiftStatus = 'confirmed' | 'pending' | 'draft';

export type ScheduleStaff = {
  id: string;
  name: string;
  role: string;
  initials: string;
  online: boolean;
  tone: 'mint' | 'lavender' | 'beige' | 'blush';
};

export type ScheduleShift = {
  id: string;
  staffId: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  shiftType: ShiftType;
  title: string;
  startTime: string;
  endTime: string;
  room: string;
  lesson: string;
  category: string;
  status: ShiftStatus;
  notes?: string;
};

export type ScheduleFormState = {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  staffId: string;
  category: string;
  lesson: string;
  daysOfWeek: string[];
  room: string;
  notes: string;
  status: ShiftStatus | '';
  shiftType: ShiftType | '';
};

export const WEEKDAY_OPTIONS = [
  { id: 'sun', label: 'Sun' },
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
] as const;
