'use client';

import { CalendarDays, PartyPopper, Sparkles } from 'lucide-react';
import type { ParentCalendarCategory } from './types';
import { CATEGORY_TONE } from './types';

type Props = {
  category: ParentCalendarCategory;
  size?: number;
  className?: string;
};

export function ParentCategoryIcon({ category, size = 12, className }: Props) {
  const tone = CATEGORY_TONE[category];
  const Icon =
    category === 'Holiday' ? PartyPopper : category === 'Important Date' ? Sparkles : CalendarDays;

  return (
    <span
      className={`pc-cat-ico pc-cat-ico--${tone}${className ? ` ${className}` : ''}`}
      aria-hidden
      title={category}
    >
      <Icon size={size} strokeWidth={2.25} />
    </span>
  );
}
