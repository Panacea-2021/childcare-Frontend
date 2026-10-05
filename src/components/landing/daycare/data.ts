export const DC_HERO = {
  eyebrow: 'Smart daycare software',
  titleLine1: 'Designed for Daycare',
  titleLine2: 'Centers to Thrive',
  lead:
    'Streamline daily operations, ensure compliance, and provide personalized care — all from one calm platform.',
  ctaLabel: 'Explore Panacea app',
  ctaHref: '/book-demo',
  image: '/images/parent-communication/classroom.jpg',
  imageAlt: 'Teacher caring for toddlers in a daycare classroom',
} as const;

export const DC_TRUST = {
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

export const DC_MEET = {
  title: 'Meet the #1 Software to Run a Daycare',
  lead: 'Everything you need, all in one place.',
  cards: [
    {
      id: 'ops',
      title: 'Efficient Operations',
      body: 'Attendance, ratios, and daily logs stay connected so your team moves faster with fewer tools.',
      icon: 'ops' as const,
    },
    {
      id: 'billing',
      title: 'Accurate, Timely Billing',
      body: 'Tuition, fees, and reminders stay in sync — fewer late nights chasing payments.',
      icon: 'billing' as const,
    },
    {
      id: 'safety',
      title: 'Focus on Safety & Security',
      body: 'Authorized pickups, health notes, and secure messaging protect every child’s day.',
      icon: 'safety' as const,
    },
  ],
} as const;

export const DC_OPS = {
  eyebrow: 'Daily operations',
  title: 'Simplify Your Daily Operations',
  lead: 'Replace paper check-ins and spreadsheet billing with clear workflows built for daycare days.',
  points: [
    {
      title: 'Contactless Check-ins',
      detail: 'Fast QR and app check-in so arrivals and pickups stay accurate.',
    },
    {
      title: 'Automated Billing',
      detail: 'Invoices and reminders that follow attendance and fee plans.',
    },
    {
      title: 'Student Staff Ratios',
      detail: 'See capacity and ratios before staffing decisions get stressful.',
    },
  ],
} as const;

export const DC_AI = {
  eyebrow: 'Panacea AI',
  title: 'AI Tools for Smart Management',
  lead: 'Draft messages, translate updates, and polish notes — with humans always in control.',
  points: [
    {
      title: 'Quick Rewrites',
      detail: 'Turn rough notes into parent-ready updates in seconds.',
    },
    {
      title: 'Live Translations',
      detail: 'Reach every family in the language they prefer.',
    },
    {
      title: 'Smart Suggestions',
      detail: 'Helpful prompts for follow-ups, waitlists, and daily summaries.',
    },
  ],
  chips: ['Admission Analytics', 'Message Draft', 'Translate', 'Insights'],
} as const;

export const DC_PARENTS = {
  eyebrow: 'Parent communication',
  title: 'Keep Parents in the Loop',
  lead: 'Share the daycare day with photos, reports, and pickup clarity families can trust.',
  points: [
    {
      title: 'Instant Updates & Voice Notes',
      detail: 'Push moments and voice notes as soon as staff share them.',
    },
    {
      title: 'Daily Reports',
      detail: 'Meals, naps, and care summaries parents actually open.',
    },
    {
      title: 'Authorized Pick-ups',
      detail: 'Know who is approved before a child leaves the door.',
    },
  ],
  image: '/images/parent-communication/activity.jpg',
  profileImage: '/images/testimonials/amelia.jpg',
} as const;

export const DC_SECURITY = {
  eyebrow: 'Trust',
  title: 'Safe, Secure, and Reliable',
  lead: 'Protect child and family data with controls designed for daycare operations.',
  points: [
    {
      title: 'Privacy by Design',
      detail: 'Least-privilege access for sensitive family records.',
    },
    {
      title: 'Regulatory Compliance',
      detail: 'Stay audit-ready with clear trails and controlled workflows.',
    },
    {
      title: 'Data Backups',
      detail: 'Resilient backups so operations stay continuous.',
    },
  ],
  image: '/images/parent-communication/teacher.jpg',
} as const;

export const DC_SUPPORT = {
  eyebrow: 'Onboarding & care',
  title: 'Quick Setup, Always Supported',
  lead: 'Go live quickly with guided setup and a team that understands daycare realities.',
  points: [
    {
      title: 'Easy Onboarding',
      detail: 'Import rooms and families without a long IT project.',
    },
    {
      title: '24/7 Support',
      detail: 'Get help before drop-off or after close — whenever you need it.',
    },
    {
      title: 'Affordable Pricing',
      detail: 'Transparent plans sized for a single daycare center.',
    },
  ],
  image: '/images/testimonials/elena.jpg',
} as const;

export const DC_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Check-in used to bottle-neck our lobby. Panacea made arrivals calm — and parents finally get timely updates.',
    name: 'Priya Nair',
    role: 'Daycare Director',
    avatar: '/images/testimonials/priya.jpg',
    tone: 'rose' as const,
  },
  {
    id: 't2',
    quote:
      'Billing and attendance finally live together. We spend evenings with family instead of chasing invoices.',
    name: 'Marcus Chen',
    role: 'Owner',
    avatar: '/images/testimonials/marcus.jpg',
    tone: 'pink' as const,
  },
  {
    id: 't3',
    quote:
      'Authorized pickup and daily reports gave our families real peace of mind in the first week.',
    name: 'Hannah Brooks',
    role: 'Center Lead',
    avatar: '/images/testimonials/hannah.jpg',
    tone: 'lavender' as const,
  },
  {
    id: 't4',
    quote:
      'AI drafts help our teachers write warmer notes faster. Parents feel closer to the day.',
    name: 'Amelia Torres',
    role: 'Lead Teacher',
    avatar: '/images/testimonials/amelia.jpg',
    tone: 'cream' as const,
  },
  {
    id: 't5',
    quote:
      'Setup was simple. Support walked us through rooms, fee plans, and parent invites quickly.',
    name: 'Jordan Lee',
    role: 'Operations',
    avatar: '/images/testimonials/jordan.jpg',
    tone: 'rose' as const,
  },
  {
    id: 't6',
    quote:
      'It feels premium without feeling complicated — perfect for a busy daycare team.',
    name: 'Elena Vargas',
    role: 'Director',
    avatar: '/images/testimonials/elena.jpg',
    tone: 'pink' as const,
  },
] as const;

export const DC_CTA = {
  title: 'Excited to Enhance Your Daycare Operations?',
  body: 'See how Panacea helps daycares run smoother days, delight families, and protect every child.',
  ctaLabel: 'Book a Demo',
  ctaHref: '/book-demo',
} as const;
