'use client';

import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { CalendarDays, List, Search, X } from 'lucide-react';
import type { ParentCalendarFiltersState, ParentCalendarViewMode } from './types';
import { PARENT_CALENDAR_FILTER_CATEGORIES } from './types';
import { hasActiveFilters, roomOptions } from './mockData';

type Props = {
  filters: ParentCalendarFiltersState;
  onFiltersChange: (next: ParentCalendarFiltersState) => void;
  view: ParentCalendarViewMode;
  onViewChange: (view: ParentCalendarViewMode) => void;
  total: number;
};

type Chip = { key: keyof ParentCalendarFiltersState; label: string };

export function ParentCalendarFilters({
  filters,
  onFiltersChange,
  view,
  onViewChange,
  total,
}: Props) {
  const set = <K extends keyof ParentCalendarFiltersState>(
    key: K,
    value: ParentCalendarFiltersState[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const active = hasActiveFilters(filters);

  const chips: Chip[] = [];
  if (filters.search.trim()) {
    chips.push({ key: 'search', label: `Search: ${filters.search.trim()}` });
  }
  if (filters.room !== 'all') {
    chips.push({ key: 'room', label: `Room: ${filters.room}` });
  }
  if (filters.category !== 'all') {
    chips.push({ key: 'category', label: `Category: ${filters.category}` });
  }
  if (filters.timeRange !== 'all') {
    const timeLabel = filters.timeRange === 'upcoming' ? 'Upcoming' : 'Past';
    chips.push({ key: 'timeRange', label: `Time: ${timeLabel}` });
  }

  const clearChip = (key: Chip['key']) => {
    if (key === 'search') set('search', '');
    else if (key === 'room') set('room', 'all');
    else if (key === 'category') set('category', 'all');
    else if (key === 'timeRange') set('timeRange', 'all');
  };

  const countLabel =
    total === 1 ? '1 event found' : `${total} events found`;

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <m.section
          className="pc-filter-card"
          aria-label="School calendar filters"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.36, ease: 'easeOut' }}
        >
          <div className="pc-filter-grid">
            <div
              className={`pc-filter-field pc-filter-search${
                filters.search.trim() ? ' is-active' : ''
              }`}
            >
              <label htmlFor="pc-search">Search</label>
              <div className="pc-search-wrap">
                <Search size={16} className="pc-search-ico" aria-hidden />
                <input
                  id="pc-search"
                  className="ui-input pc-search-input"
                  type="search"
                  placeholder="Search by event name"
                  value={filters.search}
                  onChange={(e) => set('search', e.target.value)}
                  aria-label="Search by event name"
                />
                <AnimatePresence>
                  {filters.search ? (
                    <m.button
                      type="button"
                      className="pc-search-clear"
                      aria-label="Clear search"
                      onClick={() => set('search', '')}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.14 }}
                    >
                      <X size={14} />
                    </m.button>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            <div className={`pc-filter-field${filters.room !== 'all' ? ' is-active' : ''}`}>
              <label htmlFor="pc-rooms">Rooms</label>
              <select
                id="pc-rooms"
                className="ui-select"
                value={filters.room}
                onChange={(e) => set('room', e.target.value)}
              >
                {roomOptions().map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`pc-filter-field${filters.category !== 'all' ? ' is-active' : ''}`}>
              <label htmlFor="pc-category">Category</label>
              <select
                id="pc-category"
                className="ui-select"
                value={filters.category}
                onChange={(e) => set('category', e.target.value)}
              >
                {PARENT_CALENDAR_FILTER_CATEGORIES.map((c) => (
                  <option key={c} value={c === 'All' ? 'all' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={`pc-filter-field${filters.timeRange !== 'all' ? ' is-active' : ''}`}>
              <label htmlFor="pc-time-range">Time Range</label>
              <select
                id="pc-time-range"
                className="ui-select"
                value={filters.timeRange}
                onChange={(e) =>
                  set('timeRange', e.target.value as ParentCalendarFiltersState['timeRange'])
                }
              >
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {chips.length > 0 ? (
              <m.div
                className="pc-active-chips"
                aria-label="Active filters"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="pc-active-chips-label">Active Filters</span>
                <div className="pc-chip-row">
                  <AnimatePresence initial={false}>
                    {chips.map((chip) => (
                      <m.button
                        key={chip.key}
                        type="button"
                        className="pc-filter-chip"
                        onClick={() => clearChip(chip.key)}
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        aria-label={`Remove filter ${chip.label}`}
                      >
                        <span>{chip.label}</span>
                        <X size={12} aria-hidden />
                      </m.button>
                    ))}
                  </AnimatePresence>
                </div>
              </m.div>
            ) : null}
          </AnimatePresence>

          <div className="pc-filter-toolbar">
            <div className="pc-view-toggle" role="group" aria-label="Calendar view">
              <button
                type="button"
                className={`pc-view-btn${view === 'month' ? ' is-active' : ''}`}
                aria-pressed={view === 'month'}
                onClick={() => onViewChange('month')}
              >
                <CalendarDays size={15} aria-hidden />
                Month View
              </button>
              <button
                type="button"
                className={`pc-view-btn${view === 'list' ? ' is-active' : ''}`}
                aria-pressed={view === 'list'}
                onClick={() => onViewChange('list')}
              >
                <List size={15} aria-hidden />
                List View
              </button>
            </div>

            <div className="pc-filter-toolbar-right">
              {active ? (
                <button
                  type="button"
                  className="pc-clear-btn"
                  onClick={() =>
                    onFiltersChange({
                      search: '',
                      room: 'all',
                      category: 'all',
                      timeRange: 'all',
                    })
                  }
                >
                  <X size={14} aria-hidden />
                  Clear Filters
                </button>
              ) : null}
              <span className="pc-total" aria-live="polite">
                {active ? countLabel : `${total} total`}
              </span>
            </div>
          </div>
        </m.section>
      </MotionConfig>
    </LazyMotion>
  );
}
