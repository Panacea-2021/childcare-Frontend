/** Talk-to-Expert multi-center pricing — exact reference content only. */

export type TtePlanId = 'essentials' | 'growth' | 'scale';

export type TtePlanFeature = {
  label: string;
  ai?: boolean;
};

export type TtePlan = {
  id: TtePlanId;
  name: string;
  description: string;
  popular?: boolean;
  badge?: string;
  ctaLabel: string;
  ctaHref: string;
  introNote?: string;
  featureGroups: { heading: string; items: TtePlanFeature[] }[];
};

export type TteCell = boolean | string;

export type TteFeature = {
  name: string;
  badge?: string;
  essentials: TteCell;
  growth: TteCell;
  scale: TteCell;
  competitors: Record<string, TteCell>;
};

export type TteCategory = {
  id: string;
  name: string;
  features: TteFeature[];
};

export type TteAddon = {
  id: string;
  title: string;
  description: string;
};

export type TteAiProduct = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export const TTE_HERO = {
  headline: 'The Complete Childcare Platform For Multi-Center Brands',
  subtitle: 'Designed for US operators running two or more locations',
} as const;

export const TTE_PLANS: TtePlan[] = [
  {
    id: 'essentials',
    name: 'Essentials',
    description: 'Run your center with confidence',
    ctaLabel: 'Talk To An Expert',
    ctaHref: '/book-demo',
    featureGroups: [
      {
        heading: 'AI-powered parent communication',
        items: [
          { label: 'Live Translation in 15+ languages', ai: true },
          { label: 'Daily Reports and Activity updates' },
          { label: 'Messaging: 1:1 & groups' },
          { label: 'Announcements & Newsletters' },
        ],
      },
      {
        heading: 'Operations & Billing',
        items: [
          { label: 'Digital Check in / out & Attendance' },
          { label: 'Child to Staff Ratio Compliance' },
          { label: 'Automated Billing, ACH & Autopay' },
          { label: 'Subsidy Billing and tax statements' },
        ],
      },
      {
        heading: 'Enrollments & CRM',
        items: [
          { label: 'Inquiries & Tour management' },
          { label: 'USA State-approved enrollment forms' },
          { label: 'Digital Registration & Admission Process' },
          { label: 'Newsletter in CRM' },
        ],
      },
    ],
  },
  {
    id: 'growth',
    name: 'Growth + AI',
    description: 'Grow faster with built-in AI and automation',
    popular: true,
    badge: 'MOST POPULAR',
    ctaLabel: 'Talk To An Expert',
    ctaHref: '/book-demo',
    introNote: 'Everything in Essentials, plus',
    featureGroups: [
      {
        heading: 'Learning & Assessments',
        items: [
          { label: 'Lesson generator in seconds', ai: true },
          { label: '25+ curriculum frameworks' },
          { label: 'Observations & milestones tracking' },
          { label: 'Assessments & learning portfolios' },
        ],
      },
      {
        heading: 'Multi-site Management',
        items: [
          { label: 'Standardized forms, programs & more - across centers' },
          { label: 'Enrollment & occupancy tracking' },
          { label: 'Centralized multi-site dashboard' },
        ],
      },
      {
        heading: 'Advanced CRM Automations',
        items: [
          { label: 'Lead scoring', ai: true },
          { label: 'Waitlist prioritization', ai: true },
          { label: 'Smart form builder & email editor', ai: true },
          { label: 'Email, SMS & Task Automation', ai: true },
        ],
      },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Operate and expand across centers with control',
    ctaLabel: 'Talk To An Expert',
    ctaHref: '/book-demo',
    introNote: 'Everything in Growth, plus',
    featureGroups: [
      {
        heading: 'Command Center for Multi-site Operations',
        items: [
          { label: 'Launch new centers in minutes' },
          { label: 'Centralized control with site-level flexibility' },
          { label: 'Advanced workflows & approvals' },
        ],
      },
      {
        heading: 'Advanced Reporting',
        items: [
          { label: 'Centralized reporting across locations', ai: true },
          { label: 'BI exports & analytics integrations' },
          { label: 'API License access with rate limits' },
        ],
      },
      {
        heading: 'Integrations, Security and Compliance',
        items: [
          { label: 'SSO with secure, centralized access (Azure AD, Google)' },
          { label: 'Support for custom integrations (API License +Webhooks)' },
          { label: 'Audit logs and activity tracking' },
        ],
      },
      {
        heading: 'Priority & dedicated support',
        items: [{ label: 'Custom onboarding & migration with SLA-backed support' }],
      },
    ],
  },
];

export const TTE_PROMO = {
  title: 'Back-to-School Offer',
  body: 'Introducing AI-Powered Activities. Generate personalized activity updates using nothing more than a photo, voice note, or a short text!',
  ctaLabel: 'Claim Free Trial',
  ctaHref: '/book-demo',
  imageUrl: '/images/parent-communication/classroom.jpg',
} as const;

export const TTE_COMPARE_TITLE = 'Full Feature Comparison';

export const TTE_COMPETITORS = ['Brightwheel', 'Procare', 'LineLeader', 'Playground'] as const;

export const TTE_PLAN_COLUMNS = [
  { id: 'essentials', label: 'Essentials' },
  { id: 'growth', label: 'Growth + AI' },
  { id: 'scale', label: 'Scale' },
] as const;

const allTrue = { essentials: true, growth: true, scale: true } as const;
const growthUp = { essentials: false, growth: true, scale: true } as const;
const scaleOnly = { essentials: false, growth: false, scale: true } as const;

function row(
  name: string,
  plans: { essentials: TteCell; growth: TteCell; scale: TteCell },
  competitors: Record<string, TteCell>,
  badge?: string,
): TteFeature {
  return { name, badge, ...plans, competitors };
}

export const TTE_CATEGORIES: TteCategory[] = [
  {
    id: 'parent-comms',
    name: 'Parent Comms & Engagement',
    features: [
      row('Translation in 15+ languages', allTrue, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW AI'),
      row('1:1 & group messaging', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Announcements & activity sharing', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Daily reports & activity post scheduler', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Voice note Support', allTrue, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW AI'),
      row('Drag-and-drop newsletter builder', allTrue, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW AI'),
      row('Incident reporting with parent acknowledgement', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
    ],
  },
  {
    id: 'center-ops',
    name: 'Center Operations',
    features: [
      row('Digital check-in / check-out for students and staff', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Attendance reports', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Room movement tracking', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Staff PTO management', allTrue, { Brightwheel: false, Procare: true, LineLeader: false, Playground: false }),
      row('Child-to-staff ratio compliance alerts', allTrue, { Brightwheel: false, Procare: true, LineLeader: false, Playground: false }),
      row('Single login across all centers', growthUp, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Cross-site operational reports', growthUp, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
    ],
  },
  {
    id: 'staff',
    name: 'Staff management',
    features: [
      row('Staff time-off tracking', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Staff request time off in advance (from their own app)', allTrue, { Brightwheel: false, Procare: true, LineLeader: false, Playground: false }),
      row('Time-off approval workflow', allTrue, { Brightwheel: false, Procare: true, LineLeader: false, Playground: false }),
      row('Leave policies - auto-allocate balances by role', allTrue, { Brightwheel: false, Procare: true, LineLeader: false, Playground: false }),
    ],
  },
  {
    id: 'ratio',
    name: 'Ratio compliance',
    features: [
      row('Out-of-ratio alerts', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Separate nap-time ratio thresholds', allTrue, { Brightwheel: false, Procare: true, LineLeader: false, Playground: false }),
      row('Historical Ratio trends & staffing planning', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
    ],
  },
  {
    id: 'billing',
    name: 'Tuition & billing',
    features: [
      row('Automated invoicing and collections', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Recurring Autopay — ACH, EFT, and card', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Subsidy and agency billing setup', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Annual tax statements', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Dispute and chargeback tracking', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Subsidy calculator', allTrue, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('Pay-later payment support', allTrue, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('Pre-built state-specific enrollment forms', allTrue, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('Custom forms with approval workflows', allTrue, {
        Brightwheel: 'Custom Fillable Documents',
        Procare: true,
        LineLeader: true,
        Playground: true,
      }),
    ],
  },
  {
    id: 'reports',
    name: 'Reports & dashboards',
    features: [
      row('Role-based permission controls', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Ready-to-use business reports', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Center level and billing dashboards', allTrue, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
    ],
  },
  {
    id: 'ai-marketing',
    name: 'AI-powered marketing',
    features: [
      row('Lead scoring — families most likely to enroll', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW'),
      row('Smart form builder', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW'),
      row('Email editor', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW'),
      row('Waitlist prioritization — fill open seats faster', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW'),
      row('Email, SMS, and task automations', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
    ],
  },
  {
    id: 'curriculum',
    name: 'Curriculum & child progress',
    features: [
      row('Lesson generator — plan in minutes, not hours', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }, 'NEW'),
      row('25+ curriculum frameworks — Montessori, EYFS, and more', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('Observation records', growthUp, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Assessment templates and reports', growthUp, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
      row('Digital learning portfolios', allTrue, {
        Brightwheel: 'Premium Plan',
        Procare: true,
        LineLeader: true,
        Playground: true,
      }),
      row('Fully custom frameworks', growthUp, {
        Brightwheel:
          'Choice of preset framework families (Experience, State Standards, Montessori, DRDP)',
        Procare: false,
        LineLeader: false,
        Playground: false,
      }),
    ],
  },
  {
    id: 'multi-center',
    name: 'Multi-center intelligence',
    features: [
      row('Capacity planning and forecasting dashboard', growthUp, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('Cross-site enrollment, billing, and inquiry dashboards', growthUp, {
        Brightwheel: 'Downloadable & Printable Reports',
        Procare: true,
        LineLeader: true,
        Playground: true,
      }),
      row('Multi-center management', growthUp, { Brightwheel: true, Procare: true, LineLeader: true, Playground: true }),
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise command',
    features: [
      row('Control command center across all locations', scaleOnly, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('Advanced billing automations — approvals and discounts', scaleOnly, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('API access with rate limits', scaleOnly, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
      row('SSO (single sign-on)', scaleOnly, { Brightwheel: false, Procare: false, LineLeader: false, Playground: false }),
    ],
  },
];

export const TTE_ADDONS: TteAddon[] = [
  {
    id: 'accounting',
    title: 'Accounting',
    description: 'Directly integrate with your existing tools to simplify tuition and finances',
  },
  {
    id: 'live-video',
    title: 'Live Video Access',
    description: 'Give parents secure, real-time access to their child’s day.',
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description: 'Automate staff payroll, track hours, and ensure accurate, timely payouts.',
  },
  {
    id: 'api',
    title: 'API Licensing',
    description: 'Integrate seamlessly with your existing tools and extend your system’s capabilities.',
  },
];

export const TTE_ADDONS_CTA = {
  title: 'Add Ons',
  ctaLabel: 'Contact us for Pricing',
  ctaHref: '/book-demo',
} as const;

export const TTE_AI = {
  title: 'Upgrade to Agentic AI',
  ctaLabel: 'Request a Demo',
  ctaHref: '/book-demo',
} as const;

export const TTE_AI_PRODUCTS: TteAiProduct[] = [
  {
    id: 'enroll',
    title: 'Enrollment Agent',
    description:
      'Automate receiving parent inquiries, follow-ups, and registrations and never miss a lead.',
    imageUrl: '/images/parent-communication/activity.jpg',
  },
  {
    id: 'compliance',
    title: 'Compliance Tracker',
    description:
      'Stay ahead of licensing and regulatory requirements with AI insights and real-time visibility.',
    imageUrl: '/images/parent-communication/learning.jpg',
  },
  {
    id: 'reports',
    title: 'Daily Report Generator',
    description:
      'Create and share personalized child reports instantly, without the manual effort.',
    imageUrl: '/images/parent-communication/classroom.jpg',
  },
  {
    id: 'schedule',
    title: 'Staff Scheduling',
    description:
      'Get AI that helps you plan shifts efficiently, manage ratios, and ensure optimal classroom coverage.',
    imageUrl: '/images/parent-communication/teacher.jpg',
  },
];

export const TTE_PLATFORM_CTA = {
  title: 'Excited to try AI first Childcare Platform',
  body: "We'll walk you through the platform and build a migration plan from your current tool.",
  ctaLabel: 'Book a Demo',
  ctaHref: '/book-demo',
  imageUrl: '/images/parent-communication/teacher.jpg',
} as const;

export const TTE_FAQS = [
  {
    id: 'tte-1',
    question: 'How long are your contracts?',
    answer:
      'We offer flexible contract options to suit your needs! Choose from Annual, Semi-Annual, Quarterly, or Monthly plans — whatever works best for you.',
  },
  {
    id: 'tte-2',
    question: 'Is there a discount for Annual service?',
    answer:
      "Absolutely! When you opt for an annual plan with illumine, you unlock special discounts and added value. It's our way of saying thank you for your long-term partnership!",
  },
  {
    id: 'tte-3',
    question: 'My student numbers change every month. How will you handle billing?',
    answer:
      'We often suggest having a center-based package where you have to pay a fixed amount irrespective of a number of students. If you opt for the student-based package we make the necessary adjustments at the end of the month billing.',
  },
  {
    id: 'tte-4',
    question: 'Are they any hidden costs?',
    answer:
      'None at all! We believe in complete transparency. Every cost is shared with you upfront, so there are no surprises along the way.',
  },
  {
    id: 'tte-5',
    question: 'Is there any setup cost?',
    answer:
      'None! Getting started with illumine is simple, smooth, and cost-free. No setup charges involved.',
  },
  {
    id: 'tte-6',
    question: 'I am using some other software. Will I be able to migrate data?',
    answer:
      'Yes, of course! We make data migration seamless. Our team will help you import your data from your existing system with ease. Just reach out to our friendly support team or email us at info@illumine.com, and we’ll take care of it.',
  },
  {
    id: 'tte-7',
    question: 'Do you provide APIs?',
    answer:
      'Yes, we provide APIs to integrate with your existing system. You can request the API documentation and even request additional APIs.',
  },
  {
    id: 'tte-8',
    question: 'Are there any payment processing charges?',
    answer: 'No, illumine does not charge you any payment processing fees.',
  },
  {
    id: 'tte-9',
    question: 'Can I request a feature to be developed for me?',
    answer:
      'Yes, our team will work rigorously to develop a requested feature, especially for your business. Our customization capabilities are what make us the best.',
  },
] as const;
