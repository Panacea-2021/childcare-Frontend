import type { ResourceItem } from '@/types/resourceCenter';

export const RESOURCE_CATEGORIES = [
  'All',
  'Health & Safety',
  'Nutrition',
  'Parenting Tips',
  'Schedules',
  'Policies',
  'Learning at Home',
  'Fees & Billing',
] as const;

export const MOCK_RESOURCES: ResourceItem[] = [
  {
    id: 'res-1',
    title: 'Nutrition Guide for Toddlers',
    category: 'Nutrition',
    type: 'PDF',
    audience: 'Toddler',
    description:
      'A practical guide to balanced meals and healthy snacking for children aged 1.5–3, including portion sizes and allergy-aware alternatives.',
    size: '1.2 MB',
    updated: '2026-07-28',
    status: 'published',
  },
  {
    id: 'res-2',
    title: 'Potty Training Readiness Checklist',
    category: 'Parenting Tips',
    type: 'PDF',
    audience: 'Toddler',
    description:
      'Signs your child is ready for potty training, a step-by-step routine, and how our classrooms support the transition.',
    size: '860 KB',
    updated: '2026-07-25',
    status: 'published',
  },
  {
    id: 'res-3',
    title: 'Montessori at Home: Practical Life',
    category: 'Learning at Home',
    type: 'Link',
    audience: 'Primary',
    description:
      'Simple practical-life activities families can set up at home — pouring, spooning, dressing frames, and food prep.',
    url: 'https://www.montessorihome.example/practical-life',
    updated: '2026-07-22',
    status: 'published',
  },
  {
    id: 'res-4',
    title: 'Holiday & Closure Schedule 2026–27',
    category: 'Schedules',
    type: 'PDF',
    audience: 'All',
    description:
      'The full academic calendar with public holidays, center closures, and staff development days for the coming year.',
    size: '320 KB',
    updated: '2026-07-20',
    status: 'published',
  },
  {
    id: 'res-5',
    title: 'Health & Safety Policy',
    category: 'Health & Safety',
    type: 'PDF',
    audience: 'All',
    description:
      'Our illness exclusion guidelines, medication administration policy, emergency procedures, and hygiene practices.',
    size: '2.1 MB',
    updated: '2026-07-18',
    status: 'published',
  },
  {
    id: 'res-6',
    title: 'Tuition Fee Guide & Payment Plans',
    category: 'Fees & Billing',
    type: 'DOC',
    audience: 'All',
    description:
      'Fee structure by program, available payment plans, late fee policy, and how to update billing details.',
    size: '640 KB',
    updated: '2026-07-15',
    status: 'published',
  },
  {
    id: 'res-7',
    title: 'Reading Aloud: Book List by Age',
    category: 'Learning at Home',
    type: 'Video',
    audience: 'Elementary',
    description:
      'A curated video library of read-aloud sessions and a recommended book list for emerging readers.',
    url: 'https://videos.example/read-aloud',
    updated: '2026-07-12',
    status: 'published',
  },
  {
    id: 'res-8',
    title: 'Settling-in Guide for New Families',
    category: 'Parenting Tips',
    type: 'PDF',
    audience: 'All',
    description:
      'What to expect during the first weeks — separation tips, daily rhythms, and how we share updates with you.',
    size: '1.0 MB',
    updated: '2026-07-10',
    status: 'draft',
  },
];
