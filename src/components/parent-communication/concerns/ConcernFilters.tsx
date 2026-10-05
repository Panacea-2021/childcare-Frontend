'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { SearchBar } from '@/components/parent-communication/shared/SearchBar';
import type { ConcernFilterState, ConcernPriority, ConcernStatus } from '@/types/concern';

interface ConcernFiltersProps {
  filters: ConcernFilterState;
  onChange: (next: ConcernFilterState) => void;
  hideResolvedOption?: boolean;
  hideStatusFilter?: boolean;
}

export function ConcernFilters({
  filters,
  onChange,
  hideResolvedOption = false,
  hideStatusFilter = false,
}: ConcernFiltersProps) {
  const set = <K extends keyof ConcernFilterState>(key: K, value: ConcernFilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section className="concerns-filters" aria-label="Filter concerns">
      <SearchBar
        value={filters.search}
        onChange={(search) => set('search', search)}
        placeholder="Search student, parent, room, title…"
        ariaLabel="Search concerns"
      />

      {!hideStatusFilter ? (
        <div className="ui-field concerns-filter-field">
          <label className="ui-label" htmlFor="concerns-status">
            Status
          </label>
          <select
            id="concerns-status"
            className="ui-select"
            value={filters.status}
            onChange={(e) => set('status', e.target.value as 'all' | ConcernStatus)}
          >
            <option value="all">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            {!hideResolvedOption ? <option value="Resolved">Resolved</option> : null}
          </select>
        </div>
      ) : null}

      <div className="ui-field concerns-filter-field">
        <label className="ui-label" htmlFor="concerns-priority">
          Priority
        </label>
        <select
          id="concerns-priority"
          className="ui-select"
          value={filters.priority}
          onChange={(e) => set('priority', e.target.value as 'all' | ConcernPriority)}
        >
          <option value="all">All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="ui-field concerns-filter-field concerns-filter-date">
        <label className="ui-label" htmlFor="concerns-date">
          Date
        </label>
        <div className="concerns-date-wrap">
          <Calendar size={15} className="concerns-date-icon" aria-hidden />
          <input
            id="concerns-date"
            type="date"
            className="ui-input"
            value={filters.date}
            onChange={(e) => set('date', e.target.value)}
          />
        </div>
      </div>
    </section>
  );
}
