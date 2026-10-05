import type { Announcement, RoomOption, StaffOption } from './types';
import { liveArray } from '@/lib/center-management/liveList';
import {
  loadActiveCenterRooms,
  loadActiveCenterStaff,
} from '@/lib/center-management/programCatalog';
import { initials } from '@/lib/center-management/studentsStore';

export const staffOptions: StaffOption[] = liveArray(() =>
  loadActiveCenterStaff().map((member) => ({
    id: member.id,
    name: member.name,
    avatar: initials(member.name),
    role: member.role,
    department: member.groups[0] || member.role,
  })),
);

export const roomOptions: RoomOption[] = liveArray(() =>
  loadActiveCenterRooms().map((room) => {
    const staff = loadActiveCenterStaff().filter((member) => member.rooms.includes(room.name));
    return {
      id: room.id,
      name: room.name,
      department: room.ageRange || 'Classroom',
      floor: room.ageRange || '—',
      staffCount: staff.length,
      staffAvatars: staff.slice(0, 4).map((member) => initials(member.name)),
    };
  }),
);

export const seedAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Weekly Staff Briefing — Safety Protocols',
    note: 'Please review the updated pickup safety checklist before Monday morning assembly. All classroom leads must confirm acknowledgement.',
    date: '2026-08-01',
    time: '09:00',
    mode: 'staff',
    staffIds: ['sf-1', 'sf-2', 'sf-3', 'sf-4'],
    roomId: null,
    methods: ['email', 'whatsapp'],
    attachments: [
      { id: 'att-1', name: 'safety-checklist.pdf', size: 245760, type: 'application/pdf' },
    ],
    referenceLink: 'https://drive.google.com/file/d/example',
    createdBy: 'Dr. Ananya Mehta',
    status: 'delivered',
    createdAt: '2026-08-01T08:30:00',
  },
  {
    id: 'ann-2',
    title: 'Room Deep Clean Schedule',
    note: 'Discovery Lab will undergo deep cleaning this Saturday. Please clear personal items from desks by Friday 5 PM.',
    date: '2026-08-02',
    time: '14:30',
    mode: 'room',
    staffIds: [],
    roomId: 'rm-3',
    methods: ['email', 'sms'],
    attachments: [],
    referenceLink: '',
    createdBy: 'Ms. Leena Joseph',
    status: 'scheduled',
    createdAt: '2026-07-31T16:10:00',
  },
  {
    id: 'ann-3',
    title: 'Parent-Teacher Conference Prep',
    note: 'Please prepare progress notes for your assigned families. Templates are attached. Submit drafts by Wednesday.',
    date: '2026-07-30',
    time: '11:15',
    mode: 'staff',
    staffIds: ['sf-2', 'sf-4', 'sf-8'],
    roomId: null,
    methods: ['email', 'whatsapp', 'sms'],
    attachments: [
      { id: 'att-2', name: 'ptc-template.docx', size: 51200, type: 'application/docx' },
      { id: 'att-3', name: 'sample-notes.pdf', size: 102400, type: 'application/pdf' },
    ],
    referenceLink: 'https://meet.google.com/abc-defg-hij',
    createdBy: 'Dr. Ananya Mehta',
    status: 'delivered',
    createdAt: '2026-07-30T10:00:00',
  },
  {
    id: 'ann-4',
    title: 'Fire Drill Reminder',
    note: 'Fire drill scheduled for all Early Years rooms. Escorts must keep attendance sheets ready at the assembly point.',
    date: '2026-08-01',
    time: '15:00',
    mode: 'room',
    staffIds: [],
    roomId: 'rm-1',
    methods: ['whatsapp', 'sms'],
    attachments: [],
    referenceLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    createdBy: 'Mr. Arjun Malhotra',
    status: 'pending',
    createdAt: '2026-08-01T07:45:00',
  },
  {
    id: 'ann-5',
    title: 'Payroll Cut-off Notice',
    note: 'Submit timesheets and leave adjustments before EOD Thursday to ensure timely payroll processing.',
    date: '2026-07-28',
    time: '10:00',
    mode: 'staff',
    staffIds: ['sf-5', 'sf-6', 'sf-1'],
    roomId: null,
    methods: ['email'],
    attachments: [{ id: 'att-4', name: 'timesheet.xlsx', size: 34816, type: 'application/zip' }],
    referenceLink: '',
    createdBy: 'Mr. Suresh Pillai',
    status: 'delivered',
    createdAt: '2026-07-28T09:20:00',
  },
];

export const emptyFormValues = {
  date: '',
  time: '',
  title: '',
  note: '',
  mode: 'staff' as const,
  staffIds: [] as string[],
  roomId: '',
  methods: [] as ('email' | 'whatsapp' | 'sms')[],
  attachments: [] as Announcement['attachments'],
  referenceLink: '',
};
