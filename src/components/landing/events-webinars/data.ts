/** Backend-ready events & podcasts models (swap for API later). */

export type EventStatus = 'UPCOMING' | 'PAST' | 'LIVE';
export type EventType = 'Webinar' | 'Workshop' | 'Event' | 'Series';

export type ResourceEvent = {
  id: string;
  slug: string;
  title: string;
  type: EventType;
  status: EventStatus;
  featured?: boolean;
  /** Full creative / thumbnail URL from API or CDN */
  imageUrl: string;
  date: string;
  day: string;
  location: string;
  registrationUrl?: string | null;
  recordingUrl?: string | null;
  excerpt?: string;
};

export type Podcast = {
  id: string;
  title: string;
  imageUrl: string;
  videoUrl: string;
  duration: string;
  featured?: boolean;
};

/** HD Unsplash placeholders — replace with API `imageUrl` later. */
/** Sample embed — replace with API `videoUrl` / `recordingUrl` later. */
const SAMPLE_VIDEO = 'https://www.youtube.com/watch?v=Ug75diEyiA0';

const U = {
  conf1:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
  conf2:
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=80',
  workshop:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80',
  panel:
    'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1600&q=80',
  speak:
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1600&q=80',
  team:
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80',
  classroom:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
  teachers:
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80',
  meeting:
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=80',
  keynote:
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1600&q=80',
  network:
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
  studio:
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1600&q=80',
  podcast:
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1600&q=80',
  mic:
    'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80',
  discuss:
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80',
  train:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
  leader:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1600&q=80',
  circle:
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
} as const;

export type HeroPolaroid = {
  id: string;
  imageUrl: string;
  alt: string;
  rotate: number;
  /** Optional city / venue label shown on the polaroid footer */
  location?: string;
};

/** Hero copy + collage — swap from API later without UI changes. */
export const HERO_CONTENT = {
  titleLine1: 'Events for Early Years',
  titleLine2: 'Leaders & Educators',
  collage: [
    {
      id: 'p1',
      imageUrl: U.conf1,
      alt: 'Educators at an early years conference',
      rotate: -7,
      location: 'Singapore',
    },
    {
      id: 'p2',
      imageUrl: U.panel,
      alt: 'Leadership panel in Dubai',
      rotate: -3,
      location: 'Dubai',
    },
    {
      id: 'p3',
      imageUrl: U.teachers,
      alt: 'Preschool educators collaborating in Atlanta',
      rotate: 0,
      location: 'Atlanta',
    },
    {
      id: 'p4',
      imageUrl: U.speak,
      alt: 'Speaker presenting in Orlando',
      rotate: 3,
      location: 'Orlando',
    },
    {
      id: 'p5',
      imageUrl: U.workshop,
      alt: 'Workshop for early childhood professionals',
      rotate: 7,
      location: 'London',
    },
  ] satisfies HeroPolaroid[],
};

/** @deprecated Prefer HERO_CONTENT.collage */
export const HERO_COLLAGE = HERO_CONTENT.collage;

export const EVENTS: ResourceEvent[] = [
  {
    id: 'ev-1',
    slug: 'ai-montessori-leadership',
    title: 'AI and the Future of Montessori Leadership',
    type: 'Webinar',
    status: 'UPCOMING',
    featured: true,
    imageUrl: U.keynote,
    date: '26 Aug',
    day: 'Wednesday',
    location: 'Live on Zoom',
    registrationUrl: '/book-demo',
    excerpt:
      'Explore how AI can support Montessori leaders without compromising pedagogy or child privacy.',
  },
  {
    id: 'ev-2',
    slug: 'childcare-tax-playbook',
    title: 'Are You Overpaying Your Taxes? The Childcare Tax Playbook',
    type: 'Webinar',
    status: 'UPCOMING',
    imageUrl: U.meeting,
    date: '04 Sep',
    day: 'Thursday',
    location: 'Live on Zoom',
    registrationUrl: '/book-demo',
  },
  {
    id: 'ev-3',
    slug: 'nursery-induction-toolkit',
    title: 'The Nursery Induction Toolkit: Building Confident Starts for Families & Staff',
    type: 'Workshop',
    status: 'UPCOMING',
    imageUrl: U.train,
    date: '12 Sep',
    day: 'Friday',
    location: 'Live on Zoom',
    registrationUrl: '/book-demo',
  },
  {
    id: 'ev-4',
    slug: 'occupancy-growth-lab',
    title: 'Occupancy Growth Lab: Filling Rooms Without Burning Out Your Team',
    type: 'Webinar',
    status: 'UPCOMING',
    imageUrl: U.network,
    date: '19 Sep',
    day: 'Friday',
    location: 'Live on Zoom',
    registrationUrl: '/book-demo',
  },
  {
    id: 'ev-5',
    slug: 'parent-trust-communications',
    title: 'Parent Trust Communications for Multi-Center Operators',
    type: 'Event',
    status: 'UPCOMING',
    imageUrl: U.leader,
    date: '02 Oct',
    day: 'Thursday',
    location: 'Live on Zoom',
    registrationUrl: null,
  },
  {
    id: 'ev-p1',
    slug: 'ece-leadership-series',
    title: 'ECE Leadership Series',
    type: 'Series',
    status: 'PAST',
    imageUrl: U.conf2,
    date: '12 Jun',
    day: 'Thursday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
  {
    id: 'ev-p2',
    slug: 'the-first-hello',
    title: 'The First Hello: Welcoming Every Child, Every Family',
    type: 'Webinar',
    status: 'PAST',
    imageUrl: U.classroom,
    date: '28 May',
    day: 'Wednesday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
  {
    id: 'ev-p3',
    slug: 'burnout-lesson-planning',
    title: 'The Burnout Behind Preschool Lesson Planning',
    type: 'Webinar',
    status: 'PAST',
    imageUrl: U.team,
    date: '14 May',
    day: 'Wednesday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
  {
    id: 'ev-p4',
    slug: 'montessori-leadership-series',
    title: 'The Montessori Leadership Series',
    type: 'Series',
    status: 'PAST',
    imageUrl: U.discuss,
    date: '30 Apr',
    day: 'Wednesday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
  {
    id: 'ev-p5',
    slug: 'burnout-assessments',
    title: 'The Burnout Behind Childcare Assessments',
    type: 'Webinar',
    status: 'PAST',
    imageUrl: U.circle,
    date: '16 Apr',
    day: 'Wednesday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
  {
    id: 'ev-p6',
    slug: 'ratio-ready-operations',
    title: 'Ratio-Ready Operations for Growing Centers',
    type: 'Workshop',
    status: 'PAST',
    imageUrl: U.workshop,
    date: '02 Apr',
    day: 'Wednesday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
  {
    id: 'ev-p7',
    slug: 'billing-clarity-session',
    title: 'Billing Clarity Session for Multi-Site Finance Teams',
    type: 'Webinar',
    status: 'PAST',
    imageUrl: U.meeting,
    date: '19 Mar',
    day: 'Wednesday',
    location: 'Recording available',
    recordingUrl: SAMPLE_VIDEO,
  },
];

export const PODCASTS: Podcast[] = [
  {
    id: 'pod-1',
    title: 'What No One Tells You About the Early Years',
    imageUrl: U.podcast,
    videoUrl: SAMPLE_VIDEO,
    duration: '42 min',
    featured: true,
  },
  {
    id: 'pod-2',
    title: 'Leading Through Enrollment Season',
    imageUrl: U.studio,
    videoUrl: SAMPLE_VIDEO,
    duration: '38 min',
  },
  {
    id: 'pod-3',
    title: 'Teacher Retention That Actually Works',
    imageUrl: U.mic,
    videoUrl: SAMPLE_VIDEO,
    duration: '35 min',
  },
  {
    id: 'pod-4',
    title: 'Parent Partnerships Beyond the App',
    imageUrl: U.discuss,
    videoUrl: SAMPLE_VIDEO,
    duration: '40 min',
  },
  {
    id: 'pod-5',
    title: 'AI Tools Educators Can Trust',
    imageUrl: U.leader,
    videoUrl: SAMPLE_VIDEO,
    duration: '31 min',
  },
];

export function getUpcomingEvents(): ResourceEvent[] {
  return EVENTS.filter((e) => e.status === 'UPCOMING' || e.status === 'LIVE');
}

export function getPastEvents(): ResourceEvent[] {
  return EVENTS.filter((e) => e.status === 'PAST');
}

export function getEventBySlug(slug: string): ResourceEvent | undefined {
  return EVENTS.find((e) => e.slug === slug);
}

export function getFeaturedPodcast(): Podcast {
  return PODCASTS.find((p) => p.featured) ?? PODCASTS[0];
}
