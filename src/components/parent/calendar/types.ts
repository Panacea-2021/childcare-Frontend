export type ParentCalendarCategory = 'Holiday' | 'Event' | 'Important Date';

export type ParentCalendarViewMode = 'month' | 'list';

export type ParentCalendarTimeRange = 'all' | 'upcoming' | 'past';

export type ParentCalendarEvent = {
  id: string;
  title: string;
  category: ParentCalendarCategory;
  date: string;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
  description: string;
  /** null = school-wide (visible for any selected student) */
  studentId: string | null;
};

export type ParentCalendarFiltersState = {
  search: string;
  room: string;
  category: string;
  timeRange: ParentCalendarTimeRange;
};

export const PARENT_CALENDAR_CATEGORIES: ParentCalendarCategory[] = [
  'Holiday',
  'Event',
  'Important Date',
];

export const PARENT_CALENDAR_FILTER_CATEGORIES = ['All', ...PARENT_CALENDAR_CATEGORIES] as const;

export const PARENT_CALENDAR_ROOMS = [
  'Classroom 5A',
  'Classroom 5B',
  'School Auditorium',
  'Science Block',
  'School Ground',
] as const;

export const CATEGORY_TONE: Record<ParentCalendarCategory, 'event' | 'holiday' | 'important'> = {
  Event: 'event',
  Holiday: 'holiday',
  'Important Date': 'important',
};
