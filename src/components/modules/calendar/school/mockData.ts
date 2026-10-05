import type { SchoolEvent, SchoolEventCategory, SchoolEventFormState, SchoolFiltersState } from './types';
import { SCHOOL_CATEGORIES } from './types';
import { addDays, parseISODate, toDisplayTime, toISODate } from '../mockData';
import { loadActiveCenterRooms } from '@/lib/center-management/programCatalog';

export { toISODate, parseISODate, toDisplayTime, addDays };

/** Seed events clustered around July–Aug 2026 for a rich calendar demo. */
export const seedSchoolEvents: SchoolEvent[] = [
  {
    id: 'sc1',
    name: 'Independence Day Celebration',
    category: 'Holiday',
    classrooms: ['Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2'],
    description: 'Flag hoisting, cultural performances, and a special assembly celebrating Independence Day with parents invited.',
    startDate: '2026-07-15',
    endDate: '2026-07-15',
    startTime: '09:00',
    endTime: '12:00',
    coverUrl: 'gradient:holiday',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [{ id: 'a1', name: 'Independence_Day_Program.pdf', sizeLabel: '240 KB', type: 'pdf' }],
    status: 'upcoming',
  },
  {
    id: 'sc2',
    name: 'Annual Sports Day',
    category: 'Sports Event',
    classrooms: ['LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3'],
    description: 'Track events, relay races, and fun games for every age group. Bring water bottles and sports shoes.',
    startDate: '2026-07-20',
    endDate: '2026-07-20',
    startTime: '08:00',
    endTime: '14:00',
    coverUrl: 'gradient:sports',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
  {
    id: 'sc3',
    name: 'Parent–Teacher Meeting',
    category: 'Parent Meeting',
    classrooms: ['Grade 1', 'Grade 2'],
    description: 'Discuss mid-term progress, classroom goals, and partnership opportunities for the next term.',
    startDate: '2026-07-22',
    endDate: '2026-07-22',
    startTime: '16:00',
    endTime: '18:30',
    coverUrl: 'gradient:meeting',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: true,
    attachments: [{ id: 'a2', name: 'PTM_Slots.xlsx', sizeLabel: '48 KB', type: 'excel' }],
    status: 'upcoming',
  },
  {
    id: 'sc4',
    name: 'Mid-Term Assessments',
    category: 'Exam',
    classrooms: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    description: 'Written assessments across core subjects. Please ensure children arrive on time and well-rested.',
    startDate: '2026-07-24',
    endDate: '2026-07-28',
    startTime: '09:30',
    endTime: '12:00',
    coverUrl: 'gradient:exam',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
  {
    id: 'sc5',
    name: 'Cultural Fest — Rainbow Week',
    category: 'Cultural Event',
    classrooms: ['Nursery', 'LKG', 'UKG'],
    description: 'A week of music, dance, storytelling, and colorful dress-up days celebrating cultures from around the world.',
    startDate: '2026-07-27',
    endDate: '2026-07-31',
    startTime: '10:00',
    endTime: '13:00',
    coverUrl: 'gradient:cultural',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
  {
    id: 'sc6',
    name: 'Staff Development Workshop',
    category: 'Workshop',
    classrooms: ['Nursery', 'LKG', 'UKG', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
    description: 'Internal workshop on playful learning strategies and classroom observation techniques.',
    startDate: '2026-07-18',
    endDate: '2026-07-18',
    startTime: '14:00',
    endTime: '17:00',
    coverUrl: 'gradient:workshop',
    staffOnly: true,
    notifyStaff: true,
    notifyParents: false,
    disableComments: true,
    attachments: [{ id: 'a3', name: 'Workshop_Agenda.docx', sizeLabel: '92 KB', type: 'word' }],
    status: 'upcoming',
  },
  {
    id: 'sc7',
    name: 'Science Fair Kickoff',
    category: 'Important Date',
    classrooms: ['Grade 3', 'Grade 4', 'Grade 5'],
    description: 'Project briefings and theme reveal for the annual science fair. Families welcome in the afternoon.',
    startDate: '2026-08-03',
    endDate: '2026-08-03',
    startTime: '11:00',
    endTime: '15:00',
    coverUrl: 'gradient:important',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
  {
    id: 'sc8',
    name: 'Open House Tour',
    category: 'Event',
    classrooms: ['Nursery', 'LKG', 'UKG'],
    description: 'Prospective families tour classrooms, meet teachers, and experience a sample circle time.',
    startDate: '2026-07-25',
    endDate: '2026-07-25',
    startTime: '10:00',
    endTime: '12:30',
    coverUrl: 'gradient:event',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: false,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
  {
    id: 'sc9',
    name: 'Friendship Day Party',
    category: 'Celebration',
    classrooms: ['Nursery', 'LKG', 'UKG', 'Grade 1'],
    description: 'Friendship bands, story time, and a shared snack celebrating kindness and friendship.',
    startDate: '2026-08-01',
    endDate: '2026-08-01',
    startTime: '09:30',
    endTime: '11:30',
    coverUrl: 'gradient:celebration',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
  {
    id: 'sc10',
    name: 'Inter-House Cricket Match',
    category: 'Sports Event',
    classrooms: ['Grade 3', 'Grade 4', 'Grade 5'],
    description: 'Friendly cricket tournament between house teams. Spectators welcome on the playground.',
    startDate: '2026-07-20',
    endDate: '2026-07-20',
    startTime: '15:00',
    endTime: '17:30',
    coverUrl: 'gradient:sports',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    status: 'upcoming',
  },
];

export function isGradientCover(url?: string): boolean {
  return Boolean(url?.startsWith('gradient:'));
}

export function coverTone(url?: string, category?: string): string {
  if (url?.startsWith('gradient:')) return url.replace('gradient:', '');
  if (category === 'Holiday') return 'holiday';
  if (category === 'Sports Event') return 'sports';
  if (category === 'Exam') return 'exam';
  if (category === 'Important Date') return 'important';
  if (category === 'Cultural Event') return 'cultural';
  if (category === 'Parent Meeting') return 'meeting';
  if (category === 'Workshop') return 'workshop';
  if (category === 'Celebration') return 'celebration';
  return 'event';
}

export function emptyEventForm(defaults?: Partial<SchoolEventFormState>): SchoolEventFormState {
  return {
    name: '',
    category: '',
    classrooms: [],
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    coverUrl: '',
    coverFileName: '',
    staffOnly: false,
    notifyStaff: true,
    notifyParents: true,
    disableComments: false,
    attachments: [],
    ...defaults,
  };
}

export function eventToForm(event: SchoolEvent): SchoolEventFormState {
  return {
    name: event.name,
    category: event.category,
    classrooms: [...event.classrooms],
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    startTime: event.startTime,
    endTime: event.endTime,
    coverUrl: event.coverUrl ?? '',
    coverFileName: '',
    staffOnly: event.staffOnly,
    notifyStaff: event.notifyStaff,
    notifyParents: event.notifyParents,
    disableComments: event.disableComments,
    attachments: [...event.attachments],
  };
}

export function formToEvent(form: SchoolEventFormState, existing?: SchoolEvent): SchoolEvent {
  const category = (form.category || 'Event') as SchoolEventCategory;
  return {
    id: existing?.id ?? `sc-${Date.now()}`,
    name: form.name.trim(),
    category,
    classrooms: [...form.classrooms],
    description: form.description.trim(),
    startDate: form.startDate,
    endDate: form.endDate || form.startDate,
    startTime: form.startTime || '09:00',
    endTime: form.endTime || '12:00',
    coverUrl: form.coverUrl || undefined,
    staffOnly: form.staffOnly,
    notifyStaff: form.notifyStaff,
    notifyParents: form.notifyParents,
    disableComments: form.disableComments,
    attachments: [...form.attachments],
    status: existing?.status ?? 'upcoming',
  };
}

export function monthTitle(d: Date): string {
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function formatDisplayDate(iso: string): string {
  if (!iso) return '—';
  const d = parseISODate(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTimeRange(start: string, end: string): string {
  if (!start && !end) return 'All day';
  if (!end) return toDisplayTime(start);
  return `${toDisplayTime(start)} – ${toDisplayTime(end)}`;
}

export function buildMonthCells(viewMonth: Date): { date: Date; inMonth: boolean }[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = startPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: addDays(last, 1), inMonth: false });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: addDays(last, 1), inMonth: false });
  }
  return cells;
}

export function eventsOnDate(events: SchoolEvent[], date: Date): SchoolEvent[] {
  const key = toISODate(date);
  return events.filter((e) => e.startDate <= key && e.endDate >= key);
}

export function filterEvents(
  events: SchoolEvent[],
  filters: SchoolFiltersState,
  viewMonth?: Date,
): SchoolEvent[] {
  const q = filters.search.trim().toLowerCase();
  return events.filter((e) => {
    if (q && !e.name.toLowerCase().includes(q)) return false;
    if (filters.classroom !== 'all' && !e.classrooms.includes(filters.classroom)) return false;
    if (filters.category !== 'all' && e.category !== filters.category) return false;
    if (filters.date) {
      if (!(e.startDate <= filters.date && e.endDate >= filters.date)) return false;
    } else if (viewMonth) {
      const start = toISODate(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1));
      const end = toISODate(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0));
      if (e.endDate < start || e.startDate > end) return false;
    }
    return true;
  });
}

export function categoryOptions() {
  return SCHOOL_CATEGORIES.map((c) => ({ value: c, label: c }));
}

export function classroomOptions() {
  return [
    { value: 'all', label: 'All Classrooms' },
    ...loadActiveCenterRooms().map((room) => ({ value: room.name, label: room.name })),
  ];
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileTypeFromName(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  if (['zip', 'rar'].includes(ext)) return 'zip';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  return 'file';
}
