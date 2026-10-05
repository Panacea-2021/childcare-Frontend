/** Backend-ready webinar / event registration models. */

export type EventLifecycleStatus = 'UPCOMING' | 'LIVE' | 'ENDED' | 'REGISTRATION_CLOSED';

export type EventSpeaker = {
  name: string;
  role: string;
  company: string;
  imageUrl: string;
  linkedin?: string | null;
};

export type EventFaq = {
  question: string;
  answer: string;
};

export type EventCertificate = {
  enabled: boolean;
  title: string;
  description?: string;
};

export type EventRegistrationConfig = {
  enabled: boolean;
  maxSeats: number;
  remainingSeats: number;
  seatBadgeLabel?: string;
  roles: string[];
};

export type EventConfirmationConfig = {
  title: string;
  descriptionTemplate: string; // use {title} placeholder
  joinLink?: string | null;
  calendarEnabled: boolean;
};

export type WebinarEvent = {
  id: string;
  slug: string;
  title: string;
  /** Phrase inside title to gradient-emphasize */
  titleHighlight?: string;
  badge: string;
  description: string;
  status: EventLifecycleStatus;
  startDateTime: string; // ISO
  endDateTime: string; // ISO
  timezone: string; // IANA
  durationLabel: string;
  locationType: 'online' | 'hybrid' | 'in-person';
  locationLabel: string;
  countdownEnabled: boolean;
  speakers: EventSpeaker[];
  learningHeading: string;
  learningPoints: string[];
  audienceHeading: string;
  audiencePoints: string[];
  certificate: EventCertificate;
  registration: EventRegistrationConfig;
  faqs: EventFaq[];
  confirmation: EventConfirmationConfig;
  stats?: { value: string; label: string }[];
  testimonials?: {
    quote: string;
    name: string;
    role: string;
    location: string;
    attended: string;
  }[];
};

const PORTRAIT = {
  a: '/images/testimonials/amelia.jpg',
  e: '/images/testimonials/elena.jpg',
  h: '/images/testimonials/hannah.jpg',
  j: '/images/testimonials/jordan.jpg',
  m: '/images/testimonials/marcus.jpg',
  p: '/images/testimonials/priya.jpg',
  r: '/images/testimonials/rajesh.jpg',
  y: '/images/testimonials/ryan.jpg',
} as const;

const ROLES = [
  'Owner',
  'Multi-site Supervisor',
  'Director',
  'IT/Administrator',
  'Center Manager',
  'Teacher',
] as const;

export const WEBINAR_EVENTS: WebinarEvent[] = [
  {
    id: 'we-1',
    slug: 'ai-montessori-leadership',
    title: 'AI and the Future of Montessori Leadership',
    titleHighlight: 'Montessori Leadership',
    badge: 'Free Webinar',
    description:
      'Join Montessori leaders exploring how AI can support pedagogy, documentation, and parent trust — without compromising the child at the center.',
    status: 'UPCOMING',
    startDateTime: '2026-08-26T13:00:00-04:00',
    endDateTime: '2026-08-26T14:00:00-04:00',
    timezone: 'America/New_York',
    durationLabel: '60-minute interactive session',
    locationType: 'online',
    locationLabel: 'Live on Zoom',
    countdownEnabled: true,
    speakers: [
      {
        name: 'Tim Seldin',
        role: 'Author, Educator & President',
        company: 'The Montessori Foundation',
        imageUrl: PORTRAIT.m,
        linkedin: 'https://www.linkedin.com/',
      },
      {
        name: 'Priya Nair',
        role: 'Curriculum Lead',
        company: 'Panacea Early Years',
        imageUrl: PORTRAIT.p,
        linkedin: 'https://www.linkedin.com/',
      },
    ],
    learningHeading: "What You'll Walk Away With",
    learningPoints: [
      'A clear framework for deciding what AI should handle — and what must stay human.',
      'Practical examples of AI supporting observation notes and parent updates.',
      'Privacy-first guardrails designed for early childhood settings.',
      'A 30-day action plan your leadership team can start immediately.',
    ],
    audienceHeading: 'Who This Webinar Is For',
    audiencePoints: [
      'Montessori school owners and multi-site operators',
      'Directors and academic leaders',
      'Curriculum and pedagogy leads',
      'Anyone evaluating AI tools for early years',
    ],
    certificate: {
      enabled: true,
      title: 'Earn a Professional Development Certificate',
      description:
        'Attend live and receive a shareable PD certificate you can add to LinkedIn and your center’s training records.',
    },
    registration: {
      enabled: true,
      maxSeats: 100,
      remainingSeats: 42,
      roles: [...ROLES],
    },
    faqs: [
      {
        question: 'Is this webinar free?',
        answer:
          'Yes. Registration is completely free. You’ll receive a calendar invite and join link after you claim your seat.',
      },
      {
        question: 'Who should attend?',
        answer:
          'School owners, directors, academic leaders, and educators evaluating AI for Montessori or early childhood settings.',
      },
      {
        question: 'Will I receive a certificate?',
        answer:
          'Yes. Live attendees receive a professional development certificate by email after the session.',
      },
      {
        question: 'Will there be a recording?',
        answer:
          'A recording is shared with registered attendees within 48 hours if you cannot stay for the full live session.',
      },
      {
        question: 'What platform will we use?',
        answer: 'The webinar is hosted on Zoom. A unique join link is emailed after registration.',
      },
    ],
    confirmation: {
      title: "You're all set",
      descriptionTemplate: 'Your spot for {title} is confirmed.',
      joinLink: 'https://us02web.zoom.us/j/87100439561',
      calendarEnabled: true,
    },
    stats: [
      { value: '2,500+', label: 'Webinar Attendees' },
      { value: '98%', label: 'Recommend to Peers' },
      { value: '4.9/5', label: 'Average Rating' },
      { value: '45+', label: 'Webinars Hosted' },
    ],
    testimonials: [
      {
        quote:
          'Practical, respectful of Montessori values, and immediately useful for our leadership team.',
        name: 'Elena Brooks',
        role: 'Head of School',
        location: 'Austin, TX',
        attended: 'Attended AI Leadership Webinar',
      },
      {
        quote: 'Finally an AI session that talked about child privacy first — not last.',
        name: 'Marcus Chen',
        role: 'Multi-site Director',
        location: 'Singapore',
        attended: 'Attended AI Leadership Webinar',
      },
      {
        quote: 'Clear frameworks we could apply the next morning in our centers.',
        name: 'Hannah Lee',
        role: 'Curriculum Lead',
        location: 'Toronto',
        attended: 'Attended Pedagogy Series',
      },
      {
        quote:
          'Our directors left with a shared language for AI — and a plan parents could trust.',
        name: 'Jordan Wells',
        role: 'Regional Director',
        location: 'Chicago, IL',
        attended: 'Attended AI Leadership Webinar',
      },
      {
        quote: 'The live Q&A answered the exact compliance questions our board was asking.',
        name: 'Priya Sharma',
        role: 'Owner',
        location: 'Dubai',
        attended: 'Attended AI Leadership Webinar',
      },
      {
        quote: 'Best hour we invested this quarter — actionable without being flashy.',
        name: 'Ryan Okonkwo',
        role: 'Center Manager',
        location: 'London',
        attended: 'Attended Pedagogy Series',
      },
      {
        quote: 'I finally understood how to pilot AI tools without overwhelming teachers.',
        name: 'Amelia Torres',
        role: 'Academic Lead',
        location: 'Miami, FL',
        attended: 'Attended AI Leadership Webinar',
      },
      {
        quote: 'Respectful of pedagogy, honest about limits, and strong on parent communication.',
        name: 'Rajesh Patel',
        role: 'Multi-site Supervisor',
        location: 'Bengaluru',
        attended: 'Attended AI Leadership Webinar',
      },
    ],
  },
  {
    id: 'we-2',
    slug: 'nursery-induction-toolkit',
    title: 'The Nursery Induction Toolkit 2026',
    titleHighlight: '2026',
    badge: 'Free Webinar',
    description:
      'Build confident starts for families and staff with a repeatable induction toolkit — from first tour to first day.',
    status: 'UPCOMING',
    startDateTime: '2026-08-27T14:00:00+04:00',
    endDateTime: '2026-08-27T15:00:00+04:00',
    timezone: 'Asia/Dubai',
    durationLabel: '60-minute interactive session',
    locationType: 'online',
    locationLabel: 'Live on Zoom',
    countdownEnabled: false,
    speakers: [
      {
        name: 'Lara Hudson',
        role: 'Childcare Leader & Educator',
        company: 'Stonegate',
        imageUrl: PORTRAIT.h,
        linkedin: 'https://www.linkedin.com/',
      },
      {
        name: 'Amelia Torres',
        role: 'Enrollment Lead',
        company: 'Panacea',
        imageUrl: PORTRAIT.a,
        linkedin: null,
      },
    ],
    learningHeading: "What You'll Learn",
    learningPoints: [
      'A week-by-week induction map for new families.',
      'Scripts and templates that reduce first-week anxiety.',
      'How to onboard new teachers without slowing the classroom.',
      'Metrics that prove your induction experience is working.',
    ],
    audienceHeading: 'Who This Webinar Is For',
    audiencePoints: [
      'Nursery and preschool owners',
      'Enrollment and admissions teams',
      'Center managers and directors',
      'HR and people operations leads',
    ],
    certificate: {
      enabled: true,
      title: 'Earn a Professional Development Certificate',
    },
    registration: {
      enabled: true,
      maxSeats: 500,
      remainingSeats: 128,
      seatBadgeLabel: 'Limited 500 Seats',
      roles: [...ROLES],
    },
    faqs: [
      {
        question: 'Is this webinar free?',
        answer: 'Yes — registration is free and includes the induction toolkit PDF.',
      },
      {
        question: 'Do I need prior enrollment software experience?',
        answer: 'No. The session is designed for both paper-based and digital teams.',
      },
      {
        question: 'Will materials be shared?',
        answer: 'Yes. Registered attendees receive the toolkit and slide deck after the session.',
      },
      {
        question: 'Can multiple teammates join?',
        answer: 'Absolutely. Each teammate should register with their own email for calendar invites.',
      },
    ],
    confirmation: {
      title: "You're all set",
      descriptionTemplate: 'Your spot for {title} is confirmed.',
      joinLink: null,
      calendarEnabled: true,
    },
    stats: [
      { value: '2,500+', label: 'Webinar Attendees' },
      { value: '98%', label: 'Recommend to Peers' },
      { value: '4.9/5', label: 'Average Rating' },
      { value: '45+', label: 'Webinars Hosted' },
    ],
  },
  {
    id: 'we-3',
    slug: 'childcare-tax-playbook',
    title: 'Are You Overpaying Your Taxes? The Childcare Tax Playbook',
    titleHighlight: 'Tax Playbook',
    badge: 'Free Webinar',
    description:
      'A practical session for owners and finance leads on fee structures, deductions, and cleaner month-end reporting.',
    status: 'UPCOMING',
    startDateTime: '2026-09-04T11:00:00-04:00',
    endDateTime: '2026-09-04T12:00:00-04:00',
    timezone: 'America/New_York',
    durationLabel: '60-minute interactive session',
    locationType: 'online',
    locationLabel: 'Live on Zoom',
    countdownEnabled: true,
    speakers: [
      {
        name: 'Jordan Lee',
        role: 'Finance Advisor',
        company: 'Early Years CFO Collective',
        imageUrl: PORTRAIT.j,
        linkedin: 'https://www.linkedin.com/',
      },
    ],
    learningHeading: "What You'll Walk Away With",
    learningPoints: [
      'Common tax oversights in multi-center childcare.',
      'How tuition plans and discounts affect reporting.',
      'A checklist for audit-ready records.',
    ],
    audienceHeading: 'Who This Webinar Is For',
    audiencePoints: ['Owners', 'Finance managers', 'Business managers'],
    certificate: { enabled: false, title: '' },
    registration: {
      enabled: true,
      maxSeats: 100,
      remainingSeats: 18,
      roles: [...ROLES],
    },
    faqs: [
      {
        question: 'Is this financial advice?',
        answer:
          'This is an educational session. Always consult your accountant for advice specific to your business.',
      },
      {
        question: 'Is it free?',
        answer: 'Yes. Registration is free for childcare operators.',
      },
    ],
    confirmation: {
      title: "You're all set",
      descriptionTemplate: 'Your spot for {title} is confirmed.',
      joinLink: 'https://us02web.zoom.us/j/87100439561',
      calendarEnabled: true,
    },
  },
];

export function getWebinarBySlug(slug: string): WebinarEvent | undefined {
  return WEBINAR_EVENTS.find((e) => e.slug === slug);
}

export function getSeatBadge(event: WebinarEvent): string {
  if (event.registration.seatBadgeLabel) return event.registration.seatBadgeLabel;
  const left = event.registration.remainingSeats;
  if (left <= 20) return `Only ${left} Seats Left`;
  if (left <= 50) return `Limited ${event.registration.maxSeats} Seats`;
  return `Limited ${event.registration.maxSeats} Seats`;
}

export type RegistrationPayload = {
  firstName: string;
  email: string;
  organization: string;
  phone: string;
  countryCode: string;
  role: string;
};

/** Mock submit — swap for POST /api/events/:id/register */
export async function submitEventRegistration(
  eventId: string,
  payload: RegistrationPayload,
): Promise<{ ok: true; registrationId: string } | { ok: false; message: string }> {
  await new Promise((r) => setTimeout(r, 900));
  if (!payload.email.includes('@')) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }
  return { ok: true, registrationId: `reg_${eventId}_${Date.now()}` };
}
