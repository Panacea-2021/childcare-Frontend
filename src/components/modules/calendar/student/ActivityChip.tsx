'use client';

import { memo } from 'react';
import { m } from 'framer-motion';
import {
  BookOpen,
  Moon,
  Salad,
  Sparkles,
  SunMedium,
  Trees,
} from 'lucide-react';
import type { StudentActivity, StudentActivityType } from './types';
import { ACTIVITY_TYPE_META } from './types';
import { staffNames, toDisplayTime } from './mockData';

const ICONS: Record<StudentActivityType, typeof BookOpen> = {
  activity: BookOpen,
  meal: Salad,
  nap: Moon,
  outdoor: Trees,
  circle: SunMedium,
  special: Sparkles,
};

type Props = {
  activity: StudentActivity;
  index?: number;
  onClick: (activity: StudentActivity) => void;
};

export const ActivityChip = memo(function ActivityChip({ activity, index = 0, onClick }: Props) {
  const meta = ACTIVITY_TYPE_META[activity.type];
  const Icon = ICONS[activity.type];
  const staff = staffNames(activity.staffIds);

  return (
    <m.button
      type="button"
      className={`ss-chip ss-chip--${meta.tone}`}
      onClick={() => onClick(activity)}
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(index * 0.03, 0.24), type: 'spring', stiffness: 380, damping: 24 }}
      whileHover={{ y: -4, scale: 1.03, boxShadow: '0 12px 24px rgba(93,95,239,0.18)' }}
      whileTap={{ scale: 0.98 }}
      aria-label={`${activity.title}, ${toDisplayTime(activity.startTime)}, ${meta.label}`}
    >
      <span className="ss-chip-top">
        <Icon size={12} aria-hidden />
        {toDisplayTime(activity.startTime)}
      </span>
      <span className="ss-chip-title">{activity.title}</span>
      {staff ? <span className="ss-chip-meta">{staff}</span> : null}
      <span className="ss-chip-type">{meta.label}</span>
    </m.button>
  );
});
