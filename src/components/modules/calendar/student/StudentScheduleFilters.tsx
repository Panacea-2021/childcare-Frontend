'use client';

import { memo } from 'react';
import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import type { ScheduleStaff } from '../types';
import { ACTIVITY_TYPE_OPTIONS } from './types';
import type { StudentScheduleFilters } from './types';
import { addDays, formatWeekLabel, scheduleRooms } from './mockData';

type Props = {
  weekStart: Date;
  onWeekChange: (next: Date) => void;
  filters: StudentScheduleFilters;
  onFiltersChange: (next: StudentScheduleFilters) => void;
  staff: ScheduleStaff[];
  onReset: () => void;
  onGenerateToday: () => void;
};

export const StudentScheduleFiltersBar = memo(function StudentScheduleFiltersBar({
  weekStart,
  onWeekChange,
  filters,
  onFiltersChange,
  staff,
  onReset,
  onGenerateToday,
}: Props) {
  const set = (patch: Partial<StudentScheduleFilters>) =>
    onFiltersChange({ ...filters, ...patch });

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="ss-filters"
          aria-label="Schedule filters"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: 'easeOut' }}
        >
          <div className="ss-filters-grid">
            <div className="ss-field ss-week-field">
              <label id="ss-week-label">
                <Filter size={12} aria-hidden />
                Week Navigation
              </label>
              <div className="ss-week-nav" role="group" aria-labelledby="ss-week-label">
                <m.button
                  type="button"
                  className="ss-week-btn"
                  aria-label="Previous week"
                  onClick={() => onWeekChange(addDays(weekStart, -7))}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <ChevronLeft size={18} />
                </m.button>
                <div className="ss-week-label">
                  <strong>Current Week</strong>
                  <span>{formatWeekLabel(weekStart)}</span>
                </div>
                <m.button
                  type="button"
                  className="ss-week-btn"
                  aria-label="Next week"
                  onClick={() => onWeekChange(addDays(weekStart, 7))}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <ChevronRight size={18} />
                </m.button>
              </div>
            </div>

            <div className="ss-field">
              <label htmlFor="ss-room-filter">
                <Filter size={12} aria-hidden />
                Room
              </label>
              <select
                id="ss-room-filter"
                className="ss-select"
                value={filters.room}
                onChange={(e) => set({ room: e.target.value })}
              >
                <option value="all">All Rooms</option>
                {scheduleRooms.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="ss-field">
              <label htmlFor="ss-type-filter">
                <Sparkles size={12} aria-hidden />
                Activity Type
              </label>
              <select
                id="ss-type-filter"
                className="ss-select"
                value={filters.type}
                onChange={(e) => set({ type: e.target.value })}
              >
                <option value="all">All Types</option>
                {ACTIVITY_TYPE_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ss-field">
              <label htmlFor="ss-staff-filter">
                <Users size={12} aria-hidden />
                Staff
              </label>
              <select
                id="ss-staff-filter"
                className="ss-select"
                value={filters.staffId}
                onChange={(e) => set({ staffId: e.target.value })}
              >
                <option value="all">All Staff</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="ss-field">
              <label htmlFor="ss-search">
                <Search size={12} aria-hidden />
                Search Activity
              </label>
              <div className="ss-search-wrap">
                <Search size={15} aria-hidden />
                <input
                  id="ss-search"
                  className="ss-input"
                  type="search"
                  placeholder="Search title, room, staff…"
                  value={filters.search}
                  onChange={(e) => set({ search: e.target.value })}
                />
              </div>
            </div>

            <div className="ss-filter-actions">
              <m.button
                type="button"
                className="ss-btn ss-btn-outline"
                onClick={onReset}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Reset filters"
              >
                <span className="ss-btn-ripple" aria-hidden />
                <RotateCcw size={15} aria-hidden />
                Reset Filters
              </m.button>
              <m.button
                type="button"
                className="ss-btn ss-btn-primary"
                onClick={onGenerateToday}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Generate today’s schedule"
              >
                <span className="ss-btn-shine" aria-hidden />
                <span className="ss-btn-ripple" aria-hidden />
                <Sparkles size={15} aria-hidden />
                Generate Today
              </m.button>
            </div>
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
});
