export type StudentActivityType =
  | 'activity'
  | 'meal'
  | 'nap'
  | 'outdoor'
  | 'circle'
  | 'special';

export type StudentActivity = {
  id: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  title: string;
  type: StudentActivityType;
  room: string;
  staffIds: string[];
  durationMinutes: number;
  notes?: string;
};

export type StudentActivityFormState = {
  date: string;
  startTime: string;
  title: string;
  type: StudentActivityType | '';
  room: string;
  staffIds: string[];
  durationMinutes: number;
  notes: string;
};

export type StudentScheduleFilters = {
  room: string;
  type: string;
  staffId: string;
  search: string;
};

export type StudentScheduleStats = {
  totalActivities: number;
  roomsScheduled: number;
  todayActivities: number;
  weeklyHours: number;
  upcomingActivities: number;
  activeStaff: number;
};

export const ACTIVITY_TYPE_META: Record<
  StudentActivityType,
  { label: string; tone: string }
> = {
  activity: { label: 'Activity', tone: 'purple' },
  meal: { label: 'Meal', tone: 'green' },
  nap: { label: 'Nap', tone: 'lavender' },
  outdoor: { label: 'Outdoor', tone: 'blue' },
  circle: { label: 'Circle', tone: 'orange' },
  special: { label: 'Special', tone: 'pink' },
};

export const ACTIVITY_TYPE_OPTIONS = (
  Object.keys(ACTIVITY_TYPE_META) as StudentActivityType[]
).map((id) => ({ id, label: ACTIVITY_TYPE_META[id].label }));
