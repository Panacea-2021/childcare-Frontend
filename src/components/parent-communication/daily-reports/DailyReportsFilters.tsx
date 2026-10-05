'use client';

import { useMemo } from 'react';
import { Filter, Search } from 'lucide-react';
import { SearchableSelect } from '@/components/modules/enquiries/SearchableSelect';
import type { DailyReportFilterState } from '@/types/dailyReport';
import { DAILY_REPORT_ROOMS } from '@/lib/mock/mockDailyReports';

type Props = {
  filters: DailyReportFilterState;
  onChange: (next: DailyReportFilterState) => void;
  resultCount: number;
};

export function DailyReportsFilters({ filters, onChange, resultCount }: Props) {
  const roomOptions = useMemo(
    () => [
      { value: 'all', label: 'All Rooms' },
      ...DAILY_REPORT_ROOMS.map((room) => ({ value: room.name, label: room.name })),
    ],
    [],
  );

  return (
    <section className="dr-filters pc-panel" aria-label="Daily report filters">
      <div className="dr-filters-grid">
        <div className="dr-filter-field dr-filter-span">
          <label htmlFor="dr-room-search" className="ui-label">
            <Search size={12} aria-hidden /> Search room
          </label>
          <div className="dr-search-wrap">
            <Search size={15} className="dr-search-icon" aria-hidden />
            <input
              id="dr-room-search"
              className="ui-input"
              type="search"
              placeholder="Type room name…"
              value={filters.search}
              onChange={(e) => onChange({ ...filters, search: e.target.value })}
            />
          </div>
        </div>

        <div className="dr-filter-field">
          <span className="ui-label">
            <Filter size={12} aria-hidden /> Filter by room
          </span>
          <SearchableSelect
            id="dr-room-filter"
            value={filters.room}
            onChange={(room) => onChange({ ...filters, room })}
            options={roomOptions}
            placeholder="All Rooms"
          />
        </div>

        <div className="dr-filter-field dr-filter-results">
          <span className="ui-label" aria-hidden style={{ visibility: 'hidden' }}>
            Results
          </span>
          <div className="dr-results-count">
            Showing <strong>{resultCount}</strong> room{resultCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>
    </section>
  );
}
