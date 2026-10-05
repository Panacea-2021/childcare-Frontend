export type ResourceCategory =
  | 'Marketing'
  | 'AI'
  | 'Finance'
  | 'Operations'
  | 'Teachers'
  | 'Checklist'
  | 'Template'
  | 'Guide';

export type ResourceTone = 'aqua' | 'lavender' | 'mint' | 'pink' | 'yellow' | 'sky';

export type ResourceBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; tone: 'tip' | 'important' | 'pro'; title: string; text: string };

export type ResourceSection = {
  id: string;
  title: string;
  blocks: ResourceBlock[];
};

export type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: ResourceCategory;
  type: 'Checklist' | 'Template' | 'Cheatsheet' | 'Guide' | 'AI Resource';
  readTime: string;
  publishedAt: string;
  tone: ResourceTone;
  art: 'ads' | 'ai' | 'billing' | 'supplies' | 'camera' | 'facebook' | 'checklist' | 'rocket';
  tags: string[];
  sections: ResourceSection[];
};

function guideSections(topic: string): ResourceSection[] {
  return [
    {
      id: 'introduction',
      title: 'Introduction',
      blocks: [
        {
          type: 'p',
          text: `This guide helps childcare leaders put ${topic} into action without adding more admin chaos to an already full day.`,
        },
        {
          type: 'p',
          text: 'Use it as a practical playbook — skim the checklist, adapt the templates, and share the wins with your team.',
        },
      ],
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      blocks: [
        {
          type: 'p',
          text: 'Start with one clear goal for the next 14 days. Pick a single outcome — more tour bookings, faster assessments, or cleaner billing conversations — and measure it.',
        },
        {
          type: 'ol',
          items: [
            'Define the outcome and owner',
            'Gather the assets you already have',
            'Set a simple weekly review cadence',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Tip',
          text: 'Keep the first rollout small. One classroom or one campaign channel beats a full-center launch that stalls.',
        },
      ],
    },
    {
      id: 'step-1',
      title: 'Step 1 — Map the workflow',
      blocks: [
        {
          type: 'p',
          text: 'Write the current steps on one page. Note where families drop off, where staff re-enter data, and where decisions wait for approvals.',
        },
        {
          type: 'ul',
          items: [
            'Who starts the process?',
            'What information is required?',
            'Where does follow-up get lost?',
          ],
        },
      ],
    },
    {
      id: 'step-2',
      title: 'Step 2 — Apply the template',
      blocks: [
        {
          type: 'p',
          text: 'Use the included checklist or template as a shared language for your team. Customize the wording so it sounds like your center — warm, clear, and confident.',
        },
        {
          type: 'callout',
          tone: 'pro',
          title: 'Pro Tip',
          text: 'Store the finished template in one shared place. Version control beats five slightly different copies in email threads.',
        },
      ],
    },
    {
      id: 'step-3',
      title: 'Step 3 — Measure and refine',
      blocks: [
        {
          type: 'p',
          text: 'Review results weekly for the first month. Keep what works, retire what creates friction, and celebrate small operational wins with your staff.',
        },
        {
          type: 'h3',
          text: 'Signals worth watching',
        },
        {
          type: 'ul',
          items: [
            'Time spent per task',
            'Family response rate',
            'Staff confidence and completion rate',
          ],
        },
      ],
    },
    {
      id: 'tips',
      title: 'Tips',
      blocks: [
        {
          type: 'callout',
          tone: 'important',
          title: 'Important',
          text: 'Protect family privacy in every document and campaign. Never publish identifying information in shared marketing assets.',
        },
        {
          type: 'p',
          text: 'Pair this resource with Panacea workflows so checklists, follow-ups, and family updates live in one calm system.',
        },
      ],
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      blocks: [
        {
          type: 'p',
          text: 'Great early-years operations are built from clear habits — not more tools. Use this resource to create consistency your families can feel.',
        },
      ],
    },
  ];
}

export const RESOURCE_CENTER_ITEMS: ResourceItem[] = [
  {
    id: 'r1',
    slug: 'google-facebook-ads-boosted-enrollments',
    title: 'Set Up Google & Facebook Ads for Boosted Enrollments',
    excerpt:
      'A practical playbook for launching enrollment campaigns that attract the right families without wasting budget.',
    category: 'Marketing',
    type: 'Guide',
    readTime: '9 min',
    publishedAt: '2026-02-12',
    tone: 'aqua',
    art: 'ads',
    tags: ['ads', 'enrollment', 'marketing'],
    sections: guideSections('paid social and search ads for enrollments'),
  },
  {
    id: 'r2',
    slug: 'ai-assessments-save-time-money-energy',
    title: 'Save Time, Money, & Energy With AI Assessments',
    excerpt:
      'How AI-assisted assessments reduce paperwork while keeping teachers in control of every learning insight.',
    category: 'AI',
    type: 'AI Resource',
    readTime: '7 min',
    publishedAt: '2026-02-04',
    tone: 'lavender',
    art: 'ai',
    tags: ['ai', 'assessments', 'teachers'],
    sections: guideSections('AI-supported assessments'),
  },
  {
    id: 'r3',
    slug: 'smart-questions-childcare-billing-software',
    title: 'Smart Questions: Find the Perfect Childcare Billing Software',
    excerpt:
      'A decision checklist for directors evaluating billing platforms — fees, subsidies, reminders, and parent experience.',
    category: 'Finance',
    type: 'Checklist',
    readTime: '6 min',
    publishedAt: '2026-01-28',
    tone: 'mint',
    art: 'billing',
    tags: ['billing', 'finance', 'checklist'],
    sections: guideSections('choosing childcare billing software'),
  },
  {
    id: 'r4',
    slug: 'checklist-best-childcare-supplies',
    title: 'Checklist to Find the Best Childcare Supplies',
    excerpt:
      'Classroom-ready supply standards for safety, learning zones, and seasonal restocking without overbuying.',
    category: 'Operations',
    type: 'Checklist',
    readTime: '5 min',
    publishedAt: '2026-01-18',
    tone: 'yellow',
    art: 'supplies',
    tags: ['operations', 'supplies', 'checklist'],
    sections: guideSections('childcare supply planning'),
  },
  {
    id: 'r5',
    slug: '8-best-daycare-camera-systems',
    title: 'List of the 8 Best Daycare Camera Systems',
    excerpt:
      'Compare camera systems for peace of mind — parent access, storage, privacy controls, and classroom coverage.',
    category: 'Operations',
    type: 'Guide',
    readTime: '8 min',
    publishedAt: '2026-01-10',
    tone: 'sky',
    art: 'camera',
    tags: ['security', 'cameras', 'operations'],
    sections: guideSections('selecting daycare camera systems'),
  },
  {
    id: 'r6',
    slug: 'facebook-ad-manager-boost-enrollments',
    title: 'Boost Enrollments: Navigate Facebook Ad Manager Easily',
    excerpt:
      'A cheatsheet for setting audiences, budgets, and creatives that convert tour interest into enrollments.',
    category: 'Marketing',
    type: 'Cheatsheet',
    readTime: '6 min',
    publishedAt: '2025-12-20',
    tone: 'pink',
    art: 'facebook',
    tags: ['facebook', 'ads', 'enrollment'],
    sections: guideSections('Facebook Ad Manager for childcare'),
  },
  {
    id: 'r7',
    slug: 'family-tour-follow-up-template',
    title: 'Family Tour Follow-Up Template Pack',
    excerpt:
      'Warm email and SMS templates for same-day, day-3, and waitlist follow-ups after center tours.',
    category: 'Marketing',
    type: 'Template',
    readTime: '4 min',
    publishedAt: '2025-12-08',
    tone: 'lavender',
    art: 'checklist',
    tags: ['tours', 'templates', 'enrollment'],
    sections: guideSections('tour follow-up messaging'),
  },
  {
    id: 'r8',
    slug: 'teacher-observation-cheatsheet',
    title: 'Teacher Observation Cheatsheet for Busy Classrooms',
    excerpt:
      'Short observation prompts that help teachers capture meaningful moments without writing novels.',
    category: 'Teachers',
    type: 'Cheatsheet',
    readTime: '5 min',
    publishedAt: '2025-11-22',
    tone: 'mint',
    art: 'checklist',
    tags: ['teachers', 'observations', 'cheatsheet'],
    sections: guideSections('classroom observation habits'),
  },
  {
    id: 'r9',
    slug: 'occupancy-planning-worksheet',
    title: 'Occupancy Planning Worksheet for Growing Centers',
    excerpt:
      'Plan rooms, ratios, and waitlists with a simple worksheet your leadership team can review monthly.',
    category: 'Operations',
    type: 'Template',
    readTime: '6 min',
    publishedAt: '2025-11-10',
    tone: 'aqua',
    art: 'rocket',
    tags: ['occupancy', 'operations', 'growth'],
    sections: guideSections('occupancy planning'),
  },
  {
    id: 'r10',
    slug: 'parent-app-onboarding-checklist',
    title: 'Parent App Onboarding Checklist',
    excerpt:
      'A step-by-step checklist to get families invited, logged in, and confidently using daily updates.',
    category: 'Checklist',
    type: 'Checklist',
    readTime: '4 min',
    publishedAt: '2025-10-28',
    tone: 'sky',
    art: 'checklist',
    tags: ['parents', 'onboarding', 'checklist'],
    sections: guideSections('parent app onboarding'),
  },
  {
    id: 'r11',
    slug: 'ai-daily-report-prompt-pack',
    title: 'AI Daily Report Prompt Pack for Teachers',
    excerpt:
      'Ready-to-use prompts that help AI draft warmer, more specific daily notes — reviewed by teachers before send.',
    category: 'AI',
    type: 'AI Resource',
    readTime: '5 min',
    publishedAt: '2025-10-14',
    tone: 'lavender',
    art: 'ai',
    tags: ['ai', 'daily reports', 'teachers'],
    sections: guideSections('AI daily report prompts'),
  },
  {
    id: 'r12',
    slug: 'fee-plan-conversation-guide',
    title: 'Fee Plan Conversation Guide for Admissions',
    excerpt:
      'Talk about tuition, deposits, and subsidies with clarity — so families feel informed, not pressured.',
    category: 'Finance',
    type: 'Guide',
    readTime: '7 min',
    publishedAt: '2025-09-30',
    tone: 'yellow',
    art: 'billing',
    tags: ['fees', 'admissions', 'finance'],
    sections: guideSections('fee plan conversations'),
  },
];

export const RESOURCE_PAGE_SIZE = 6;

export function getResourceBySlug(slug: string) {
  return RESOURCE_CENTER_ITEMS.find((item) => item.slug === slug);
}

export function getRelatedResources(item: ResourceItem, limit = 3) {
  const same = RESOURCE_CENTER_ITEMS.filter(
    (r) => r.id !== item.id && (r.category === item.category || r.type === item.type),
  );
  const rest = RESOURCE_CENTER_ITEMS.filter(
    (r) => r.id !== item.id && !same.some((s) => s.id === r.id),
  );
  return [...same, ...rest].slice(0, limit);
}

export function getResourcePage(page: number) {
  const start = (page - 1) * RESOURCE_PAGE_SIZE;
  return RESOURCE_CENTER_ITEMS.slice(start, start + RESOURCE_PAGE_SIZE);
}

export function getResourcePageCount() {
  return Math.max(1, Math.ceil(RESOURCE_CENTER_ITEMS.length / RESOURCE_PAGE_SIZE));
}
