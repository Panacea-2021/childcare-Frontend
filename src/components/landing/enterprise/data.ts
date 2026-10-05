export type EntTabId = 'ai' | 'occupancy' | 'control' | 'retain';

export type EntTabIcon =
  | 'analysis'
  | 'presence'
  | 'automated'
  | 'enrollment'
  | 'waitlist'
  | 'sites'
  | 'reports'
  | 'roles'
  | 'engage'
  | 'compliance';

export const ENT_HERO = {
  titleBefore: 'Everyday Childcare Data into',
  titleAccent: 'Better Decisions.',
} as const;

export const ENT_TABS: { id: EntTabId; label: string }[] = [
  { id: 'ai', label: 'AI' },
  { id: 'occupancy', label: 'Maximize Occupancy' },
  { id: 'control', label: 'Operate with Control' },
  { id: 'retain', label: 'Retain Families' },
];

export type EntTabPanel = {
  id: EntTabId;
  headline?: string;
  bullets: { icon: EntTabIcon; title: string; body: string }[];
  featuresLabel: string;
  featuresHref: string;
  mock: EntTabId;
};

export const ENT_TAB_PANELS: Record<EntTabId, EntTabPanel> = {
  ai: {
    id: 'ai',
    bullets: [
      {
        icon: 'analysis',
        title: 'An Analysis of everything',
        body: 'See attendance, learning, and billing signals in one clear view.',
      },
      {
        icon: 'presence',
        title: 'Be Every Presence',
        body: 'Stay close to every classroom without being in every room.',
      },
      {
        icon: 'automated',
        title: 'Automated by AI',
        body: 'Draft assessments, summaries, and follow-ups in seconds.',
      },
    ],
    featuresLabel: 'Show all features',
    featuresHref: '/features/ai',
    mock: 'ai',
  },
  occupancy: {
    id: 'occupancy',
    headline: 'Predict demand, convert waitlists, and maximize enrollment across your centers.',
    bullets: [
      {
        icon: 'enrollment',
        title: 'Enrollment & Registration',
        body: 'Move every inquiry smoothly from interest to confirmed enrollment.',
      },
      {
        icon: 'waitlist',
        title: 'Waitlist & Demand Insights',
        body: 'Track demand across programs and locations to fill seats faster and plan ahead.',
      },
    ],
    featuresLabel: 'Explore Enrollment Intelligence',
    featuresHref: '/features/enrollments',
    mock: 'occupancy',
  },
  control: {
    id: 'control',
    headline: 'Standardize operations and stay in control as you scale',
    bullets: [
      {
        icon: 'sites',
        title: 'Multi-Center Management',
        body: 'Run every location from one playbook — shared policies, local flexibility, live visibility.',
      },
      {
        icon: 'reports',
        title: 'Reporting & Analytics',
        body: 'Leadership-ready dashboards for occupancy, tuition, staffing, and compliance across the network.',
      },
      {
        icon: 'roles',
        title: 'Roles & Permissions',
        body: 'Grant the right access by HQ, region, and center — without spreading credentials thin.',
      },
    ],
    featuresLabel: 'Explore Enrollment Intelligence',
    featuresHref: '/features/enrollments',
    mock: 'control',
  },
  retain: {
    id: 'retain',
    headline: 'Build stronger relationships with families',
    bullets: [
      {
        icon: 'engage',
        title: 'Parent Engagement',
        body: 'Keep families close with timely updates, milestones, and two-way messaging that feels personal.',
      },
      {
        icon: 'compliance',
        title: 'Compliance & Reporting',
        body: 'Stay audit-ready with licensing, ratios, and readiness signals that surface before they become issues.',
      },
    ],
    featuresLabel: 'Explore Family Engagement',
    featuresHref: '/features/parent-communication',
    mock: 'retain',
  },
};

export const ENT_TRUST = {
  label: 'TRUSTED BY LEADING CHILDCARE BRANDS',
  items: [
    { label: 'Bright Horizons', domain: 'brighthorizons.com' },
    { label: 'KinderCare', domain: 'kindercare.com' },
    { label: 'Guidepost', domain: 'guidepostmontessori.com' },
    { label: 'Dibber', domain: 'dibber.com' },
    { label: 'Primrose', domain: 'primroseschools.com' },
    { label: 'Learning Care', domain: 'learningcaregroup.com' },
    { label: 'Goddard', domain: 'goddardschool.com' },
    { label: 'Childcare Aware', domain: 'childcareaware.org' },
  ],
} as const;

export const ENT_PARTNERS = {
  label: 'OUR TRUSTED PARTNERS',
  items: [
    { label: 'PayPal', domain: 'paypal.com' },
    { label: 'Stripe', domain: 'stripe.com' },
    { label: 'QuickBooks', domain: 'quickbooks.intuit.com' },
    { label: 'Xero', domain: 'xero.com' },
    { label: 'Gusto', domain: 'gusto.com' },
    { label: 'BambooHR', domain: 'bamboohr.com' },
    { label: 'NetSuite', domain: 'netsuite.com' },
    { label: 'Sage', domain: 'sage.com' },
  ],
} as const;

export const ENT_VIDEO = {
  title: 'Built for every stage of growth',
  ctaLabel: 'Watch the demo',
  ctaHref: '/book-demo',
  poster: '/images/parent-communication/classroom.jpg',
} as const;

export const ENT_TEAMS = {
  title: 'Built for every team',
  ctaLabel: 'Explore the Platform',
  ctaHref: '/features/enrollments',
  cards: [
    {
      id: 'finance',
      title: 'Finance',
      body: 'Invoices, subsidies, and collections stay aligned across every center.',
    },
    {
      id: 'operations',
      title: 'Operations',
      body: 'Attendance, ratios, and staffing decisions stay visible in real time.',
    },
    {
      id: 'marketing',
      title: 'Marketing',
      body: 'Turn inquiries into tours with clearer demand and conversion signals.',
    },
    {
      id: 'admissions',
      title: 'Admissions',
      body: 'Move families from interest to enrolled with one consistent journey.',
    },
  ] as const,
} as const;

export const ENT_GOVERNANCE = {
  title: 'Governance & Financial Control',
  cards: [
    {
      id: 'centralized',
      title: 'Centralized Governance',
      body: 'HQ defines rules for pricing, discounts, and compliance, with full visibility.',
      mock: [
        { kind: 'badge' as const, icon: 'shield' as const, label: 'Policy Compliance', status: 'Enforced' },
        { kind: 'badge' as const, icon: 'percent' as const, label: 'Discount Rules', status: 'Active' },
        { kind: 'badge' as const, icon: 'bell' as const, label: 'Deviation Alerts', status: 'Real-time' },
      ],
    },
    {
      id: 'access',
      title: 'Controlled Access & Approvals',
      body: 'Role-based permissions with approval workflows for overrides, discounts, and write-offs.',
      mock: [
        { kind: 'toggle' as const, label: 'Role-Based Access', on: true },
        { kind: 'toggle' as const, label: 'Approval Workflows', on: true },
        { kind: 'toggle' as const, label: 'Audit Trail', on: true },
      ],
    },
    {
      id: 'financial',
      title: 'Financial Control',
      body: 'Automated, rules-based billing across private pay, subsidies, and contracts — with accounting integrations.',
      mock: [
        { kind: 'badge' as const, icon: 'check' as const, label: 'Billing Automation', status: 'Active' },
        { kind: 'badge' as const, icon: 'check' as const, label: 'Subsidy Tracking', status: 'Supported' },
        { kind: 'badge' as const, icon: 'check' as const, label: 'Billing Variance', status: '<0.1%' },
      ],
    },
  ] as const,
} as const;

export const ENT_JOURNEY = {
  title: 'One Unified Enrollment Journey',
  lead: 'From first inquiry to billed enrollment — one path every center can trust.',
  bullets: [
    {
      title: 'Structured Registration',
      body: 'Capture family, program, and compliance details without rework.',
    },
    {
      title: 'Full Audit Visibility',
      body: 'See who changed what, when — across every enrollment step.',
    },
    {
      title: 'Billing Readiness Checks',
      body: 'Flag missing deposits and plan assignments before start day.',
    },
  ] as const,
  stack: [
    { title: 'Inquiry received', meta: 'Maya Chen · Tour requested', tone: 'soft' as const },
    { title: 'Registration complete', meta: 'Docs verified · Room B', tone: 'accent' as const },
    { title: 'Billing ready', meta: 'Plan assigned · Deposit due', tone: 'dark' as const },
  ] as const,
} as const;

export const ENT_SECURITY = {
  title: 'Enterprise-Grade Security and Controls',
  cards: [
    { id: 'soc2', title: 'SOC 2 Certified', body: 'Independent controls assurance for sensitive childcare data.' },
    { id: 'privacy', title: 'Privacy by Design', body: 'Child and family records protected by default access rules.' },
    { id: 'audit', title: 'Audit Trail', body: 'Trace sensitive actions across sites, roles, and workflows.' },
    { id: 'rai', title: 'Responsible AI', body: 'Human review stays in the loop for assessments and messaging.' },
    { id: 'data', title: 'Data at the Center', body: 'Operational truth lives in one governed platform.' },
    { id: 'ops', title: 'Operations', body: 'Security that scales with multi-site childcare growth.' },
  ] as const,
} as const;

export const ENT_INTEGRATIONS = {
  title: 'Plays nicely with the tools you already use',
  items: [
    { label: 'PayPal', domain: 'paypal.com' },
    { label: 'Stripe', domain: 'stripe.com' },
    { label: 'QuickBooks', domain: 'quickbooks.intuit.com' },
    { label: 'Xero', domain: 'xero.com' },
    { label: 'Gusto', domain: 'gusto.com' },
    { label: 'BambooHR', domain: 'bamboohr.com' },
    { label: 'NetSuite', domain: 'netsuite.com' },
    { label: 'Sage', domain: 'sage.com' },
  ],
} as const;

export const ENT_CTA = {
  title: 'Come build the future of early education with us',
  primaryLabel: 'Join the Movement',
  primaryHref: '/book-demo',
  secondaryLabel: 'Get Started',
  secondaryHref: '/book-demo',
  image: '/images/parent-communication/activity.jpg',
} as const;

export const ENT_OCCUPANCY_DASH = {
  notification: 'Jacob added to Waitlist for Summer Program 2025',
  funnel: [
    { label: 'Inquiries', value: 86 },
    { label: 'Admissions', value: 64 },
    { label: 'Interested', value: 48 },
    { label: 'Waitlist', value: 32 },
  ],
  metrics: [
    { label: 'Tours Scheduled', value: 5, pad: 2 },
    { label: 'New Leads', value: 20, pad: 2 },
    { label: 'Waitlist Added', value: 12, pad: 2 },
  ],
  chart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [40, 40, 50, 50, 70, 80],
  },
} as const;

export const ENT_CONTROL_DASH = {
  notification: 'Center 1 is 60% more efficient in tuition collection.',
  bars: [
    { label: 'Center 1', value: 92 },
    { label: 'Center 2', value: 74 },
    { label: 'Center 3', value: 81 },
    { label: 'Center 4', value: 68 },
  ],
  permissions: [
    {
      role: 'Lead Teacher',
      hq: false,
      regions: 'Edit Program',
      centers: true,
    },
    {
      role: 'Assistant Teacher',
      hq: true,
      regions: true,
      centers: true,
    },
    {
      role: 'Director',
      hq: false,
      regions: true,
      centers: true,
    },
  ],
  footer: 'Edit Program permission assigned to Lead Teacher Role.',
} as const;

export const ENT_RETAIN_DASH = {
  feed: [
    { type: 'parent' as const, name: "Jacob's Dad", meta: 'Checked in · 8:12 AM' },
    { type: 'meal' as const, title: 'Meal Update', body: 'Jacob enjoyed apple slices and yogurt.', image: '/images/parent-communication/activity.jpg' },
    { type: 'milestone' as const, title: 'New Milestone', body: 'Shared materials during free play' },
  ],
  compliance: {
    ratioStudents: 20,
    ratioStaff: 5,
    readiness: 65,
    licensing: { label: 'Florida DCF 2026', value: 72 },
  },
} as const;
