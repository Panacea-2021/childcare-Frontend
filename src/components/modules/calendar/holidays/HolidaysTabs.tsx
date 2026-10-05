'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, Palmtree, Settings2 } from 'lucide-react';
import type { HolidaysTabId } from './types';

const TABS: { id: HolidaysTabId; label: string; icon: typeof CalendarDays }[] = [
  { id: 'leave-policy', label: 'Leave Policy', icon: Settings2 },
  { id: 'holiday-calendar', label: 'Holiday Calendar', icon: CalendarDays },
  { id: 'weekend-config', label: 'Weekend Configuration', icon: Palmtree },
];

type Props = {
  active: HolidaysTabId;
  onChange: (id: HolidaysTabId) => void;
};

export function HolidaysTabs({ active, onChange }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="sh-tabs" role="tablist" aria-label="Staff holidays sections">
          <div className="sh-tabs-track">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <m.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`sh-tab-${tab.id}`}
                  className={`sh-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => onChange(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive ? <m.span layoutId="sh-tab-pill" className="sh-tab-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} /> : null}
                  <Icon size={15} aria-hidden />
                  <span>{tab.label}</span>
                </m.button>
              );
            })}
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
