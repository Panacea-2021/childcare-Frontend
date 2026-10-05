import { CURRENT_USER } from '@/components/reports/attendance-summary/types';
import { toDisplayDate, toFileDate } from '@/components/reports/attendance-summary/utils';
import type { GeneratedExcelReport } from '@/components/reports/shared/generatedReport';

export type ActivityExcelColumnMode = 'all' | 'custom';

export type ActivityExcelColumnId =
  | 'title'
  | 'activityType'
  | 'category'
  | 'room'
  | 'postedBy'
  | 'createdDate'
  | 'createdTime'
  | 'status'
  | 'visibility'
  | 'studentCount'
  | 'labels'
  | 'content'
  | 'isPinned'
  | 'isFeatured'
  | 'notifyStaff'
  | 'enableComments'
  | 'allowParentReactions'
  | 'sendPushNotification'
  | 'likesCount'
  | 'commentsCount'
  | 'viewsCount'
  | 'daysOfWeek'
  | 'repeatStartDate'
  | 'repeatEndDate'
  | 'meetingStartUrl'
  | 'meetingJoinUrl'
  | 'pottyDestination'
  | 'attachmentCount'
  | 'voiceNoteDuration'
  | 'branch';

export const ACTIVITY_EXCEL_COLUMNS: { id: ActivityExcelColumnId; label: string }[] = [
  { id: 'title', label: 'Title' },
  { id: 'activityType', label: 'Activity Type' },
  { id: 'category', label: 'Category' },
  { id: 'room', label: 'Room' },
  { id: 'postedBy', label: 'Posted By' },
  { id: 'createdDate', label: 'Created Date' },
  { id: 'createdTime', label: 'Created Time' },
  { id: 'status', label: 'Status' },
  { id: 'visibility', label: 'Visibility' },
  { id: 'studentCount', label: 'Student Count' },
  { id: 'labels', label: 'Labels' },
  { id: 'content', label: 'Content' },
  { id: 'isPinned', label: 'Is Pinned' },
  { id: 'isFeatured', label: 'Is Featured' },
  { id: 'notifyStaff', label: 'Notify Staff' },
  { id: 'enableComments', label: 'Enable Comments' },
  { id: 'allowParentReactions', label: 'Allow Parent Reactions' },
  { id: 'sendPushNotification', label: 'Send Push Notification' },
  { id: 'likesCount', label: 'Likes Count' },
  { id: 'commentsCount', label: 'Comments Count' },
  { id: 'viewsCount', label: 'Views Count' },
  { id: 'daysOfWeek', label: 'Days Of Week' },
  { id: 'repeatStartDate', label: 'Repeat Start Date' },
  { id: 'repeatEndDate', label: 'Repeat End Date' },
  { id: 'meetingStartUrl', label: 'Meeting Start Url' },
  { id: 'meetingJoinUrl', label: 'Meeting Join Url' },
  { id: 'pottyDestination', label: 'Potty Destination' },
  { id: 'attachmentCount', label: 'Attachment Count' },
  { id: 'voiceNoteDuration', label: 'Voice Note Duration' },
  { id: 'branch', label: 'Branch' },
];

export type ActivityExcelFormValues = {
  startDate: string;
  endDate: string;
  rooms: string[];
  columnMode: ActivityExcelColumnMode;
  selectedColumns: ActivityExcelColumnId[];
};

type ActivityExcelSeed = Record<ActivityExcelColumnId, string>;

const SEED: ActivityExcelSeed[] = [
  {
    title: 'Morning Circle Time & Phonics Warm-up',
    activityType: 'Circle Time',
    category: 'Learning & Development',
    room: 'Grade 1',
    postedBy: 'Sarah Jenkins',
    createdDate: '2026-08-01',
    createdTime: '09:15 AM',
    status: 'Posted',
    visibility: 'Parents',
    studentCount: '24',
    labels: 'Story Time, Daily Update',
    content: 'Phonics interactive session with letter blends.',
    isPinned: 'Yes',
    isFeatured: 'Yes',
    notifyStaff: 'Yes',
    enableComments: 'Yes',
    allowParentReactions: 'Yes',
    sendPushNotification: 'Yes',
    likesCount: '18',
    commentsCount: '5',
    viewsCount: '38',
    daysOfWeek: 'Mon, Wed, Fri',
    repeatStartDate: '2026-08-01',
    repeatEndDate: '2026-09-30',
    meetingStartUrl: 'https://meet.example.com/start/circle-1a',
    meetingJoinUrl: 'https://meet.example.com/join/circle-1a',
    pottyDestination: '—',
    attachmentCount: '2',
    voiceNoteDuration: '0:42',
    branch: 'Main Campus',
  },
  {
    title: 'Potty & Hygiene Routine Log',
    activityType: 'Potty',
    category: 'Care & Health',
    room: 'Toddlers',
    postedBy: 'Priya Nair',
    createdDate: '2026-08-02',
    createdTime: '11:05 AM',
    status: 'Posted',
    visibility: 'Parents',
    studentCount: '8',
    labels: 'Care, Hygiene',
    content: 'Routine potty checks and hygiene reminders.',
    isPinned: 'No',
    isFeatured: 'No',
    notifyStaff: 'Yes',
    enableComments: 'No',
    allowParentReactions: 'Yes',
    sendPushNotification: 'No',
    likesCount: '4',
    commentsCount: '1',
    viewsCount: '12',
    daysOfWeek: 'Mon–Fri',
    repeatStartDate: '2026-08-01',
    repeatEndDate: '2026-08-31',
    meetingStartUrl: '—',
    meetingJoinUrl: '—',
    pottyDestination: 'Toilet A',
    attachmentCount: '0',
    voiceNoteDuration: '—',
    branch: 'East Wing',
  },
  {
    title: 'STEM Discovery Lab',
    activityType: 'STEM',
    category: 'Learning & Development',
    room: 'Grade 2',
    postedBy: 'Dr. Marcus Vance',
    createdDate: '2026-08-01',
    createdTime: '11:30 AM',
    status: 'Posted',
    visibility: 'Parents',
    studentCount: '20',
    labels: 'Science, Technology',
    content: 'Water surface tension experiment.',
    isPinned: 'Yes',
    isFeatured: 'No',
    notifyStaff: 'Yes',
    enableComments: 'Yes',
    allowParentReactions: 'Yes',
    sendPushNotification: 'Yes',
    likesCount: '22',
    commentsCount: '7',
    viewsCount: '41',
    daysOfWeek: 'Tue, Thu',
    repeatStartDate: '2026-08-04',
    repeatEndDate: '2026-10-01',
    meetingStartUrl: 'https://meet.example.com/start/stem-2a',
    meetingJoinUrl: 'https://meet.example.com/join/stem-2a',
    pottyDestination: '—',
    attachmentCount: '3',
    voiceNoteDuration: '1:08',
    branch: 'West Annex',
  },
];

const DEFAULT_SELECTED: ActivityExcelColumnId[] = [
  'title',
  'activityType',
  'room',
  'createdDate',
  'status',
  'studentCount',
  'daysOfWeek',
  'repeatStartDate',
  'meetingStartUrl',
  'pottyDestination',
];

export function defaultActivityExcelForm(): ActivityExcelFormValues {
  return {
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    rooms: [],
    columnMode: 'custom',
    selectedColumns: [...DEFAULT_SELECTED],
  };
}

function activeColumns(values: ActivityExcelFormValues) {
  if (values.columnMode === 'all') return ACTIVITY_EXCEL_COLUMNS;
  const set = new Set(values.selectedColumns);
  return ACTIVITY_EXCEL_COLUMNS.filter((c) => set.has(c.id));
}

export function buildActivityExcelRows(values: ActivityExcelFormValues): Record<string, string>[] {
  const cols = activeColumns(values);
  const roomFilter = new Set(values.rooms);

  return SEED.filter((row) => !roomFilter.size || roomFilter.has(row.room)).map((row) => {
    const out: Record<string, string> = {};
    cols.forEach((col) => {
      const value = row[col.id];
      out[col.label] =
        col.id === 'createdDate' || col.id === 'repeatStartDate' || col.id === 'repeatEndDate'
          ? value && value !== '—'
            ? toDisplayDate(value)
            : value
          : value;
    });
    return out;
  });
}

export function createActivityExcelReport(
  values: ActivityExcelFormValues,
  by = CURRENT_USER,
): GeneratedExcelReport {
  const cols = activeColumns(values);
  const columns = cols.map((c) => c.label);
  const rows = buildActivityExcelRows(values);
  const now = new Date();
  const period =
    values.startDate && values.endDate
      ? `${toFileDate(values.startDate)}_to_${toFileDate(values.endDate)}`
      : toFileDate(now.toISOString().slice(0, 10));

  return {
    id: `activity-excel-${now.getTime()}`,
    kind: 'activity-excel',
    name: `Activity_Excel_Report_${period}.csv`,
    generatedBy: by,
    generatedAt: now.toISOString(),
    startDate: values.startDate,
    endDate: values.endDate,
    filterBy: 'classroom',
    selectedLabel: values.rooms.length ? values.rooms.join(', ') : 'All rooms',
    selectedColumns: columns,
    recordCount: rows.length,
    status: 'Generated',
    columns,
    rows,
  };
}
