/** Product Guide / Help Center — backend-ready models + sample data. */

export type ArticleSectionType =
  | 'TEXT'
  | 'HEADING'
  | 'IMAGE'
  | 'BULLETS'
  | 'NUMBERED_LIST'
  | 'CALLOUT'
  | 'TIP'
  | 'WARNING'
  | 'LINK'
  | 'DIVIDER';

export type ArticleSection = {
  id: string;
  type: ArticleSectionType;
  title?: string;
  content?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  items?: string[];
  href?: string;
  linkLabel?: string;
  variant?: 'tip' | 'warning' | 'success' | 'info';
  order: number;
};

export type GuideAuthor = {
  id: string;
  name: string;
  avatarUrl: string;
};

export type RelatedArticle = {
  id: string;
  title: string;
  slug: string;
  guideSlug: string;
};

export type ArticleReactionKind = 'NOT_HELPFUL' | 'NEUTRAL' | 'HELPFUL';

export type GuideStep = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  order: number;
  author: GuideAuthor;
  updatedAt: string;
  estimatedReadTime?: string;
  intro?: string;
  sections: ArticleSection[];
  relatedArticles: RelatedArticle[];
  helpCta?: { title: string; body: string; href: string; label: string };
};

export type ProductGuide = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: 'book' | 'play' | 'folder' | 'users' | 'chat' | 'globe';
  authors: GuideAuthor[];
  steps: GuideStep[];
};

const AVATARS = {
  shivee: '/images/testimonials/elena.jpg',
  sourabh: '/images/testimonials/marcus.jpg',
  varun: '/images/testimonials/ryan.jpg',
  priya: '/images/testimonials/priya.jpg',
  amelia: '/images/testimonials/amelia.jpg',
} as const;

const A = {
  shivee: { id: 'a1', name: 'Shivee', avatarUrl: AVATARS.shivee },
  sourabh: { id: 'a2', name: 'Sourabh', avatarUrl: AVATARS.sourabh },
  varun: { id: 'a3', name: 'Varun', avatarUrl: AVATARS.varun },
  priya: { id: 'a4', name: 'Priya', avatarUrl: AVATARS.priya },
  amelia: { id: 'a5', name: 'Amelia', avatarUrl: AVATARS.amelia },
} as const;

/** Placeholder documentation screenshots — replace with CDN URLs from API. */
const DOC = {
  web: '/images/parent-communication/classroom.jpg',
  mobile: '/images/parent-communication/activity.jpg',
  profile: '/images/parent-communication/teacher.jpg',
  roles: '/images/parent-communication/learning.jpg',
} as const;

function stepMeta(order: number, slug: string, title: string, author: GuideAuthor): Pick<
  GuideStep,
  'id' | 'slug' | 'title' | 'order' | 'author' | 'updatedAt' | 'estimatedReadTime'
> {
  return {
    id: `step-${slug}`,
    slug,
    title,
    order,
    author,
    updatedAt: '2026-08-15T10:00:00.000Z',
    estimatedReadTime: '5 min',
  };
}

const gettingStartedSteps: GuideStep[] = [
  {
    ...stepMeta(1, 'center-details-roles', 'Setting Up Illumine: Center Details & Roles', A.sourabh),
    shortDescription: 'Center details, profile, and staff access',
    intro:
      'This guide is split into 7 steps and takes roughly 15–20 minutes to complete. Start by setting up your center profile and staff roles.',
    sections: [
      {
        id: 's1',
        type: 'HEADING',
        title: '1. Use Illumine on the Web',
        order: 1,
      },
      {
        id: 's2',
        type: 'TEXT',
        content:
          'Illumine works in modern browsers on Windows, MacBook, and Chromebook. We recommend Chrome or Edge for the best experience.',
        order: 2,
      },
      {
        id: 's3',
        type: 'IMAGE',
        imageUrl: DOC.web,
        imageAlt: 'Illumine web dashboard overview',
        imageCaption: 'Open Illumine in your browser to manage your center.',
        order: 3,
      },
      {
        id: 's4',
        type: 'HEADING',
        title: '2. Install the Illumine Mobile App',
        order: 4,
      },
      {
        id: 's5',
        type: 'TEXT',
        content:
          'Teachers and parents can use the Illumine mobile app for attendance, messaging, and daily updates.',
        order: 5,
      },
      {
        id: 's6',
        type: 'LINK',
        content: 'Download for iOS (App Store)',
        href: 'https://apps.apple.com',
        linkLabel: 'App Store',
        order: 6,
      },
      {
        id: 's7',
        type: 'LINK',
        content: 'Download for Android (Google Play)',
        href: 'https://play.google.com',
        linkLabel: 'Google Play',
        order: 7,
      },
      {
        id: 's8',
        type: 'IMAGE',
        imageUrl: DOC.mobile,
        imageAlt: 'Illumine mobile app',
        order: 8,
      },
      {
        id: 's9',
        type: 'HEADING',
        title: '3. Set Up Your School Profile',
        order: 9,
      },
      {
        id: 's10',
        type: 'TEXT',
        content:
          "Navigate to Center Management to update your center's name, email, address, and logo so families see the right branding everywhere.",
        order: 10,
      },
      {
        id: 's11',
        type: 'BULLETS',
        items: [
          'Open Center Management from the sidebar',
          'Update center name, email, and phone',
          'Upload your school logo',
          'Save changes',
        ],
        order: 11,
      },
      {
        id: 's12',
        type: 'IMAGE',
        imageUrl: DOC.profile,
        imageAlt: 'Center profile settings screen',
        order: 12,
      },
      {
        id: 's13',
        type: 'HEADING',
        title: '4. Set Up Staff Roles and Access Control',
        order: 13,
      },
      {
        id: 's14',
        type: 'TEXT',
        content:
          'Assign staff names and define roles such as Director, Admin, and Teacher so each person only sees what they need.',
        order: 14,
      },
      {
        id: 's15',
        type: 'IMAGE',
        imageUrl: DOC.roles,
        imageAlt: 'Staff roles and access control',
        order: 15,
      },
      {
        id: 's16',
        type: 'TIP',
        title: 'Pro Tip',
        content: 'Start with Admin and Teacher roles first, then refine permissions after your first week.',
        variant: 'tip',
        order: 16,
      },
      {
        id: 's17',
        type: 'CALLOUT',
        title: 'Ready for the Next Steps?',
        content: 'Continue to Step 2 — Onboard Staff and Students & Send Invites.',
        variant: 'success',
        order: 17,
      },
    ],
    relatedArticles: [
      {
        id: 'r1',
        title: 'Step 2/7 - Onboard Staff and Students & Send Invites',
        slug: 'onboard-staff-students',
        guideSlug: 'getting-started',
      },
      {
        id: 'r2',
        title: 'Step 3/7 - Set up School Calendar, Mark Student Attendance',
        slug: 'school-calendar-attendance',
        guideSlug: 'getting-started',
      },
    ],
    helpCta: {
      title: 'Need a Helping Hand?',
      body: 'Schedule a Free 30-Minute Onboarding Session with our team.',
      href: '/book-demo',
      label: 'Book Your Session Now ✨',
    },
  },
  {
    ...stepMeta(2, 'onboard-staff-students', 'Onboard Staff and Students & Send Invites 🎓', A.shivee),
    intro: 'Add your team and families, then send invites so everyone can log in.',
    sections: [
      {
        id: 'o1',
        type: 'TEXT',
        content: 'Use Center Management → Staff and Students to import or add profiles, then send invites by email.',
        order: 1,
      },
      {
        id: 'o2',
        type: 'IMAGE',
        imageUrl: DOC.roles,
        imageAlt: 'Staff onboarding screen',
        order: 2,
      },
      {
        id: 'o3',
        type: 'CALLOUT',
        title: 'Ready for the Next Steps?',
        content: 'Continue to Step 3 — Set up School Calendar & Attendance.',
        variant: 'success',
        order: 3,
      },
    ],
    relatedArticles: [
      {
        id: 'r3',
        title: 'Step 1/7 - Setting Up Illumine: Center Details & Roles',
        slug: 'center-details-roles',
        guideSlug: 'getting-started',
      },
    ],
  },
  {
    ...stepMeta(3, 'school-calendar-attendance', 'Set up School Calendar, Mark Student Attendance', A.shivee),
    intro: 'Configure holidays and daily attendance so your center stays accurate.',
    sections: [
      {
        id: 'c1',
        type: 'TEXT',
        content: 'Set holidays and working days in Calendar, then mark attendance from the classroom view.',
        order: 1,
      },
      {
        id: 'c2',
        type: 'IMAGE',
        imageUrl: DOC.web,
        imageAlt: 'Attendance calendar',
        order: 2,
      },
    ],
    relatedArticles: [],
  },
  {
    ...stepMeta(4, 'activity-updates-messaging', 'Share Activity Updates & Message Parents 💬', A.varun),
    intro: 'Keep families informed with activity posts and messaging.',
    sections: [
      {
        id: 'm1',
        type: 'TEXT',
        content: 'Share photos, notes, and messages from the classroom feed or the parent messaging inbox.',
        order: 1,
      },
      {
        id: 'm2',
        type: 'IMAGE',
        imageUrl: DOC.mobile,
        imageAlt: 'Parent messaging',
        order: 2,
      },
    ],
    relatedArticles: [],
  },
  {
    ...stepMeta(5, 'invoices-tuition', 'Set Up Invoices, Tuition Plans, Discounts & Tax Rates 🧾', A.sourabh),
    intro: 'Configure fee plans so billing runs automatically.',
    sections: [
      {
        id: 'b1',
        type: 'TEXT',
        content: 'Create tuition plans, discounts, and tax rates under Billing, then generate invoices for families.',
        order: 1,
      },
      {
        id: 'b2',
        type: 'IMAGE',
        imageUrl: DOC.profile,
        imageAlt: 'Billing setup',
        order: 2,
      },
    ],
    relatedArticles: [],
  },
  {
    ...stepMeta(6, 'forms-reports', 'Set Up Forms & Generate Reports', A.priya),
    intro: 'Build enrollment forms and pull the reports your team needs.',
    sections: [
      {
        id: 'f1',
        type: 'TEXT',
        content: 'Use Forms for admissions paperwork and Reports for attendance, billing, and enrollment insights.',
        order: 1,
      },
    ],
    relatedArticles: [],
  },
  {
    ...stepMeta(7, 'parent-enquiries', 'Start Managing Parent Enquiries and New Admissions', A.amelia),
    intro: 'Track tours and convert enquiries into enrolled families.',
    sections: [
      {
        id: 'e1',
        type: 'TEXT',
        content: 'Open Enquiries to capture leads, schedule tours, and move families through your admissions pipeline.',
        order: 1,
      },
    ],
    relatedArticles: [],
  },
];

function simpleGuide(
  id: string,
  slug: string,
  title: string,
  description: string,
  icon: ProductGuide['icon'],
  authors: GuideAuthor[],
  stepTitles: string[],
): ProductGuide {
  return {
    id,
    slug,
    title,
    description,
    icon,
    authors,
    steps: stepTitles.map((t, i) => ({
      ...stepMeta(i + 1, `${slug}-step-${i + 1}`, t, authors[0] ?? A.shivee),
      intro: description,
      sections: [
        {
          id: `${slug}-sec-${i}`,
          type: 'TEXT',
          content: t,
          order: 1,
        },
      ],
      relatedArticles: [],
    })),
  };
}

export const PRODUCT_GUIDES: ProductGuide[] = [
  {
    id: 'g1',
    slug: 'getting-started',
    title: 'Getting Started with illumine',
    description: 'Setting up your school on illumine? New Admin? Using Trial Account? START HERE',
    icon: 'book',
    authors: [A.shivee, A.sourabh],
    steps: gettingStartedSteps,
  },
  simpleGuide(
    'g2',
    'product-training-videos',
    'Product Training Videos',
    'Product Training Videos',
    'play',
    [A.sourabh, A.varun],
    Array.from({ length: 16 }, (_, i) => `Training video ${i + 1}`),
  ),
  simpleGuide(
    'g3',
    'product-release-notes',
    'Product Release Notes 📢',
    'Latest information on new features along with step-by-step guide and screenshots.',
    'folder',
    [A.sourabh, A.varun, A.priya],
    Array.from({ length: 12 }, (_, i) => `Release note ${i + 1}`),
  ),
  simpleGuide(
    'g4',
    'product-guide-usa',
    'Product Guide - USA',
    'Initial guide to set up illumine for USA region',
    'folder',
    [A.shivee],
    Array.from({ length: 8 }, (_, i) => `USA setup step ${i + 1}`),
  ),
  simpleGuide(
    'g5',
    'admin-guide',
    'Using illumine: Admin Guide 🧘',
    'Attendance, Lesson Plan, Forms, Billing & Payments',
    'users',
    [A.sourabh, A.shivee, A.amelia],
    Array.from({ length: 10 }, (_, i) => `Admin guide topic ${i + 1}`),
  ),
  simpleGuide(
    'g6',
    'teacher-staff',
    'Teacher & Staff Instructions',
    'Initial guide for teachers to start using illumine',
    'folder',
    [A.shivee, A.priya],
    [
      'How to Mark Student Attendance',
      'Attendance Reports',
      'Fix Attendance Records',
      'Classroom daily checklist',
    ],
  ),
  simpleGuide(
    'g7',
    'parents-guide',
    "Parent's Guide 👪",
    'illumine Parents App Walkthrough, Assessment Submissions, Parent Handbook',
    'folder',
    [A.varun, A.amelia, A.priya],
    Array.from({ length: 5 }, (_, i) => `Parent guide ${i + 1}`),
  ),
  simpleGuide(
    'g8',
    'faqs',
    'Frequently Asked Question (FAQs)',
    'Answers to all your queries',
    'chat',
    [A.varun, A.sourabh],
    Array.from({ length: 9 }, (_, i) => `FAQ ${i + 1}`),
  ),
  simpleGuide(
    'g9',
    'language-support',
    'Illumine Language Support',
    'Spanish, French and more',
    'globe',
    [A.varun],
    Array.from({ length: 8 }, (_, i) => `Language guide ${i + 1}`),
  ),
];

export function articleCount(guide: ProductGuide) {
  return guide.steps.length;
}

export function authorSummary(authors: GuideAuthor[]) {
  if (authors.length === 0) return 'By the Panacea Team';
  if (authors.length === 1) return `By ${authors[0].name}`;
  return `By ${authors[0].name} and ${authors.length - 1} other${authors.length > 2 ? 's' : ''}`;
}
