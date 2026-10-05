export const PS_HERO = {
  eyebrow: 'Trusted by 1000+ preschools worldwide',
  titleLine1: 'Foster Learning and',
  titleLine2: 'Growth at Your Preschool',
  lead:
    'Empower parents, support teachers, and manage preschool growth — from attendance and billing to AI tools and daily family updates — in one calm platform.',
  ctaLabel: 'Explore Panacea app',
  ctaHref: '/book-demo',
  image: '/images/parent-communication/classroom.jpg',
  imageAlt: 'Teacher guiding preschool children in a classroom',
} as const;

export const PS_TRUST = {
  label: 'Trusted by leading childcare brands',
  items: [
    { label: 'Bright Horizons', domain: 'brighthorizons.com' },
    { label: 'KinderCare', domain: 'kindercare.com' },
    { label: 'Primrose', domain: 'primroseschools.com' },
    { label: 'Goddard', domain: 'goddardschool.com' },
    { label: 'Guidepost', domain: 'guidepostmontessori.com' },
    { label: 'Dibber', domain: 'dibber.com' },
    { label: 'Learning Care', domain: 'learningcaregroup.com' },
    { label: 'Childcare Aware', domain: 'childcareaware.org' },
  ],
} as const;

export const PS_ASPECTS = {
  title: 'Manage Every Aspect of Your Preschool',
  lead: 'One platform for learning, staff happiness, and family engagement.',
  cards: [
    {
      id: 'growth',
      title: 'Balanced Growth',
      body: 'Track enrollment, occupancy, and learning progress so every classroom stays on course.',
      icon: 'cap' as const,
    },
    {
      id: 'teachers',
      title: 'Happy Teachers',
      body: 'Cut admin busywork so educators spend more time with children — not paperwork.',
      icon: 'smile' as const,
    },
    {
      id: 'parents',
      title: 'Engaged Parents',
      body: 'Keep families connected with photos, reports, and updates they actually open.',
      icon: 'users' as const,
    },
  ],
} as const;

export const PS_DAILY = {
  eyebrow: 'Daily operations',
  title: 'Make Your Daily Tasks Easier',
  lead: 'Replace scattered spreadsheets with clear workflows that keep your preschool running smoothly every day.',
  points: [
    {
      title: 'Contactless Check-ins',
      detail: 'Fast QR and app check-in so arrivals and pickups stay accurate and secure.',
    },
    {
      title: 'Automated Billing',
      detail: 'Tuition, subsidies, and reminders that stay in sync with attendance.',
    },
    {
      title: 'Occupancy Reports',
      detail: 'See capacity, ratios, and trends before staffing or enrollment decisions.',
    },
  ],
  image: '/images/parent-communication/learning.jpg',
} as const;

export const PS_AI = {
  eyebrow: 'Panacea AI',
  title: 'AI Tools for Smarter Preschool Management',
  lead: 'Draft lessons, translate messages, and polish communication — with humans always in the loop.',
  points: [
    {
      title: 'Live Translations',
      detail: 'Reach every family in the language they prefer, without slowing staff down.',
    },
    {
      title: 'AI-Powered Lesson Planning',
      detail: 'Generate age-appropriate activity ideas your teachers can review and refine.',
    },
    {
      title: 'Grammar Check and Suggestions',
      detail: 'Keep parent messages clear, warm, and professional in seconds.',
    },
  ],
  chips: [
    'Lesson Planning',
    'Message Generator',
    'Language Translator',
    'Social Media Post',
    'Email Generator',
    'Activity Ideas',
  ],
} as const;

export const PS_PARENTS = {
  eyebrow: 'Parent communication',
  title: 'Keep Parents in the Loop',
  lead: 'Share the preschool day with confidence — moments, meals, naps, and progress in one place.',
  points: [
    {
      title: 'Instant Updates',
      detail: 'Push classroom moments to parents as they happen.',
    },
    {
      title: 'Daily Reports',
      detail: 'Food, nap, bathroom, and learning summaries parents can trust.',
    },
    {
      title: 'Photos and Videos',
      detail: 'Secure media sharing that builds connection without extra apps.',
    },
  ],
  image: '/images/parent-communication/activity.jpg',
} as const;

export const PS_SECURITY = {
  eyebrow: 'Trust & compliance',
  title: 'Safe, Secure, and Reliable',
  lead: 'Protect child and family data with enterprise-grade controls designed for childcare.',
  points: [
    {
      title: 'Privacy by Design',
      detail: 'Access rules and least-privilege defaults for sensitive records.',
    },
    {
      title: 'Regulatory Compliance',
      detail: 'Stay audit-ready with clear trails and controlled workflows.',
    },
    {
      title: 'Data Backups',
      detail: 'Resilient backups and recovery so operations stay continuous.',
    },
  ],
  image: '/images/parent-communication/teacher.jpg',
} as const;

export const PS_SUPPORT = {
  eyebrow: 'Onboarding & care',
  title: 'Quick Setup, Always Supported',
  lead: 'Go live quickly with guided onboarding and a support team that understands preschool operations.',
  points: [
    {
      title: 'Easy Onboarding',
      detail: 'Import rooms, families, and fee plans without a long IT project.',
    },
    {
      title: '24/7 Support',
      detail: 'Get help when you need it — before drop-off or after close.',
    },
    {
      title: 'Affordable Pricing',
      detail: 'Transparent plans that scale from a single preschool to growing groups.',
    },
  ],
  image: '/images/testimonials/elena.jpg',
} as const;

export const PS_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Panacea helped us connect enrollment, daily updates, and billing — parents finally feel informed without endless WhatsApp threads.',
    name: 'Priya Nair',
    role: 'Preschool Director',
    avatar: '/images/testimonials/priya.jpg',
  },
  {
    id: 't2',
    quote:
      'Teachers save hours each week. AI drafts the daily note; we review and send. Families love the consistency.',
    name: 'Marcus Chen',
    role: 'Lead Teacher',
    avatar: '/images/testimonials/marcus.jpg',
  },
  {
    id: 't3',
    quote:
      'Occupancy and attendance finally live in one place. We staff smarter and fill seats with less guesswork.',
    name: 'Hannah Brooks',
    role: 'Operations Manager',
    avatar: '/images/testimonials/hannah.jpg',
  },
  {
    id: 't4',
    quote:
      'The parent app feels calm and premium. Photos, reports, and invoices — one trusted home for every family.',
    name: 'Rajesh Kumar',
    role: 'Center Owner',
    avatar: '/images/testimonials/rajesh.jpg',
  },
  {
    id: 't5',
    quote:
      'Setup was faster than we expected. Support walked us through rooms, fee plans, and parent invites in days.',
    name: 'Amelia Torres',
    role: 'Admissions Lead',
    avatar: '/images/testimonials/amelia.jpg',
  },
  {
    id: 't6',
    quote:
      'Security and backups gave our board confidence. We modernized without compromising family trust.',
    name: 'Jordan Lee',
    role: 'Board Member',
    avatar: '/images/testimonials/jordan.jpg',
  },
] as const;

export const PS_CTA = {
  title: 'Ready to Transform Your Preschool Management System?',
  body: 'See how Panacea helps preschools grow enrollment, delight parents, and free teachers from admin.',
  ctaLabel: 'Book a Demo',
  ctaHref: '/book-demo',
} as const;
