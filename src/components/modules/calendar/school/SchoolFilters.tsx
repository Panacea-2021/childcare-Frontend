'use client';

import { LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, CalendarRange, LayoutGrid, List, Search } from 'lucide-react';
import { PremiumDateField } from '../PremiumDateField';
import type { SchoolFiltersState, SchoolViewMode } from './types';
import { SCHOOL_FILTER_CATEGORIES } from './types';
import { classroomOptions } from './mockData';

type Props = {
  filters: SchoolFiltersState;
  onFiltersChange: (next: SchoolFiltersState) => void;
  view: SchoolViewMode;
  onViewChange: (view: SchoolViewMode) => void;
};

export function SchoolFilters({ filters, onFiltersChange, view, onViewChange }: Props) {
  const set = <K extends keyof SchoolFiltersState>(key: K, value: SchoolFiltersState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="cal-filter-card sc-filters"
          aria-label="School calendar filters"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06, duration: 0.38 }}
        >
          <div className="cal-filter-field sc-filter-search">
            <label htmlFor="sc-search">
              <Search size={12} aria-hidden />
              Search
            </label>
            <div className="sc-search-wrap">
              <Search size={16} className="sc-search-ico" aria-hidden />
              <input
                id="sc-search"
                className="cal-select sc-search-input"
                type="search"
                placeholder="Search by Event Name..."
                value={filters.search}
                onChange={(e) => set('search', e.target.value)}
                aria-label="Search by event name"
              />
            </div>
          </div>

          <div className="cal-filter-field">
            <label htmlFor="sc-classroom">
              <LayoutGrid size={12} aria-hidden />
              Classroom
            </label>
            <select
              id="sc-classroom"
              className="cal-select"
              value={filters.classroom}
              onChange={(e) => set('classroom', e.target.value)}
            >
              {classroomOptions().map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="cal-filter-field">
            <label htmlFor="sc-category">
              <CalendarRange size={12} aria-hidden />
              Category
            </label>
            <select
              id="sc-category"
              className="cal-select"
              value={filters.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {SCHOOL_FILTER_CATEGORIES.map((c) => (
                <option key={c} value={c === 'All' ? 'all' : c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="cal-filter-field">
            <label htmlFor="sc-date-filter">
              <CalendarDays size={12} aria-hidden />
              Date
            </label>
            <PremiumDateField
              id="sc-date-filter"
              value={filters.date}
              onChange={(v) => set('date', v)}
              placeholder="Select date"
              icon={<CalendarDays size={16} />}
            />
          </div>

          <div className="cal-filter-field sc-view-toggle-field">
            <span className="sc-view-label" id="sc-view-label">
              View
            </span>
            <div className="sc-view-toggle" role="group" aria-labelledby="sc-view-label">
              <m.button
                type="button"
                className={`sc-view-btn ${view === 'calendar' ? 'is-active' : ''}`}
                aria-pressed={view === 'calendar'}
                onClick={() => onViewChange('calendar')}
                whileTap={{ scale: 0.97 }}
              >
                <CalendarDays size={15} aria-hidden />
                Calendar View
              </m.button>
              <m.button
                type="button"
                className={`sc-view-btn ${view === 'list' ? 'is-active' : ''}`}
                aria-pressed={view === 'list'}
                onClick={() => onViewChange('list')}
                whileTap={{ scale: 0.97 }}
              >
                <List size={15} aria-hidden />
                List View
              </m.button>
              <m.span
                className="sc-view-pill"
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                style={{ left: view === 'calendar' ? '4px' : '50%' }}
                aria-hidden
              />
            </div>
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}
