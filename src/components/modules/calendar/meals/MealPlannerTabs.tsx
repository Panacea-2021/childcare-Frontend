'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, ClipboardList, Salad } from 'lucide-react';
import type { MealPlannerTabId } from './types';

const TABS: { id: MealPlannerTabId; label: string; icon: typeof CalendarDays }[] = [
  { id: 'meal-calendar', label: 'Meal Calendar', icon: CalendarDays },
  { id: 'food-library', label: 'Food Library', icon: Salad },
  { id: 'templates', label: 'Templates', icon: ClipboardList },
];

type Props = {
  active: MealPlannerTabId;
  onChange: (id: MealPlannerTabId) => void;
};

export function MealPlannerTabs({ active, onChange }: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <div className="mp-tabs" role="tablist" aria-label="Meal planner sections">
          <div className="mp-tabs-track">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.id;
              return (
                <m.button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`mp-tab-${tab.id}`}
                  aria-controls={`mp-panel-${tab.id}`}
                  className={`mp-tab${isActive ? ' is-active' : ''}`}
                  onClick={() => onChange(tab.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive ? (
                    <m.span
                      layoutId="mp-tab-pill"
                      className="mp-tab-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
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
