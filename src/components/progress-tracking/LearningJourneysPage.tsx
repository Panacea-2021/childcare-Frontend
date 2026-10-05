'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDownUp, FolderOpen, Plus, Route, Search } from 'lucide-react';
import {
  formatJourneyDate,
  loadLearningJourneys,
  type LearningJourney,
} from '@/lib/mock/mockLearningJourney';
import { OdFilterDropdown } from './OdFilterDropdown';
import { ProgressTrackingPageHeader } from './ProgressTrackingPageHeader';
import './progress.css';

const TIME_RANGE_OPTIONS = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'year', label: 'This year' },
  { value: 'all', label: 'All time' },
];

type TimeRange = 'month' | 'week' | 'year' | 'all';
type SortKey = 'name' | 'createdBy' | 'updatedOn' | 'status';

function inTimeRange(updatedOn: string, range: TimeRange) {
  if (range === 'all') return true;
  const d = new Date(updatedOn);
  if (Number.isNaN(d.getTime())) return true;
  const now = new Date(2026, 7, 3);
  if (range === 'week') {
    const from = new Date(now);
    from.setDate(from.getDate() - 7);
    return d >= from && d <= now;
  }
  if (range === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  if (range === 'year') {
    return d.getFullYear() === now.getFullYear();
  }
  return true;
}

export function LearningJourneysPage() {
  const router = useRouter();
  const [rows, setRows] = useState<LearningJourney[]>([]);
  const [search, setSearch] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [sortKey, setSortKey] = useState<SortKey>('updatedOn');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    setRows(loadLearningJourneys());
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter((r) => {
      if (!inTimeRange(r.updatedOn, timeRange)) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.createdBy.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' });
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [rows, search, timeRange, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="pt-page">
      <ProgressTrackingPageHeader
        title="Learning Journey"
        description="Create and share learning journeys for students."
        icon={<Route size={22} strokeWidth={2.1} />}
        actions={
          <button
            type="button"
            className="ui-btn ui-btn-primary"
            onClick={() => router.push('/progress-tracking/learning-journey/create')}
          >
            <Plus size={16} aria-hidden />
            Create new learning journey
          </button>
        }
      />

      <div className="lj-toolbar">
          <div className="ui-field lj-search-field">
            <span className="ui-label">Search</span>
            <div className="lj-search">
              <Search size={15} aria-hidden />
              <input
                className="ui-input"
                type="search"
                placeholder="Search By Student Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search by student name"
              />
            </div>
          </div>
          <div className="ui-field lj-range-field">
            <span className="ui-label">Time Range</span>
            <OdFilterDropdown
              className="lj-dd-range"
              value={timeRange}
              onChange={(v) => setTimeRange(v as TimeRange)}
              options={TIME_RANGE_OPTIONS}
              ariaLabel="Time Range"
            />
          </div>
      </div>

      <div className="pt-shell lj-shell">
        <div className="lj-table-wrap">
          <table className="ui-table lj-table">
            <thead>
              <tr>
                {(
                  [
                    ['name', 'Name'],
                    ['createdBy', 'Created By'],
                    ['updatedOn', 'Updated On'],
                    ['status', 'Status'],
                  ] as const
                ).map(([key, label]) => (
                  <th key={key}>
                    <button
                      type="button"
                      className="lj-th-btn"
                      onClick={() => toggleSort(key)}
                    >
                      {label}
                      <ArrowDownUp size={12} aria-hidden />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="lj-empty">
                      <span className="lj-empty-icon" aria-hidden>
                        <FolderOpen size={36} />
                      </span>
                      <p>No data</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="lj-row"
                    onClick={() =>
                      router.push(
                        `/progress-tracking/learning-journey/create?id=${encodeURIComponent(row.id)}`,
                      )
                    }
                  >
                    <td>
                      <strong>{row.name}</strong>
                      <span className="lj-sub">{row.studentName}</span>
                    </td>
                    <td>{row.createdBy}</td>
                    <td>{formatJourneyDate(row.updatedOn)}</td>
                    <td>
                      <span className={`lj-status is-${row.status}`}>
                        {row.status === 'draft' ? 'Draft' : 'Shared'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
