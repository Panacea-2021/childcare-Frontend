'use client';

import { coverTone, isGradientCover } from './mockData';
import type { SchoolEvent, SchoolEventCategory } from './types';
import { CATEGORY_COLOR } from './types';

type Props = {
  event?: Pick<SchoolEvent, 'coverUrl' | 'category' | 'name'>;
  coverUrl?: string;
  category?: SchoolEventCategory | string;
  name?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
};

const EMOJI: Record<string, string> = {
  holiday: '🎉',
  event: '📅',
  sports: '⚽',
  exam: '📝',
  important: '⭐',
  cultural: '🎭',
  meeting: '👨‍👩‍👧',
  workshop: '📚',
  celebration: '🥳',
};

export function EventCover({ event, coverUrl, category, name, className = '', size = 'md' }: Props) {
  const url = coverUrl ?? event?.coverUrl;
  const cat = category ?? event?.category ?? 'Event';
  const title = name ?? event?.name ?? 'Event';
  const tone = coverTone(url, cat);
  const catKey = CATEGORY_COLOR[(cat as SchoolEventCategory)] ?? tone;

  if (url && !isGradientCover(url)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt=""
        className={`sc-cover sc-cover--${size} ${className}`}
      />
    );
  }

  return (
    <div
      className={`sc-cover sc-cover--${size} sc-cover--tone-${catKey} ${className}`}
      role="img"
      aria-label={title}
    >
      <span className="sc-cover-emoji" aria-hidden>
        {EMOJI[tone] ?? '📅'}
      </span>
    </div>
  );
}

export function CategoryBadge({ category }: { category: SchoolEventCategory | string }) {
  const key = CATEGORY_COLOR[category as SchoolEventCategory] ?? 'event';
  return <span className={`sc-badge sc-badge--${key}`}>{category}</span>;
}
