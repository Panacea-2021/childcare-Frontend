import type { EnquiryRecord, EnquiryStat, FacultyOption, DefaultEnquiryStage } from './types';
import { STAT_META } from './types';
import type { EnquiryStageConfig } from '@/lib/enquiries/types';
import { getStageIcon } from './stage-icon';
import { Flag } from 'lucide-react';

export const FACULTY_OPTIONS: FacultyOption[] = [
  { id: 'f1', name: 'John Smith', initials: 'JS', role: 'Admissions Lead' },
  { id: 'f2', name: 'Sarah Wilson', initials: 'SW', role: 'Centre Manager' },
  { id: 'f3', name: 'Priya Nair', initials: 'PN', role: 'Lead Teacher' },
  { id: 'f4', name: 'Rohit Menon', initials: 'RM', role: 'Admin' },
  { id: 'f5', name: 'Ananya Rao', initials: 'AR', role: 'Counsellor' },
];

export const SCHOOL_OPTIONS = [
  { value: 'panacea-hq', label: 'Panacea Early Years — HQ' },
  { value: 'panacea-west', label: 'Panacea Early Years — West Campus' },
  { value: 'panacea-east', label: 'Panacea Early Years — East Campus' },
  { value: 'little-oaks', label: 'Little Oaks Preschool' },
];

export const SUB_PARENT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'guardian', label: 'Legal Guardian' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'aunt-uncle', label: 'Aunt / Uncle' },
  { value: 'nanny', label: 'Nanny / Caregiver' },
];

export const PROGRAM_OPTIONS = [
  { value: 'early-explorers', label: 'Early Explorers (1–2 yrs)' },
  { value: 'little-learners', label: 'Little Learners (2–3 yrs)' },
  { value: 'pre-k-prep', label: 'Pre-K Prep (4–5 yrs)' },
  { value: 'weekend-play', label: 'Weekend Play Club' },
];

export const SEED_ENQUIRIES: EnquiryRecord[] = [
  {
    id: 'e1',
    studentName: 'Aarav Mehta',
    preferredName: 'Aarav',
    stage: 'Interested',
    gender: 'Male',
    dateOfBirth: '2023-04-12',
    source: 'Website',
    subSource: 'Contact Form',
    program: 'Little Learners (2–3 yrs)',
    assignedTo: 'John Smith',
    createdOn: '2026-07-28',
    expectedStartDate: '2026-09-01',
    motherName: 'Neha Mehta',
    motherPhone: '+91 98765 43210',
    motherEmail: 'neha.mehta@email.com',
    fatherName: 'Rohan Mehta',
    fatherPhone: '+91 98765 43211',
    school: 'Panacea Early Years — HQ',
    interest: 'Full day program',
    activities: [
      {
        id: 'a1',
        type: 'created',
        title: 'Enquiry created',
        description: 'Submitted via Website contact form',
        at: '2026-07-28T10:20:00',
      },
      {
        id: 'a2',
        type: 'stage',
        title: 'Moved to Interested',
        description: 'Family requested a campus tour',
        at: '2026-07-29T14:05:00',
      },
      {
        id: 'a3',
        type: 'contact',
        title: 'Phone call logged',
        description: 'Spoke with mother about program options',
        at: '2026-07-30T11:30:00',
      },
    ],
  },
  {
    id: 'e2',
    studentName: 'Mia Kapoor',
    stage: 'Stored',
    gender: 'Female',
    source: 'Referral',
    subSource: 'Parent',
    program: 'Early Explorers (1–2 yrs)',
    assignedTo: 'Sarah Wilson',
    createdOn: '2026-07-30',
    expectedStartDate: '2026-10-01',
    motherName: 'Anika Kapoor',
    motherPhone: '+91 90000 11223',
    motherEmail: 'anika.kapoor@email.com',
    interest: 'Half day option',
    activities: [
      {
        id: 'a4',
        type: 'created',
        title: 'Enquiry created',
        description: 'Referred by an existing parent',
        at: '2026-07-30T09:15:00',
      },
    ],
  },
  {
    id: 'e3',
    studentName: 'Vihaan Shah',
    stage: 'Admitted',
    gender: 'Male',
    source: 'Walk In',
    subSource: 'Campus Visit',
    program: 'Pre-K Prep (4–5 yrs)',
    assignedTo: 'Priya Nair',
    createdOn: '2026-07-18',
    expectedStartDate: '2026-08-15',
    motherName: 'Rhea Shah',
    motherPhone: '+91 98111 22334',
    fatherName: 'Kunal Shah',
    fatherPhone: '+91 98111 22335',
    activities: [
      {
        id: 'a5',
        type: 'created',
        title: 'Enquiry created',
        at: '2026-07-18T16:40:00',
      },
      {
        id: 'a6',
        type: 'appointment',
        title: 'Admission meeting',
        description: 'Documents verified and seat confirmed',
        at: '2026-07-20T11:00:00',
      },
      {
        id: 'a7',
        type: 'stage',
        title: 'Moved to Admitted',
        at: '2026-07-20T11:45:00',
      },
    ],
  },
  {
    id: 'e4',
    studentName: 'Sara Fernandes',
    preferredName: 'Sara',
    stage: 'Waitlisted',
    gender: 'Female',
    source: 'Instagram',
    subSource: 'Story Ad',
    program: 'Little Learners (2–3 yrs)',
    assignedTo: 'Ananya Rao',
    createdOn: '2026-07-22',
    expectedStartDate: '2026-09-15',
    motherName: 'Lisa Fernandes',
    motherPhone: '+91 97654 11002',
    motherEmail: 'lisa.fernandes@email.com',
    activities: [
      {
        id: 'a8',
        type: 'created',
        title: 'Enquiry created',
        description: 'Lead from Instagram story ad',
        at: '2026-07-22T13:10:00',
      },
      {
        id: 'a9',
        type: 'stage',
        title: 'Moved to Waitlisted',
        description: 'Preferred batch is currently full',
        at: '2026-07-25T10:00:00',
      },
    ],
  },
  {
    id: 'e5',
    studentName: 'Kabir Nair',
    stage: 'Lost',
    gender: 'Male',
    source: 'Facebook Ads',
    subSource: 'Lead Form',
    lostReason: 'Fee Too High',
    program: 'Weekend Play Club',
    assignedTo: 'Rohit Menon',
    createdOn: '2026-07-10',
    fatherName: 'Arjun Nair',
    fatherPhone: '+91 95555 66778',
    activities: [
      {
        id: 'a10',
        type: 'created',
        title: 'Enquiry created',
        at: '2026-07-10T08:50:00',
      },
      {
        id: 'a11',
        type: 'stage',
        title: 'Moved to Lost',
        description: 'Reason: Fee Too High',
        at: '2026-07-15T17:20:00',
      },
    ],
  },
  {
    id: 'e6',
    studentName: 'Ishita Bose',
    preferredName: 'Ishi',
    stage: 'Interested',
    gender: 'Female',
    source: 'WhatsApp',
    subSource: 'Direct Chat',
    program: 'Early Explorers (1–2 yrs)',
    assignedTo: 'Sarah Wilson',
    createdOn: '2026-08-01',
    expectedStartDate: '2026-09-08',
    motherName: 'Mita Bose',
    motherPhone: '+91 91234 56780',
    motherEmail: 'mita.bose@email.com',
    activities: [
      {
        id: 'a12',
        type: 'created',
        title: 'Enquiry created',
        description: 'Inbound WhatsApp enquiry',
        at: '2026-08-01T19:05:00',
      },
    ],
  },
  {
    id: 'e7',
    studentName: 'Reyansh Iyer',
    stage: 'Stored',
    gender: 'Male',
    source: 'Website',
    subSource: 'Landing Page',
    program: 'Little Learners (2–3 yrs)',
    assignedTo: 'John Smith',
    createdOn: '2026-08-02',
    expectedStartDate: '2026-10-15',
    motherName: 'Divya Iyer',
    motherPhone: '+91 99887 76655',
    fatherName: 'Suresh Iyer',
    fatherPhone: '+91 99887 76656',
    activities: [
      {
        id: 'a13',
        type: 'created',
        title: 'Enquiry created',
        at: '2026-08-02T07:40:00',
      },
    ],
  },
  {
    id: 'e8',
    studentName: 'Anaya Joshi',
    preferredName: 'Anaya',
    stage: 'Waitlisted',
    gender: 'Female',
    source: 'Referral',
    subSource: 'Friend',
    program: 'Pre-K Prep (4–5 yrs)',
    assignedTo: 'Priya Nair',
    createdOn: '2026-07-25',
    expectedStartDate: '2026-09-20',
    motherName: 'Pooja Joshi',
    motherPhone: '+91 98700 11234',
    motherEmail: 'pooja.joshi@email.com',
    activities: [
      {
        id: 'a14',
        type: 'created',
        title: 'Enquiry created',
        at: '2026-07-25T12:25:00',
      },
      {
        id: 'a15',
        type: 'note',
        title: 'Note added',
        description: 'Prefers morning batch near West Campus',
        at: '2026-07-26T09:00:00',
      },
    ],
  },
  {
    id: 'e9',
    studentName: 'Dev Patel',
    stage: 'Stored',
    gender: 'Male',
    source: 'Google Search',
    subSource: 'Google Ads',
    program: 'Early Explorers (1–2 yrs)',
    assignedTo: 'Ananya Rao',
    createdOn: '2026-08-03',
    expectedStartDate: '2026-11-01',
    motherName: 'Kavita Patel',
    motherPhone: '+91 90123 45678',
    activities: [
      {
        id: 'a16',
        type: 'created',
        title: 'Enquiry created',
        description: 'Google Ads lead form',
        at: '2026-08-03T15:10:00',
      },
    ],
  },
  {
    id: 'e10',
    studentName: 'Zara Khan',
    preferredName: 'Zara',
    stage: 'Interested',
    gender: 'Female',
    source: 'Event',
    subSource: 'Open House',
    program: 'Little Learners (2–3 yrs)',
    assignedTo: 'Rohit Menon',
    createdOn: '2026-08-04',
    expectedStartDate: '2026-09-10',
    motherName: 'Aisha Khan',
    motherPhone: '+91 93456 77889',
    fatherName: 'Imran Khan',
    activities: [
      {
        id: 'a17',
        type: 'created',
        title: 'Enquiry created',
        description: 'Captured at open house event',
        at: '2026-08-04T18:30:00',
      },
      {
        id: 'a18',
        type: 'appointment',
        title: 'Tour scheduled',
        description: 'Campus walkthrough booked for next week',
        at: '2026-08-05T10:00:00',
      },
    ],
  },
];

const DEFAULT_TRENDS: Record<DefaultEnquiryStage, string> = {
  Stored: '+12 Today',
  Admitted: '+5 This Week',
  Interested: '+8 This Week',
  Waitlisted: '+3 Today',
  Lost: '-2 This Week',
};

export function buildEnquiryStats(
  items: EnquiryRecord[],
  stageConfigs?: EnquiryStageConfig[],
): EnquiryStat[] {
  if (stageConfigs?.length) {
    return [...stageConfigs]
      .filter((s) => s.active)
      .sort((a, b) => a.order - b.order)
      .map((stage) => ({
        id: stage.id,
        label: stage.name,
        count: items.filter((i) => i.stage === stage.name).length,
        subtitle: 'Students',
        trend: DEFAULT_TRENDS[stage.name as DefaultEnquiryStage] ?? '+0',
        tone: (STAT_META[stage.name as DefaultEnquiryStage]?.tone ??
          'custom') as EnquiryStat['tone'],
        color: stage.color,
        Icon: getStageIcon(stage.icon),
      }));
  }

  const stages: DefaultEnquiryStage[] = [
    'Stored',
    'Admitted',
    'Interested',
    'Waitlisted',
    'Lost',
  ];
  return stages.map((label) => {
    const meta = STAT_META[label];
    return {
      id: label.toLowerCase(),
      label,
      count: items.filter((i) => i.stage === label).length,
      subtitle: meta.subtitle,
      trend: DEFAULT_TRENDS[label],
      tone: meta.tone,
      Icon: meta.Icon ?? Flag,
    };
  });
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function parentContactOf(item: EnquiryRecord) {
  return (
    item.motherPhone ||
    item.fatherPhone ||
    item.motherEmail ||
    item.fatherEmail ||
    item.motherName ||
    item.fatherName ||
    '—'
  );
}

export const DEFAULT_ENQUIRY_FILTERS = {
  search: '',
  stage: 'All' as const,
  assignedTo: 'All' as const,
  source: 'All' as const,
  program: 'All' as const,
  dateFrom: '',
  dateTo: '',
};

export function filterEnquiries(
  items: EnquiryRecord[],
  filters: {
    search: string;
    stage: string;
    assignedTo: string;
    source: string;
    program: string;
    dateFrom: string;
    dateTo: string;
  },
) {
  const q = filters.search.trim().toLowerCase();
  return items.filter((item) => {
    if (filters.stage !== 'All' && item.stage !== filters.stage) return false;
    if (filters.assignedTo !== 'All' && item.assignedTo !== filters.assignedTo) return false;
    if (filters.source !== 'All' && item.source !== filters.source) return false;
    if (filters.program !== 'All' && item.program !== filters.program) return false;
    if (filters.dateFrom && item.createdOn < filters.dateFrom) return false;
    if (filters.dateTo && item.createdOn > filters.dateTo) return false;

    if (!q) return true;
    const hay = [
      item.studentName,
      item.preferredName,
      item.source,
      item.program,
      item.assignedTo,
      item.motherName,
      item.fatherName,
      item.motherPhone,
      item.fatherPhone,
      item.motherEmail,
      item.fatherEmail,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  });
}
