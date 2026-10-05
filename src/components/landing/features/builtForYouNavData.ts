export type BuiltForYouNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export const BUILT_FOR_YOU_INTRO = {
  heading: "Why we're the Top Choice! Compare Panacea with other childcare software providers.",
  learnMoreHref: '/book-demo',
  learnMoreLabel: 'Learn more',
} as const;

/** Grid order: 2 columns × 2 rows. */
export const BUILT_FOR_YOU_ITEMS: BuiltForYouNavItem[] = [
  {
    id: 'enterprise',
    title: 'Enterprise',
    description: 'Custom-built for multi-site childcare growth and visibility',
    href: '/enterprise',
  },
  {
    id: 'preschool',
    title: 'Preschool',
    description: 'Designed to maximize enrollment and parent engagement',
    href: '/preschool',
  },
  {
    id: 'single-center',
    title: 'Single Center',
    description: 'Purpose-built for streamlined childcare operations and growth',
    href: '/single-center',
  },
  {
    id: 'daycare',
    title: 'Daycare',
    description: 'Built to strengthen family communication',
    href: '/daycare',
  },
];
