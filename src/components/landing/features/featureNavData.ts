import type { LucideIcon } from 'lucide-react';
import {
  ClipboardList,
  CreditCard,
  CalendarCheck2,
  MessagesSquare,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export type FeatureNavItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const FEATURE_NAV_ITEMS: FeatureNavItem[] = [
  {
    id: 'enrollments',
    title: 'Enrollments',
    description: 'Attract families, manage inquiries, and convert leads into enrolled children.',
    href: '/features/enrollments',
    icon: ClipboardList,
  },
  {
    id: 'billing',
    title: 'Billing & Payments',
    description: 'Automate billing, payments, invoices and financial workflows.',
    href: '/features/billing',
    icon: CreditCard,
  },
  {
    id: 'attendance',
    title: 'Attendance & Occupancy',
    description: 'Track attendance, monitor capacity and improve center utilization.',
    href: '/features/attendance',
    icon: CalendarCheck2,
  },
  {
    id: 'communication',
    title: 'Parent Communication',
    description: 'Keep families connected through timely, intelligent communication.',
    href: '/features/parent-communication',
    icon: MessagesSquare,
  },
  {
    id: 'learning',
    title: 'Learning & Assessments',
    description: "Support children's development with structured learning tools.",
    href: '/features/learning',
    icon: GraduationCap,
  },
  {
    id: 'ai',
    title: 'AI-powered Features',
    description: 'Use AI to reduce repetitive work and improve childcare workflows.',
    href: '/features/ai',
    icon: Sparkles,
  },
];
