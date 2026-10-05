export type BlogCategoryId =
  | 'foundations'
  | 'classrooms'
  | 'teachers'
  | 'marketing'
  | 'winning'
  | 'ai';

export type BlogCategory = {
  id: BlogCategoryId;
  label: string;
};

export type BlogBlock =
  | { type: 'p'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string; cite?: string }
  | { type: 'callout'; tone: 'tip' | 'important' | 'know'; title: string; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'cta'; text: string; buttonLabel: string; href: string };

export type BlogSection = {
  id: string;
  title: string;
  blocks: BlogBlock[];
};

export type BlogArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: BlogCategoryId;
  author: string;
  authorRole: string;
  authorAvatar: string;
  publishedDate: string;
  readTime: string;
  heroTone: 'lavender' | 'mint' | 'yellow' | 'pink' | 'cyan';
  heroIcon: 'clipboard' | 'school' | 'shield' | 'ai' | 'map' | 'phone' | 'scale' | 'draw';
  thumbnail?: string;
  tags: string[];
  featured?: boolean;
  popular?: boolean;
  popularRank?: number;
  sections: BlogSection[];
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'foundations', label: 'Foundations of a Childcare Business' },
  { id: 'classrooms', label: 'Creating The Happiest Classrooms' },
  { id: 'teachers', label: 'Teachers Of The Future' },
  { id: 'marketing', label: 'Marketing Hacks' },
  { id: 'winning', label: 'Winning In Childcare' },
  { id: 'ai', label: 'The Latest AI Superpowers' },
];

export function categoryLabel(id: BlogCategoryId) {
  return BLOG_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export const BLOG_INTERESTING = [
  {
    id: 'checklist',
    title: 'Daily Classroom Observation Checklist',
    body: 'A printable checklist teachers can use during circle time and outdoor play.',
    tone: 'mint' as const,
    slug: '10-tips-to-write-meaningful-observations',
    cta: 'Read article',
  },
  {
    id: 'calendar',
    title: 'Family Engagement Calendar Template',
    body: 'Plan monthly events, conferences, and photo days without the spreadsheet chaos.',
    tone: 'lavender' as const,
    slug: 'happiest-classrooms-routines-that-stick',
    cta: 'Read article',
  },
  {
    id: 'guide',
    title: 'Enrollment Follow-Up Script Guide',
    body: 'Warm scripts for tours, waitlists, and first-week family check-ins.',
    tone: 'yellow' as const,
    slug: 'marketing-hacks-tour-follow-ups',
    cta: 'Read article',
  },
] as const;

export const CONTACT_INFO = {
  heading: 'Get in Touch with Us',
  intro:
    'Whether you need product information, help with the app, or a friendly conversation about growing your center — we are ready to help.',
  emails: [
    { label: 'Sales', value: 'sales@panacea.care' },
    { label: 'Support', value: 'support@panacea.care' },
  ],
  offices: [
    { region: 'USA', detail: 'Wilmington, DE', flag: '🇺🇸', iso: 'US' },
    { region: 'Singapore', detail: 'Singapore', flag: '🇸🇬', iso: 'SG' },
    { region: 'Malaysia', detail: 'Kuala Lumpur', flag: '🇲🇾', iso: 'MY' },
    { region: 'Dubai', detail: 'United Arab Emirates', flag: '🇦🇪', iso: 'AE' },
    { region: 'India', detail: 'Bangalore', flag: '🇮🇳', iso: 'IN' },
  ],
  phones: [
    { region: 'USA', value: '+1 (302) 555-0148', flag: '🇺🇸', iso: 'US' },
    { region: 'Singapore', value: '+65 6123 4567', flag: '🇸🇬', iso: 'SG' },
    { region: 'Malaysia', value: '+60 3-1234 5678', flag: '🇲🇾', iso: 'MY' },
    { region: 'Dubai', value: '+971 4 123 4567', flag: '🇦🇪', iso: 'AE' },
    { region: 'India', value: '+91 80 4123 4567', flag: '🇮🇳', iso: 'IN' },
  ],
} as const;

const tipSections = (slugBase: string): BlogSection[] => [
  {
    id: 'introduction',
    title: 'Introduction',
    blocks: [
      {
        type: 'p',
        text: 'Meaningful observations help teachers understand each child’s learning journey — and help families feel connected to classroom moments that matter.',
      },
      {
        type: 'p',
        text: 'When notes are vague or rushed, parents miss the story. When notes are intentional, every update becomes a bridge between school and home.',
      },
    ],
  },
  {
    id: 'understanding',
    title: 'Understanding Observations',
    blocks: [
      {
        type: 'p',
        text: 'An observation is more than a checklist. It captures what a child did, how they approached a challenge, and what it reveals about growth.',
      },
      {
        type: 'ul',
        items: [
          'Describe the action, not only the outcome',
          'Note the context — materials, peers, and timing',
          'Connect the moment to learning goals when it fits',
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: 'Quick Tip',
        text: 'Write observations while the memory is fresh — even two strong sentences beat a long note written days later.',
      },
    ],
  },
  {
    id: 'why-matter',
    title: 'Why Meaningful Observations Matter',
    blocks: [
      {
        type: 'p',
        text: 'Families trust centers that communicate with clarity. Teachers build portfolios that show progress. Directors gain visibility into classroom quality.',
      },
      {
        type: 'quote',
        text: 'Parents do not need every minute documented — they need the moments that help them understand their child.',
        cite: 'Panacea Education Team',
      },
      {
        type: 'image',
        src: '/images/parent-communication/learning.jpg',
        alt: 'Teacher reviewing learning notes on a tablet',
        caption: 'Clear notes make parent conversations warmer and more specific.',
      },
    ],
  },
  {
    id: 'mistakes',
    title: 'Common Mistakes',
    blocks: [
      {
        type: 'ol',
        items: [
          'Writing only “had a good day” with no detail',
          'Focusing on behavior labels instead of observable actions',
          'Skipping photos or context that would help families',
          'Delaying notes until the end of a busy week',
        ],
      },
      {
        type: 'callout',
        tone: 'important',
        title: 'Important',
        text: 'Avoid comparing children in shared notes. Celebrate each child’s own progress and strengths.',
      },
    ],
  },
  {
    id: 'best-practices',
    title: 'Best Practices',
    blocks: [
      {
        type: 'h3',
        text: 'Keep a simple observation rhythm',
      },
      {
        type: 'p',
        text: 'Choose a few focus children each day. Capture one learning moment and one social moment. Review before sending to families.',
      },
      {
        type: 'ul',
        items: [
          'Use objective language (“built a tall tower” vs “was smart”)',
          'Include the child’s voice when possible',
          'Pair a photo with a short narrative when it adds clarity',
        ],
      },
      {
        type: 'cta',
        text: 'See how Panacea helps teachers draft and send daily observations with AI support.',
        buttonLabel: 'Book a free demo',
        href: '/book-demo',
      },
    ],
  },
  {
    id: 'technology',
    title: 'Using Technology',
    blocks: [
      {
        type: 'p',
        text: 'Modern childcare platforms can draft notes from classroom activity, attach media, and keep a secure history for conferences and assessments.',
      },
      {
        type: 'image',
        src: '/images/parent-communication/classroom.jpg',
        alt: 'Classroom activity captured for a daily report',
        caption: 'Technology should reduce admin time — not replace teacher judgment.',
      },
      {
        type: 'callout',
        tone: 'know',
        title: 'Did You Know?',
        text: 'Centers using structured daily reports often see higher parent engagement within the first month of rollout.',
      },
    ],
  },
  {
    id: 'conclusion',
    title: 'Conclusion',
    blocks: [
      {
        type: 'p',
        text: 'Meaningful observations are a habit, not a form. Start small, stay consistent, and let your platform carry the busywork so teachers can stay present with children.',
      },
      {
        type: 'p',
        text: `Ready to make ${slugBase.replace(/-/g, ' ')} part of a calmer daily workflow? Explore Panacea with your team.`,
      },
    ],
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'b1',
    slug: '10-tips-to-write-meaningful-observations',
    title: '10 Tips to Write Meaningful Observations in Early Years!',
    excerpt:
      'Practical ways teachers can capture learning moments that families actually understand — without adding hours of paperwork.',
    category: 'teachers',
    author: 'Elena Vasquez',
    authorRole: 'Curriculum Advisor',
    authorAvatar: '/images/testimonials/elena.jpg',
    publishedDate: '2026-03-12',
    readTime: '12 min read',
    heroTone: 'lavender',
    heroIcon: 'clipboard',
    tags: ['observations', 'teachers', 'daily reports', 'parent communication'],
    featured: true,
    popular: true,
    popularRank: 1,
    sections: tipSections('10-tips-to-write-meaningful-observations'),
  },
  {
    id: 'b2',
    slug: 'winning-in-childcare-occupancy-playbook',
    title: 'The Occupancy Playbook: Fill Seats Without Burning Out Your Team',
    excerpt:
      'A calm approach to waitlists, tours, and capacity planning that keeps classrooms balanced and families confident.',
    category: 'winning',
    author: 'Marcus Chen',
    authorRole: 'Operations Lead',
    authorAvatar: '/images/testimonials/marcus.jpg',
    publishedDate: '2026-02-28',
    readTime: '8 min read',
    heroTone: 'mint',
    heroIcon: 'scale',
    tags: ['occupancy', 'enrollment', 'operations'],
    popular: true,
    popularRank: 2,
    sections: tipSections('winning-in-childcare-occupancy-playbook'),
  },
  {
    id: 'b3',
    slug: 'ai-superpowers-for-daily-reports',
    title: 'AI Superpowers That Free Teachers from Daily Report Fatigue',
    excerpt:
      'How thoughtful AI drafts help educators review, personalize, and send family updates in minutes — not hours.',
    category: 'ai',
    author: 'Priya Nair',
    authorRole: 'Product Education',
    authorAvatar: '/images/testimonials/priya.jpg',
    publishedDate: '2026-02-18',
    readTime: '7 min read',
    heroTone: 'cyan',
    heroIcon: 'ai',
    thumbnail: '/images/parent-communication/activity.jpg',
    tags: ['ai', 'daily reports', 'teachers'],
    popular: true,
    popularRank: 3,
    sections: tipSections('ai-superpowers-for-daily-reports'),
  },
  {
    id: 'b4',
    slug: 'marketing-hacks-tour-follow-ups',
    title: 'Tour Follow-Up Hacks That Convert More Families',
    excerpt:
      'Warm, timely messages that turn a great tour into an enrolled family — without sounding salesy.',
    category: 'marketing',
    author: 'Amelia Torres',
    authorRole: 'Growth Advisor',
    authorAvatar: '/images/testimonials/amelia.jpg',
    publishedDate: '2026-02-04',
    readTime: '6 min read',
    heroTone: 'pink',
    heroIcon: 'phone',
    tags: ['marketing', 'tours', 'enrollment'],
    popular: true,
    popularRank: 4,
    sections: tipSections('marketing-hacks-tour-follow-ups'),
  },
  {
    id: 'b5',
    slug: 'happiest-classrooms-routines-that-stick',
    title: 'Classroom Routines That Create Happier Days for Everyone',
    excerpt:
      'Simple rhythm ideas that reduce transitions stress and help children feel safe, curious, and ready to learn.',
    category: 'classrooms',
    author: 'Hannah Brooks',
    authorRole: 'Lead Teacher',
    authorAvatar: '/images/testimonials/hannah.jpg',
    publishedDate: '2026-01-22',
    readTime: '9 min read',
    heroTone: 'yellow',
    heroIcon: 'school',
    tags: ['classrooms', 'routines', 'teachers'],
    popular: true,
    popularRank: 5,
    sections: tipSections('happiest-classrooms-routines-that-stick'),
  },
  {
    id: 'b6',
    slug: 'what-soc2-means-for-childcare-centers',
    title: 'What SOC 2 Type II Compliance Means for Your Childcare Center',
    excerpt:
      'A plain-language guide to security trust signals parents and boards increasingly expect from software partners.',
    category: 'foundations',
    author: 'Jordan Lee',
    authorRole: 'Security Advisor',
    authorAvatar: '/images/testimonials/jordan.jpg',
    publishedDate: '2026-01-10',
    readTime: '5 min read',
    heroTone: 'lavender',
    heroIcon: 'shield',
    tags: ['security', 'compliance', 'foundations'],
    sections: tipSections('what-soc2-means-for-childcare-centers'),
  },
  {
    id: 'b7',
    slug: 'multi-site-communication-map',
    title: 'Building a Communication Map Across Multiple Centers',
    excerpt:
      'Keep brand voice consistent while giving each location the flexibility directors need day to day.',
    category: 'winning',
    author: 'Rajesh Kumar',
    authorRole: 'Multi-site Owner',
    authorAvatar: '/images/testimonials/rajesh.jpg',
    publishedDate: '2025-12-18',
    readTime: '7 min read',
    heroTone: 'mint',
    heroIcon: 'map',
    tags: ['enterprise', 'communication', 'multi-site'],
    sections: tipSections('multi-site-communication-map'),
  },
  {
    id: 'b8',
    slug: 'foundations-fee-plans-that-families-understand',
    title: 'Fee Plans Families Understand (and Pay On Time)',
    excerpt:
      'Structure tuition, deposits, and discounts so billing feels fair — and collections stay predictable.',
    category: 'foundations',
    author: 'Elena Vasquez',
    authorRole: 'Curriculum Advisor',
    authorAvatar: '/images/testimonials/elena.jpg',
    publishedDate: '2025-12-02',
    readTime: '8 min read',
    heroTone: 'cyan',
    heroIcon: 'scale',
    tags: ['billing', 'foundations', 'fees'],
    sections: tipSections('foundations-fee-plans-that-families-understand'),
  },
  {
    id: 'b9',
    slug: 'teachers-of-the-future-portfolio-stories',
    title: 'Turning Portfolios into Stories Families Love',
    excerpt:
      'Move beyond folders of photos — craft learning narratives that celebrate growth across the year.',
    category: 'teachers',
    author: 'Marcus Chen',
    authorRole: 'Operations Lead',
    authorAvatar: '/images/testimonials/marcus.jpg',
    publishedDate: '2025-11-20',
    readTime: '6 min read',
    heroTone: 'pink',
    heroIcon: 'draw',
    tags: ['portfolios', 'teachers', 'assessment'],
    sections: tipSections('teachers-of-the-future-portfolio-stories'),
  },
  {
    id: 'b10',
    slug: 'ai-attendance-insights-without-the-noise',
    title: 'Attendance Insights Without the Noise',
    excerpt:
      'How AI can surface staffing risks and absence patterns while keeping dashboards calm and actionable.',
    category: 'ai',
    author: 'Priya Nair',
    authorRole: 'Product Education',
    authorAvatar: '/images/testimonials/priya.jpg',
    publishedDate: '2025-11-05',
    readTime: '5 min read',
    heroTone: 'yellow',
    heroIcon: 'ai',
    tags: ['ai', 'attendance', 'staffing'],
    sections: tipSections('ai-attendance-insights-without-the-noise'),
  },
];

export function getArticleBySlug(slug: string) {
  return BLOG_ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(article: BlogArticle, limit = 3) {
  const sameCategory = BLOG_ARTICLES.filter(
    (a) => a.id !== article.id && a.category === article.category,
  );
  const tagged = BLOG_ARTICLES.filter(
    (a) =>
      a.id !== article.id &&
      a.category !== article.category &&
      a.tags.some((t) => article.tags.includes(t)),
  );
  return [...sameCategory, ...tagged].slice(0, limit);
}

export function getFeaturedArticle() {
  return BLOG_ARTICLES.find((a) => a.featured) ?? BLOG_ARTICLES[0];
}

export function getPopularArticles() {
  return BLOG_ARTICLES.filter((a) => a.popular)
    .sort((a, b) => (a.popularRank ?? 99) - (b.popularRank ?? 99))
    .slice(0, 5);
}
