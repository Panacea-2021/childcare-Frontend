import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  BookOpen,
  BookOpenText,
  FileText,
  MapPinned,
} from 'lucide-react';

export type ResourceNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Help Center / docs open separately from the marketing site. */
  openInNewTab?: boolean;
};

/** Column-major order for 3 columns × 2 rows (matches reference). */
export const RESOURCE_NAV_ITEMS: ResourceNavItem[] = [
  {
    id: 'about',
    title: 'About Us',
    description:
      'At Panacea, we are passionate about transforming the way childcare operates.',
    href: '/about',
    icon: Building2,
  },
  {
    id: 'blogs',
    title: 'Blogs',
    description: 'Get early education insights designed to help you grow.',
    href: '/resources/blogs',
    icon: FileText,
  },
  {
    id: 'product-guide',
    title: 'Product Guide',
    description: 'Dive into product insights & updates to make the most of Panacea.',
    href: '/resources/product-guide',
    icon: BookOpen,
    openInNewTab: true,
  },
  {
    id: 'resource-center',
    title: 'Resource Center',
    description: 'Access guides, insights, and tools designed to support your childcare.',
    href: '/resources',
    icon: MapPinned,
  },
  {
    id: 'case-studies',
    title: 'Case Studies',
    description: 'Learn how Panacea made a difference for 3,000+ childcare centers.',
    href: '/resources/case-studies',
    icon: BookOpenText,
  },
  {
    id: 'events',
    title: 'Events & Webinars',
    description: 'Access curated events, expert-led webinars, and early years insights.',
    href: '/resources/events-webinars',
    icon: CalendarDays,
  },
];

/** Display as 3 columns: [about, resource-center], [blogs, case-studies], [product-guide, events] */
export const RESOURCE_NAV_COLUMNS: ResourceNavItem[][] = [
  [RESOURCE_NAV_ITEMS[0], RESOURCE_NAV_ITEMS[3]],
  [RESOURCE_NAV_ITEMS[1], RESOURCE_NAV_ITEMS[4]],
  [RESOURCE_NAV_ITEMS[2], RESOURCE_NAV_ITEMS[5]],
];
