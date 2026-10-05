export type HeroExperienceId =
  | 'ai'
  | 'tours'
  | 'leads'
  | 'walkins'
  | 'forms';

export type HeroExperience = {
  id: HeroExperienceId;
  label: string;
  title: string;
  points: string[];
  ctaLabel: string;
};

export const HERO_EXPERIENCES: HeroExperience[] = [
  {
    id: 'ai',
    label: 'AI',
    title: 'AI Enrollment Agent',
    points: [
      'Answers family inquiries instantly',
      'Helps schedule tours automatically',
      'Supports multilingual conversations',
      'Keeps admissions moving 24/7',
    ],
    ctaLabel: 'See it in Action',
  },
  {
    id: 'tours',
    label: 'Schedule Tours',
    title: 'Simplify Tour Booking For Parents',
    points: [
      'Let families book tours online anytime, from any device',
      "Automatically sync tour bookings with your team's calendar",
      'Send instant confirmations via email and SMS',
      'Reduce no-shows with personalized follow-ups before every visit',
    ],
    ctaLabel: 'See it in Action',
  },
  {
    id: 'leads',
    label: 'Capture Facebook Leads',
    title: 'Turn Facebook Ads Into Enrollments',
    points: [
      'Capture parent inquiries directly from Facebook Lead Ads',
      'Instantly sync new leads into your admissions dashboard',
      'Route high-intent families to the right center automatically',
      'Keep every campaign lead visible until enrollment',
    ],
    ctaLabel: 'See it in Action',
  },
  {
    id: 'walkins',
    label: 'Convert Walk-ins',
    title: 'Convert Offline Visitors Into Digital Leads',
    points: [
      'Give families instant access to inquiry forms from any mobile device',
      'Capture leads from events, open houses, flyers, and more',
      'Convert offline interactions into measurable admissions opportunities',
      'Track every QR code inquiry through to enrollment',
    ],
    ctaLabel: 'See it in Action',
  },
  {
    id: 'forms',
    label: 'Website Forms',
    title: 'Capture Website Enquiries Effortlessly',
    points: [
      'Build & embed branded inquiry forms in minutes',
      'Add forms to your school website or landing pages',
      'Collect parent information securely from any device',
      'Sync every submission instantly into your admissions pipeline',
    ],
    ctaLabel: 'See it in Action',
  },
];

export type AudioExperience = {
  id: string;
  number: string;
  title: string;
  description: string;
  src: string;
};

export const AUDIO_EXPERIENCES: AudioExperience[] = [
  {
    id: 'inquiry',
    number: '01',
    title: 'Family Inquiry',
    description: 'A parent asks about openings.',
    src: '/audio/enrollment/01-family-inquiry.wav',
  },
  {
    id: 'followup',
    number: '02',
    title: 'Smart Follow-Up',
    description: 'Panacea invites them to a tour.',
    src: '/audio/enrollment/02-smart-followup.wav',
  },
  {
    id: 'tour',
    number: '03',
    title: 'Tour Scheduling',
    description: 'The tour is confirmed.',
    src: '/audio/enrollment/03-tour-scheduling.wav',
  },
  {
    id: 'complete',
    number: '04',
    title: 'Enrollment Complete',
    description: 'The child profile goes live.',
    src: '/audio/enrollment/04-enrollment-complete.wav',
  },
];

export type EnrollmentFeatureId =
  | 'waitlists'
  | 'registrations'
  | 'families'
  | 'workflows';

export type EnrollmentFeature = {
  id: EnrollmentFeatureId;
  title: string;
  description: string;
  duration: number;
};

export const ENROLLMENT_FEATURES: EnrollmentFeature[] = [
  {
    id: 'waitlists',
    title: 'Priority-based Waitlists',
    description:
      'Rank families by sibling status, staff priority, and inquiry date — then fill openings the moment a seat opens up.',
    duration: 6000,
  },
  {
    id: 'registrations',
    title: 'Effortless Registrations',
    description:
      'Collect deposits, forms, and consents up front so families are committed before day one.',
    duration: 6000,
  },
  {
    id: 'families',
    title: 'Family Enrollments',
    description:
      'One click moves an accepted family into a student profile. No duplicate data entry, no missed details.',
    duration: 6000,
  },
  {
    id: 'workflows',
    title: 'Enrollment Workflows',
    description:
      'Standardize admissions across every center with reusable workflows, approvals, and digital records.',
    duration: 6000,
  },
];

export const FOLLOW_UP_BENEFITS = [
  {
    id: 'tours',
    title: 'Tour confirmations and reminders',
    detail: 'Keep every booked visit on track with timely nudges.',
  },
  {
    id: 'reenroll',
    title: 'Re-enrollment reminders',
    detail: 'Bring returning families back before seats fill up.',
  },
  {
    id: 'waitlist',
    title: 'Waitlist nurturing campaigns via SMS and emails',
    detail: 'Stay top-of-mind until the right opening appears.',
  },
  {
    id: 'agent',
    title: 'Enrollment Agent answers inquiries in under 2 seconds',
    detail: 'Respond instantly — day or night — without losing momentum.',
  },
  {
    id: 'welcome',
    title: 'Registration completion and welcome communications',
    detail: 'Guide families from accepted to day-one ready.',
  },
] as const;

export const NETWORK_PILLARS = [
  {
    id: 'dashboard',
    title: 'Visibility Dashboard',
    detail: 'Track occupancy, inquiries, revenue, waitlists, and enrollment performance in real time.',
  },
  {
    id: 'routing',
    title: 'ZIP, Age & Capacity',
    detail: 'Route every inquiry to the right center based on ZIP code, availability, age group & seat count.',
  },
  {
    id: 'permissions',
    title: 'Center-level Permissions',
    detail: 'Enrollment manager roles, approvals, and workflows tailored to each center.',
  },
  {
    id: 'comms',
    title: 'Unified Communication',
    detail: 'Manage SMS, emails, calls, and parent interactions from one centralized inbox.',
  },
] as const;

export const NETWORK_CENTERS = [
  { id: 'c1', name: 'Center 1', city: 'Austin', leads: 512, occupancy: 94, facebook: 52, walkins: 34, other: 24 },
  { id: 'c2', name: 'Center 2', city: 'Dallas', leads: 358, occupancy: 88, facebook: 40, walkins: 28, other: 18 },
  { id: 'c3', name: 'Center 3', city: 'Houston', leads: 441, occupancy: 91, facebook: 34, walkins: 22, other: 16 },
  { id: 'c4', name: 'Center 4', city: 'Plano', leads: 276, occupancy: 86, facebook: 26, walkins: 18, other: 12 },
  { id: 'c5', name: 'Center 5', city: 'Frisco', leads: 230, occupancy: 97, facebook: 18, walkins: 12, other: 8 },
] as const;

export const ENROLLMENT_FAQS = [
  {
    id: 'q1',
    question: 'What is admission management software for childcare?',
    answer:
      'It is a system that captures family inquiries, schedules tours, manages waitlists, collects registration details, and helps convert interested families into enrolled children — all in one place.',
  },
  {
    id: 'q2',
    question: 'How does Panacea enrollment management work?',
    answer:
      'Panacea brings every lead channel into one admissions inbox, automates follow-ups, books tours, ranks waitlists by priority, and turns accepted families into student profiles with reusable workflows.',
  },
  {
    id: 'q3',
    question: 'What features should childcare enrollment software have?',
    answer:
      'Lead capture, AI responses, tour scheduling, priority waitlists, digital registrations, document collection, multi-center routing, and clear reporting so directors can grow enrollment predictably.',
  },
  {
    id: 'q4',
    question: 'How can I increase preschool enrollment?',
    answer:
      'Respond faster, nurture waitlists, make touring effortless, remove registration friction, and keep every center visible in one network view so families never fall through the cracks.',
  },
  {
    id: 'q5',
    question: 'Can Panacea automate inquiry follow-ups?',
    answer:
      'Yes. Panacea can send instant replies, tour invitations, reminders, and waitlist nurturing messages so your team stays focused on high-intent conversations.',
  },
  {
    id: 'q6',
    question: 'How does Panacea handle enrollment across multiple centers?',
    answer:
      'Leads, waitlists, occupancy and enrollment pipelines stay centralized while each center keeps local availability, rooms and workflows — ideal for growing childcare networks.',
  },
] as const;
