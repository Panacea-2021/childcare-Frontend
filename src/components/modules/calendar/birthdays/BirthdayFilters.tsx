'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  CalendarDays,
  CalendarRange,
  Search,
  Sparkles,
  UserCheck,
  Users,
  GraduationCap,
} from 'lucide-react';
import type { BirthdayFilter } from './types';

const FILTERS: { id: BirthdayFilter; label: string; icon: typeof Users }[] = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'staff', label: 'Staff', icon: UserCheck },
  { id: 'today', label: "Today's", icon: CalendarDays },
  { id: 'week', label: 'This Week', icon: CalendarRange },
  { id: 'month', label: 'This Month', icon: CalendarDays },
  { id: 'upcoming', label: 'Upcoming', icon: Users },
];

type Props = {
  filter: BirthdayFilter;
  onFilterChange: (f: BirthdayFilter) => void;
  search: string;
  onSearchChange: (q: string) => void;
};

export function BirthdayFilters({
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: Props) {
  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.div
          className="bc-toolbar"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.32 }}
        >
          <div className="bc-filters-track" role="tablist" aria-label="Birthday filters">
            {FILTERS.map((f) => {
              const Icon = f.icon;
              const active = filter === f.id;
              return (
                <m.button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`bc-filter-tab${active ? ' is-active' : ''}`}
                  onClick={() => onFilterChange(f.id)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {active ? (
                    <m.span
                      className="bc-filter-pill"
                      layoutId="bc-filter-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  <Icon size={14} aria-hidden />
                  <span>{f.label}</span>
                </m.button>
              );
            })}
          </div>

          <div className="bc-search">
            <span className="bc-search-icon" aria-hidden>
              <Search size={16} />
            </span>
            <input
              type="search"
              placeholder="Search student or staff..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search student or staff birthdays"
            />
          </div>
        </m.div>
      </MotionConfig>
    </LazyMotion>
  );
}
