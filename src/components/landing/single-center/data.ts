export const SC_HERO = {
  eyebrow: 'Built for single-site childcare',
  titleLine1: 'Simplified Operations for',
  titleLine2: 'Small Childcare Centers',
  lead:
    'Run attendance, billing, parent updates, and daily care from one calm platform — built for owners who wear every hat.',
  ctaLabel: 'Explore Panacea app',
  ctaHref: '/book-demo',
  mealImage: '/images/parent-communication/activity.jpg',
} as const;

export const SC_TRUST = {
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

export const SC_DISCOVER = {
  title: 'Discover Why Childcare Owners Choose Us',
  lead: 'Everything a small center needs — without enterprise complexity.',
  cards: [
    {
      id: 'ops',
      title: 'Efficient Operations',
      body: 'Attendance, billing, and daily logs stay connected so your team spends less time switching tools.',
      icon: 'building' as const,
    },
    {
      id: 'engage',
      title: 'High Parent Engagement',
      body: 'Share meals, milestones, and photos instantly — families stay informed and trust grows.',
      icon: 'chat' as const,
    },
    {
      id: 'safety',
      title: 'Focus on Safety & Security',
      body: 'Authorized pickups, health records, and secure messaging protect every child’s day.',
      icon: 'shield' as const,
    },
  ],
} as const;

export const SC_SOLUTION = {
  title: 'Complete Childcare Solution for Small Centers',
  lead: 'One platform, many benefits.',
  points: [
    {
      title: 'Replace Multiple Tools',
      detail:
        'Say goodbye to juggling multiple tools — get complete visibility to make informed decisions.',
    },
    {
      title: 'Simplify Operations',
      detail:
        'Manage enrollment, attendance, parent communication, and child progress from one platform.',
    },
    {
      title: 'Save on Costs',
      detail:
        'One software, many features — reduce subscription and licensing fees for a single center.',
    },
  ],
  integrations: [
    { id: 'salesforce', label: 'Salesforce', domain: 'salesforce.com' },
    { id: 'excel', label: 'Excel', domain: 'microsoft.com' },
    { id: 'hubspot', label: 'HubSpot', domain: 'hubspot.com' },
    { id: 'quickbooks', label: 'QuickBooks', domain: 'quickbooks.intuit.com' },
    { id: 'whatsapp', label: 'WhatsApp', domain: 'whatsapp.com' },
  ],
} as const;

export const SC_PARENT_APP = {
  eyebrow: 'Parent experience',
  title: 'A Mobile App for Parents',
  lead: 'Give families a beautiful app for updates, profiles, and payments — without another login maze.',
  points: [
    {
      title: 'Student Profiles',
      detail: 'Allergies, contacts, and care notes stay accurate and easy to find.',
    },
    {
      title: 'Instant Updates',
      detail: 'Meals, naps, and moments reach parents the moment staff share them.',
    },
    {
      title: 'In-App Payments',
      detail: 'Tuition and fees paid securely — fewer reminders and fewer late nights.',
    },
  ],
  image: '/images/parent-communication/learning.jpg',
  profile: {
    name: 'Rachel Smith',
    meta: 'Parent of Maya · Age 3',
    avatar: '/images/testimonials/amelia.jpg',
  },
} as const;

export const SC_SECURE_DAY = {
  eyebrow: 'Daily safety',
  title: "Secure Every Step of Your Child's Day",
  lead: 'From arrival to pickup, keep families close to what matters — with clear records and control.',
  points: [
    {
      title: 'Authorized Pick-ups',
      detail: 'Know who is approved to collect each child before they leave the door.',
    },
    {
      title: 'Health Records',
      detail: 'Keep allergies, medications, and care notes ready for teachers and parents.',
    },
    {
      title: 'Parental Controls',
      detail: 'Parents manage notifications and visibility with confidence.',
    },
  ],
  mealImage: '/images/parent-communication/activity.jpg',
} as const;

export const SC_RELIABLE = {
  eyebrow: 'Trust',
  title: 'Easy, Secure, and Reliable',
  lead: 'Launch quickly, protect family data, and get help whenever your center needs it.',
  points: [
    {
      title: 'Easy Setup',
      detail: 'Import rooms and families fast — go live without a long IT project.',
    },
    {
      title: 'End-to-End Security',
      detail: 'Privacy-first access rules and encryption for sensitive childcare data.',
    },
    {
      title: '24/7 Support',
      detail: 'Real humans who understand preschool and daycare operations.',
    },
  ],
  image: '/images/parent-communication/teacher.jpg',
} as const;

export const SC_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'We finally stopped juggling WhatsApp, sheets, and three apps. Panacea keeps our small center organized and parents happier.',
    name: 'Hannah Brooks',
    role: 'Center Owner',
    avatar: '/images/testimonials/hannah.jpg',
    tone: 'mint' as const,
  },
  {
    id: 't2',
    quote:
      'Billing used to take evenings. Now invoices and reminders run themselves — and I get weekends back.',
    name: 'Amelia Torres',
    role: 'Director',
    avatar: '/images/testimonials/amelia.jpg',
    tone: 'cream' as const,
  },
  {
    id: 't3',
    quote:
      'Parents love the meal and nap updates. Engagement went up the week we switched.',
    name: 'Priya Nair',
    role: 'Lead Teacher',
    avatar: '/images/testimonials/priya.jpg',
    tone: 'lavender' as const,
  },
  {
    id: 't4',
    quote:
      'Setup was simple. Support walked us through rooms and fee plans in a couple of days.',
    name: 'Marcus Chen',
    role: 'Owner-Operator',
    avatar: '/images/testimonials/marcus.jpg',
    tone: 'rose' as const,
  },
  {
    id: 't5',
    quote:
      'Authorized pickup and attendance accuracy gave our families peace of mind immediately.',
    name: 'Jordan Lee',
    role: 'Program Lead',
    avatar: '/images/testimonials/jordan.jpg',
    tone: 'mint' as const,
  },
  {
    id: 't6',
    quote:
      'It feels premium without feeling complicated — exactly what a single-site center needs.',
    name: 'Elena Vargas',
    role: 'Center Director',
    avatar: '/images/testimonials/elena.jpg',
    tone: 'cream' as const,
  },
] as const;

export const SC_CTA = {
  title: 'Ready to Simplify Your Childcare Management?',
  body: 'See how Panacea helps single-center owners run operations, delight parents, and protect every child’s day.',
  ctaLabel: 'Book a Demo',
  ctaHref: '/book-demo',
} as const;
