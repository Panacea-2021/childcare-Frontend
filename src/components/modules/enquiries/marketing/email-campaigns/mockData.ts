import type {
  AudienceFilters,
  EmailBlock,
  EmailCampaign,
  EmailTemplate,
  RecipientActivity,
} from './types';

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function blankAudience(): AudienceFilters {
  return {
    audienceType: '',
    className: '',
    section: '',
    campus: '',
    admissionStatus: '',
  };
}

export function estimateRecipients(filters: AudienceFilters): number {
  if (!filters.audienceType) return 0;
  const base: Record<string, number> = {
    all_parents: 842,
    parents_of_students: 624,
    students: 510,
    staff: 86,
    prospective_parents: 218,
    new_enquiries: 94,
    active_enquiries: 156,
    interested_leads: 132,
    custom: 48,
  };
  let n = base[filters.audienceType] ?? 100;
  if (filters.className) n = Math.round(n * 0.28);
  if (filters.section) n = Math.round(n * 0.55);
  if (filters.campus === 'Main Campus') n = Math.round(n * 0.7);
  if (filters.campus === 'East Wing') n = Math.round(n * 0.3);
  if (filters.admissionStatus === 'Active') n = Math.round(n * 0.85);
  if (filters.admissionStatus === 'Pending') n = Math.round(n * 0.25);
  return Math.max(12, n);
}

export function audienceLabel(filters: AudienceFilters): string {
  const map: Record<string, string> = {
    all_parents: 'All Parents',
    parents_of_students: 'Parents of Students',
    students: 'Students',
    staff: 'Staff',
    prospective_parents: 'Prospective Parents',
    new_enquiries: 'New Enquiries',
    active_enquiries: 'Active Enquiries',
    interested_leads: 'Interested Leads',
    custom: 'Custom Audience',
  };
  if (!filters.audienceType) return '—';
  const parts = [map[filters.audienceType] ?? 'Audience'];
  if (filters.className) parts.push(filters.className);
  if (filters.section) parts.push(`Sec ${filters.section}`);
  return parts.join(' · ');
}

export function defaultBlocks(theme: 'welcome' | 'event' | 'camp' | 'blank' = 'blank'): EmailBlock[] {
  if (theme === 'blank') {
    return [
      {
        id: uid('blk'),
        type: 'logo',
        content: 'Bright Future Academy',
        align: 'center',
      },
      {
        id: uid('blk'),
        type: 'heading',
        content: 'Your headline here',
        align: 'center',
      },
      {
        id: uid('blk'),
        type: 'paragraph',
        content: 'Write your message to parents and the school community…',
        align: 'left',
      },
      {
        id: uid('blk'),
        type: 'button',
        content: 'Learn More',
        href: 'https://example.com',
        align: 'center',
      },
      {
        id: uid('blk'),
        type: 'footer',
        content: 'Bright Future Academy · admissions@school.com · Unsubscribe',
        align: 'center',
      },
    ];
  }

  if (theme === 'camp') {
    return [
      { id: uid('blk'), type: 'logo', content: 'Bright Future Academy', align: 'center' },
      {
        id: uid('blk'),
        type: 'image',
        content: 'Summer adventures await',
        align: 'center',
        meta: { accent: '#FDE68A' },
      },
      { id: uid('blk'), type: 'heading', content: 'Summer Camp 2026', align: 'center' },
      {
        id: uid('blk'),
        type: 'paragraph',
        content:
          'Exciting activities await your child this summer — arts, sports, science labs, and outdoor exploration led by our caring staff.',
        align: 'left',
      },
      {
        id: uid('blk'),
        type: 'button',
        content: 'Reserve a Spot',
        href: 'https://example.com/summer-camp',
        align: 'center',
      },
      { id: uid('blk'), type: 'divider', content: '' },
      {
        id: uid('blk'),
        type: 'footer',
        content: 'Bright Future Academy · Main Campus · Unsubscribe',
        align: 'center',
      },
    ];
  }

  if (theme === 'event') {
    return [
      { id: uid('blk'), type: 'logo', content: 'Bright Future Academy', align: 'center' },
      { id: uid('blk'), type: 'heading', content: 'You are invited!', align: 'center' },
      {
        id: uid('blk'),
        type: 'paragraph',
        content:
          'Join us for our Open Day. Tour classrooms, meet teachers, and explore how we nurture every child.',
        align: 'left',
      },
      {
        id: uid('blk'),
        type: 'button',
        content: 'RSVP Now',
        href: 'https://example.com/open-day',
        align: 'center',
      },
      { id: uid('blk'), type: 'social', content: 'Follow us', align: 'center' },
      {
        id: uid('blk'),
        type: 'footer',
        content: 'Bright Future Academy · office@school.com · Unsubscribe',
        align: 'center',
      },
    ];
  }

  return [
    { id: uid('blk'), type: 'logo', content: 'Bright Future Academy', align: 'center' },
    { id: uid('blk'), type: 'heading', content: 'Welcome to our school family', align: 'center' },
    {
      id: uid('blk'),
      type: 'paragraph',
      content:
        'We are delighted to welcome you. Here is everything you need to get started at Bright Future Academy.',
      align: 'left',
    },
    {
      id: uid('blk'),
      type: 'button',
      content: 'Parent Portal',
      href: 'https://example.com/portal',
      align: 'center',
    },
    {
      id: uid('blk'),
      type: 'footer',
      content: 'Bright Future Academy · admissions@school.com · Unsubscribe',
      align: 'center',
    },
  ];
}

function sampleRecipients(): RecipientActivity[] {
  return [
    {
      id: 'r1',
      contactName: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      status: 'Opened',
      deliveredAt: '2026-08-08T09:05:00',
      openedAt: '2026-08-08T10:12:00',
      converted: false,
    },
    {
      id: 'r2',
      contactName: 'James Okonkwo',
      email: 'james.o@email.com',
      status: 'Clicked',
      deliveredAt: '2026-08-08T09:05:00',
      openedAt: '2026-08-08T09:40:00',
      clickedAt: '2026-08-08T09:41:00',
      converted: true,
    },
    {
      id: 'r3',
      contactName: 'Aisha Khan',
      email: 'aisha.k@email.com',
      status: 'Delivered',
      deliveredAt: '2026-08-08T09:06:00',
      converted: false,
    },
    {
      id: 'r4',
      contactName: 'Daniel Lee',
      email: 'd.lee@email.com',
      status: 'Bounced',
      converted: false,
    },
    {
      id: 'r5',
      contactName: 'Maria Santos',
      email: 'maria.s@email.com',
      status: 'Unsubscribed',
      deliveredAt: '2026-08-08T09:05:00',
      openedAt: '2026-08-08T11:00:00',
      converted: false,
    },
    {
      id: 'r6',
      contactName: 'Chen Wei',
      email: 'chen.wei@email.com',
      status: 'Clicked',
      deliveredAt: '2026-08-08T09:05:00',
      openedAt: '2026-08-08T14:22:00',
      clickedAt: '2026-08-08T14:25:00',
      converted: false,
    },
  ];
}

export const MOCK_RECIPIENT_PREVIEW = [
  { id: 'p1', name: 'Priya Sharma', email: 'priya.sharma@email.com', relation: 'Parent' },
  { id: 'p2', name: 'James Okonkwo', email: 'james.o@email.com', relation: 'Parent' },
  { id: 'p3', name: 'Aisha Khan', email: 'aisha.k@email.com', relation: 'Parent' },
  { id: 'p4', name: 'Daniel Lee', email: 'd.lee@email.com', relation: 'Parent' },
  { id: 'p5', name: 'Maria Santos', email: 'maria.s@email.com', relation: 'Guardian' },
  { id: 'p6', name: 'Chen Wei', email: 'chen.wei@email.com', relation: 'Parent' },
  { id: 'p7', name: 'Olivia Brown', email: 'o.brown@email.com', relation: 'Parent' },
  { id: 'p8', name: 'Rahul Mehta', email: 'rahul.m@email.com', relation: 'Parent' },
];

export const SEED_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-welcome',
    name: 'Welcome New Parent',
    category: 'Welcome',
    subject: 'Welcome to Bright Future Academy!',
    previewText: 'Everything you need to settle in with your child.',
    blocks: defaultBlocks('welcome'),
    updatedAt: '2026-07-28T10:00:00.000Z',
    previewAccent: '#C7D2FE',
  },
  {
    id: 'tpl-open-day',
    name: 'Admission Open Day',
    category: 'Admissions',
    subject: 'Join our Admission Open Day',
    previewText: 'Tour classrooms and meet our teachers.',
    blocks: defaultBlocks('event'),
    updatedAt: '2026-07-30T09:00:00.000Z',
    previewAccent: '#BBF7D0',
  },
  {
    id: 'tpl-event',
    name: 'School Event Invitation',
    category: 'Events',
    subject: 'You are invited to our school event',
    previewText: 'Celebrate learning with our community.',
    blocks: defaultBlocks('event'),
    updatedAt: '2026-07-22T12:00:00.000Z',
    previewAccent: '#FDE68A',
  },
  {
    id: 'tpl-meeting',
    name: 'Parent Meeting Reminder',
    category: 'Parent Communication',
    subject: 'Reminder: Parent-Teacher Meeting',
    previewText: 'Your meeting schedule is ready.',
    blocks: defaultBlocks('welcome'),
    updatedAt: '2026-07-18T08:00:00.000Z',
    previewAccent: '#FBCFE8',
  },
  {
    id: 'tpl-camp',
    name: 'Summer Camp Announcement',
    category: 'Promotions',
    subject: 'Join Us for Our Summer Camp! ☀️',
    previewText: 'Discover exciting activities planned for your child…',
    blocks: defaultBlocks('camp'),
    updatedAt: '2026-08-01T11:00:00.000Z',
    previewAccent: '#FDE68A',
  },
  {
    id: 'tpl-fee',
    name: 'Fee Reminder',
    category: 'School Updates',
    subject: 'Friendly reminder about upcoming fees',
    previewText: 'A quick note about your fee schedule.',
    blocks: defaultBlocks('blank'),
    updatedAt: '2026-07-12T10:00:00.000Z',
    previewAccent: '#FECACA',
  },
  {
    id: 'tpl-newsletter',
    name: 'School Newsletter',
    category: 'Newsletter',
    subject: 'This month at Bright Future Academy',
    previewText: 'Highlights, events, and classroom moments.',
    blocks: defaultBlocks('welcome'),
    updatedAt: '2026-07-05T10:00:00.000Z',
    previewAccent: '#A5F3FC',
  },
  {
    id: 'tpl-achievement',
    name: 'Student Achievement',
    category: 'Announcements',
    subject: 'Celebrating our students’ achievements',
    previewText: 'Proud moments from our classrooms.',
    blocks: defaultBlocks('event'),
    updatedAt: '2026-06-28T10:00:00.000Z',
    previewAccent: '#DDD6FE',
  },
  {
    id: 'tpl-holiday',
    name: 'Holiday Announcement',
    category: 'Announcements',
    subject: 'Upcoming holiday schedule',
    previewText: 'Important dates for families.',
    blocks: defaultBlocks('blank'),
    updatedAt: '2026-06-20T10:00:00.000Z',
    previewAccent: '#FED7AA',
  },
  {
    id: 'tpl-thanks',
    name: 'Thank You for Visiting',
    category: 'Follow-up',
    subject: 'Thank you for visiting Bright Future Academy',
    previewText: 'We loved meeting your family.',
    blocks: defaultBlocks('welcome'),
    updatedAt: '2026-06-15T10:00:00.000Z',
    previewAccent: '#BFDBFE',
  },
  {
    id: 'tpl-followup',
    name: 'New Admission Follow-up',
    category: 'Follow-up',
    subject: 'Next steps for your child’s admission',
    previewText: 'Here’s how to continue your application.',
    blocks: defaultBlocks('welcome'),
    updatedAt: '2026-06-10T10:00:00.000Z',
    previewAccent: '#C7D2FE',
  },
  {
    id: 'tpl-birthday',
    name: 'Birthday Greeting',
    category: 'Parent Communication',
    subject: 'Happy Birthday from Bright Future Academy!',
    previewText: 'Wishing your little one a wonderful day.',
    blocks: defaultBlocks('camp'),
    updatedAt: '2026-06-01T10:00:00.000Z',
    previewAccent: '#FBCFE8',
  },
];

export const SEED_CAMPAIGNS: EmailCampaign[] = [
  {
    id: 'cmp-summer',
    name: 'Summer Camp Invitation',
    fromName: 'Bright Future Academy',
    fromEmail: 'admissions@school.com',
    replyTo: 'admissions@school.com',
    subject: 'Join Us for Our Summer Camp! ☀️',
    previewText: 'Discover exciting activities planned for your child…',
    audienceLabel: 'Parents',
    audience: {
      audienceType: 'all_parents',
      className: '',
      section: '',
      campus: 'Main Campus',
      admissionStatus: 'Active',
    },
    recipientCount: 324,
    channel: 'Email',
    status: 'Sent',
    sentAt: '2026-08-08T09:00:00.000Z',
    openRate: 68,
    clickRate: 24,
    blocks: defaultBlocks('camp'),
    attachments: [
      {
        id: 'att1',
        name: 'Summer_Camp_Brochure.pdf',
        sizeLabel: '2.4 MB',
        sizeBytes: 2.4 * 1024 * 1024,
        mimeType: 'application/pdf',
      },
    ],
    scheduleMode: 'now',
    timezone: 'IST',
    templateId: 'tpl-camp',
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-08T09:00:00.000Z',
    analytics: {
      delivered: 318,
      opened: 220,
      clicked: 78,
      bounced: 6,
      unsubscribed: 2,
      conversions: 41,
    },
    recipients: sampleRecipients(),
  },
  {
    id: 'cmp-open-day',
    name: 'New Admission Open Day',
    fromName: 'Bright Future Academy',
    fromEmail: 'admissions@school.com',
    replyTo: 'admissions@school.com',
    subject: 'Admission Open Day — Save the Date',
    previewText: 'Tour our campus and meet the team.',
    audienceLabel: 'Parents + Leads',
    audience: {
      audienceType: 'prospective_parents',
      className: '',
      section: '',
      campus: '',
      admissionStatus: '',
    },
    recipientCount: 582,
    channel: 'Email',
    status: 'Scheduled',
    scheduledAt: '2026-08-12T04:30:00.000Z',
    blocks: defaultBlocks('event'),
    attachments: [],
    scheduleMode: 'later',
    timezone: 'IST',
    templateId: 'tpl-open-day',
    createdAt: '2026-08-06T14:00:00.000Z',
    updatedAt: '2026-08-07T09:00:00.000Z',
  },
  {
    id: 'cmp-welcome',
    name: 'Welcome to Bright Future Academy',
    fromName: 'Bright Future Academy',
    fromEmail: 'admissions@school.com',
    replyTo: 'office@school.com',
    subject: 'Welcome to Bright Future Academy!',
    previewText: 'A warm welcome to our newest families.',
    audienceLabel: 'New Parents',
    audience: {
      audienceType: 'parents_of_students',
      className: '',
      section: '',
      campus: 'Main Campus',
      admissionStatus: 'Active',
    },
    recipientCount: 148,
    channel: 'Email',
    status: 'Draft',
    blocks: defaultBlocks('welcome'),
    attachments: [],
    scheduleMode: 'now',
    timezone: 'IST',
    templateId: 'tpl-welcome',
    createdAt: '2026-08-07T16:00:00.000Z',
    updatedAt: '2026-08-07T18:30:00.000Z',
  },
];

export function formatCampaignDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatRate(n?: number) {
  if (n === undefined || n === null) return '—';
  return `${n}%`;
}

export function createEmptyCampaign(partial?: Partial<EmailCampaign>): EmailCampaign {
  const now = new Date().toISOString();
  return {
    id: uid('cmp'),
    name: '',
    fromName: 'Bright Future Academy',
    fromEmail: 'admissions@school.com',
    replyTo: 'admissions@school.com',
    subject: '',
    previewText: '',
    audienceLabel: '—',
    audience: blankAudience(),
    recipientCount: 0,
    channel: 'Email',
    status: 'Draft',
    blocks: defaultBlocks('blank'),
    attachments: [],
    scheduleMode: 'now',
    timezone: 'IST',
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}
