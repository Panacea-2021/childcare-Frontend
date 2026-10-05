'use client';

import type { ReactNode } from 'react';
import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  Globe2,
  HelpCircle,
  LayoutList,
  MessageCircle,
  MessagesSquare,
  Receipt,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { ModulePageHeader } from './ModulePageHeader';

type Props = {
  title: string;
  description?: string;
  crumbs?: string[];
  actions?: ReactNode;
  /** Overrides derived section label from crumbs */
  section?: string;
  icon?: ReactNode;
};

function defaultIcon(title: string): ReactNode {
  const t = title.toLowerCase();
  if (t.includes('program')) return <LayoutList />;
  if (t.includes('billing') || t.includes('accounting')) return <Receipt />;
  if (t.includes('message')) return <MessagesSquare />;
  if (t.includes('parent') || t.includes('communication')) return <MessageCircle />;
  if (t.includes('enquir')) return <ClipboardList />;
  if (t.includes('learning') || t.includes('assessment') || t.includes('manage')) return <ShieldCheck />;
  if (t.includes('report')) return <BarChart3 />;
  if (t.includes('help')) return <HelpCircle />;
  if (t.includes('language')) return <Globe2 />;
  if (t.includes('profile')) return <UserRound />;
  if (t.includes('center')) return <Building2 />;
  if (t.includes('calendar') || t.includes('holiday') || t.includes('meal') || t.includes('birthday')) {
    return <CalendarDays />;
  }
  if (t.includes('tour')) return <CalendarDays />;
  return <LayoutList />;
}

export function PageHeader({ title, description, crumbs, actions, section, icon }: Props) {
  const sectionLabel = section || crumbs?.[1] || crumbs?.[0] || title;

  return (
    <ModulePageHeader
      section={sectionLabel}
      title={title}
      description={description}
      icon={icon ?? defaultIcon(title)}
      actions={actions}
    />
  );
}
