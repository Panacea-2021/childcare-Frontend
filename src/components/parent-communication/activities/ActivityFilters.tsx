'use client';

import React, { useMemo } from 'react';
import { Building2, Filter, LayoutGrid, RotateCcw, Search, Timer } from 'lucide-react';
import type { ActivityFilterState } from '@/types/activity';
import { MOCK_ROOMS } from '@/lib/mock/mockRooms';
import { ACTIVITY_TYPES } from '@/lib/mock/mockActivityTypes';
import { StudentFilterSelect } from './StudentFilterSelect';

interface ActivityFiltersProps {
  filters: ActivityFilterState;
  onFilterChange: (f: ActivityFilterState) => void;
  onReset: () => void;
  totalResultsCount: number;
}

const QUICK_CHIPS = [
  { id: 'today', label: 'Today' },
  { id: 'this_week', label: 'This Week' },
  { id: 'staff_only', label: 'Staff Only' },
  { id: 'parents', label: 'Parents' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'scheduled', label: 'Scheduled' },
] as const;

export function ActivityFilters({
  filters,
  onFilterChange,
  onReset,
  totalResultsCount,
}: ActivityFiltersProps) {
  const roomOptions = useMemo(
    () => [
      { value: 'all', label: 'All Rooms' },
      ...MOCK_ROOMS.map((room) => ({ value: room.name, label: room.name })),
    ],
    [],
  );

  const activityTypeOptions = useMemo(
    () => [
      { value: 'all', label: 'All Activities' },
      ...ACTIVITY_TYPES.map((type) => ({ value: type.id, label: type.name })),
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: 'All Status' },
      { value: 'posted', label: 'Posted' },
      { value: 'scheduled', label: 'Scheduled' },
    ],
    [],
  );

  const toggleChip = (chipId: string) => {
    onFilterChange({
      ...filters,
      quickChip: filters.quickChip === chipId ? null : chipId,
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.room !== 'all' ||
    filters.activityType !== 'all' ||
    filters.status !== 'all' ||
    filters.quickChip !== null;

  return (
    <section className="act-filters act-filters-panel" aria-label="Filter activities">
      <div className="act-filters-row">
        <div className="act-search-box">
          <Search size={16} className="act-search-icon" aria-hidden />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Search title, notes, author..."
            className="act-search-input ui-input"
            aria-label="Search activities"
          />
        </div>

        <div className="act-dropdowns-group">
          <StudentFilterSelect
            value={filters.room}
            onChange={(room) => onFilterChange({ ...filters, room })}
            options={roomOptions}
            placeholder="All Rooms"
            icon={Building2}
            ariaLabel="Filter by room"
          />
          <StudentFilterSelect
            value={filters.activityType}
            onChange={(activityType) => onFilterChange({ ...filters, activityType })}
            options={activityTypeOptions}
            placeholder="All Activities"
            icon={LayoutGrid}
            ariaLabel="Filter by activity type"
          />
          <StudentFilterSelect
            value={filters.status}
            onChange={(status) => onFilterChange({ ...filters, status })}
            options={statusOptions}
            placeholder="All Status"
            icon={Timer}
            ariaLabel="Filter by status"
            searchable={false}
          />
        </div>
      </div>

      <div className="act-chips-row">
        <div className="act-chips">
          <Filter size={14} className="act-chips-icon" aria-hidden />
          {QUICK_CHIPS.map((chip) => {
            const isActive = filters.quickChip === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleChip(chip.id)}
                className={`act-chip${isActive ? ' act-chip-active' : ''}`}
                aria-pressed={isActive}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        <div className="act-results-meta">
          <p className="act-results-count">
            Showing <strong>{totalResultsCount}</strong> activities
          </p>
          {hasActiveFilters ? (
            <button type="button" onClick={onReset} className="act-reset-btn">
              <RotateCcw size={14} aria-hidden />
              Reset
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
