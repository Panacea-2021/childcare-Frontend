export type SchoolEventCategory =
  | 'Holiday'
  | 'Event'
  | 'Important Date'
  | 'Exam'
  | 'Sports Event'
  | 'Cultural Event'
  | 'Parent Meeting'
  | 'Workshop'
  | 'Celebration';

export type SchoolEventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type SchoolViewMode = 'calendar' | 'list';

export type SchoolEventAttachment = {
  id: string;
  name: string;
  sizeLabel: string;
  type: string;
};

export type SchoolEvent = {
  id: string;
  name: string;
  category: SchoolEventCategory;
  classrooms: string[];
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  coverUrl?: string;
  staffOnly: boolean;
  notifyStaff: boolean;
  notifyParents: boolean;
  disableComments: boolean;
  attachments: SchoolEventAttachment[];
  status: SchoolEventStatus;
};

export type SchoolEventFormState = {
  name: string;
  category: SchoolEventCategory | '';
  classrooms: string[];
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  coverUrl: string;
  coverFileName: string;
  staffOnly: boolean;
  notifyStaff: boolean;
  notifyParents: boolean;
  disableComments: boolean;
  attachments: SchoolEventAttachment[];
};

export type SchoolFiltersState = {
  search: string;
  classroom: string;
  category: string;
  date: string;
};

export const SCHOOL_CATEGORIES: SchoolEventCategory[] = [
  'Holiday',
  'Event',
  'Important Date',
  'Exam',
  'Sports Event',
  'Cultural Event',
  'Parent Meeting',
  'Workshop',
  'Celebration',
];

export const SCHOOL_FILTER_CATEGORIES = ['All', ...SCHOOL_CATEGORIES.filter((c) => c !== 'Workshop' && c !== 'Celebration')] as const;

export const SCHOOL_CLASSROOMS = [
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
] as const;

export const CATEGORY_COLOR: Record<SchoolEventCategory, string> = {
  Holiday: 'holiday',
  Event: 'event',
  'Important Date': 'important',
  Exam: 'exam',
  'Sports Event': 'sports',
  'Cultural Event': 'cultural',
  'Parent Meeting': 'meeting',
  Workshop: 'workshop',
  Celebration: 'celebration',
};
