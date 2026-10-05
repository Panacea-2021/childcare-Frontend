export const AU_HERO = {
  title: 'About Us',
  lead:
    'At Panacea, we are passionate about transforming the way childcare centers operate.',
  ratingLabel: 'Loved by 3000+ Customers',
  avatars: [
    '/images/testimonials/priya.jpg',
    '/images/testimonials/marcus.jpg',
    '/images/testimonials/hannah.jpg',
    '/images/testimonials/amelia.jpg',
    '/images/testimonials/rajesh.jpg',
  ],
  leftImage: '/images/parent-communication/teacher.jpg',
  leftAlt: 'Childcare professional collaborating on a laptop',
  rightImage: '/images/parent-communication/classroom.jpg',
  rightAlt: 'Teacher engaging with a child in the classroom',
} as const;

export const AU_VISION = {
  title: 'Our vision is to simplify childcare',
  body:
    'We envision a world where childcare centers run effortlessly, where teachers and administrators are supported by the right technology, and where parents are closely connected to their child’s learning journey.',
} as const;

export const AU_TRUST = {
  label: 'Over 3000 early childhood centers globally trust Panacea',
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

export const AU_WHY = {
  title: 'Why Choose Panacea?',
  cards: [
    {
      id: 'privacy',
      title: 'Child Privacy & Safety First',
      description:
        'Family data stays protected with layered security, controlled access, and privacy-first design built for early childhood.',
      theme: 'mint' as const,
      modalBody:
        'From encrypted storage to role-based permissions, Panacea keeps children’s information safe while giving staff the access they need — nothing more. Audit-ready controls help centers meet compliance without slowing the day.',
      modalPoints: [
        'Role-based access for staff and families',
        'Encrypted data in transit and at rest',
        'Privacy-first sharing with parents',
      ],
    },
    {
      id: 'support',
      title: 'Comprehensive Support',
      description:
        'Friendly specialists help you onboard, train teams, and resolve questions — so your center never feels stuck.',
      theme: 'pink' as const,
      modalBody:
        'Whether you are opening a new room or rolling out Panacea across sites, our support team partners with you. In-app guidance, live help, and clear playbooks keep operations calm.',
      modalPoints: [
        'Guided onboarding for your team',
        'In-app help when you need it',
        'Playbooks for common center workflows',
      ],
    },
    {
      id: 'integrations',
      title: 'Powerful Integrations',
      description:
        'Connect billing, productivity, and communication tools so Panacea fits the systems you already trust.',
      theme: 'yellow' as const,
      modalBody:
        'Panacea plays well with the tools centers already use — from accounting to messaging — so you are not forced into a rip-and-replace. Sync what matters and keep one source of truth for families.',
      modalPoints: [
        'Accounting and payment partners',
        'Productivity and spreadsheet workflows',
        'Family messaging channels',
      ],
      logos: ['Xero', 'QuickBooks', 'Google', 'WhatsApp', 'Excel'],
    },
  ],
} as const;

export const AU_TESTIMONIALS = [
  {
    id: 't1',
    quote:
      'Panacea helped us connect enrollment, daily updates, and billing — parents finally feel informed without endless message threads.',
    name: 'Priya Nair',
    role: 'Preschool Director',
    avatar: '/images/testimonials/priya.jpg',
  },
  {
    id: 't2',
    quote:
      'Teachers save hours each week. Families love the consistency of daily notes and photos in one calm place.',
    name: 'Marcus Chen',
    role: 'Lead Teacher',
    avatar: '/images/testimonials/marcus.jpg',
  },
  {
    id: 't3',
    quote:
      'Occupancy and attendance finally live together. We staff smarter and fill seats with less guesswork.',
    name: 'Hannah Brooks',
    role: 'Operations Manager',
    avatar: '/images/testimonials/hannah.jpg',
  },
  {
    id: 't4',
    quote:
      'The parent experience feels premium. Photos, reports, and invoices — one trusted home for every family.',
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

export const AU_MISSION = {
  title: 'Join Us on Our Mission',
  body:
    'Help us simplify childcare management so teachers can focus on children, administrators can run calmly, and parents stay connected every day.',
  ctaLabel: 'Book a Demo',
  ctaHref: '/book-demo',
} as const;
