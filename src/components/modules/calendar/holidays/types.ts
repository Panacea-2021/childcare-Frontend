export type HolidaysTabId = 'leave-policy' | 'holiday-calendar' | 'weekend-config';

export type Holiday = {
  id: string;
  name: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string; // ISO YYYY-MM-DD
};

export type LeaveTypeRow = {
  id: string;
  leaveType: string;
  totalLeave: number;
  monthlyIncrement: number;
  defaultLeave: number;
  halfDayLeave: boolean;
};

export type LeavePolicyGroup = {
  id: string;
  name: string;
  isGeneral: boolean;
  allowNegativeBalance: boolean;
  rows: LeaveTypeRow[];
};

export type WeekdayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export type WeekendDayConfig = {
  day: WeekdayKey;
  weeks: [boolean, boolean, boolean, boolean, boolean];
};

export type HolidayFormState = {
  name: string;
  startDate: string;
  endDate: string;
};
