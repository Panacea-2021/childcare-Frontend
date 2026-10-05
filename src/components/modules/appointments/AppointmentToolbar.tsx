'use client';

import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Columns3, RotateCcw, Search } from 'lucide-react';
import type { AppointmentFilters, AppointmentStatus } from '@/lib/appointments/types';
import { CALENDAR_OPTIONS, FACULTY } from '@/lib/appointments/mockData';
import { APPT_ALL_COLS, type ApptColKey } from './AppointmentList';
import { btnMotion } from './animations';

type Props = {
  filters: AppointmentFilters;
  onChange: (patch: Partial<AppointmentFilters>) => void;
  onClear: () => void;
  /** Show Columns control (list view) */
  showColumns?: boolean;
  visibleCols?: Record<ApptColKey, boolean>;
  onColsChange?: (next: Record<ApptColKey, boolean>) => void;
  trailing?: ReactNode;
};

const STATUSES: Array<'All' | AppointmentStatus> = [
  'All',
  'Scheduled',
  'Confirmed',
  'Completed',
  'Cancelled',
  'No Show',
];

export const AppointmentToolbar = memo(function AppointmentToolbar({
  filters,
  onChange,
  onClear,
  showColumns = false,
  visibleCols,
  onColsChange,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [colsOpen, setColsOpen] = useState(false);
  const colsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!colsOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (colsRef.current && !colsRef.current.contains(e.target as Node)) setColsOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [colsOpen]);

  const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'appt-ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 560);

    setLoading(true);
    onClear();
    window.setTimeout(() => setLoading(false), 520);
  };

  return (
    <div className="appt-toolbar">
      <label className="appt-search-field appt-toolbar-search">
        <Search size={16} aria-hidden />
        <input
          value={filters.searchAppointment}
          onChange={(e) => onChange({ searchAppointment: e.target.value })}
          placeholder="Search appointments…"
          aria-label="Search"
        />
      </label>

      <select
        className="ui-filter appt-toolbar-control"
        value={filters.calendarId}
        onChange={(e) => onChange({ calendarId: e.target.value })}
        aria-label="Calendar"
      >
        <option value="All">All calendars</option>
        {CALENDAR_OPTIONS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        className="ui-filter appt-toolbar-control"
        value={filters.status}
        onChange={(e) =>
          onChange({ status: e.target.value as AppointmentFilters['status'] })
        }
        aria-label="Appointment Status"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s === 'All' ? 'All statuses' : s}
          </option>
        ))}
      </select>

      <select
        className="ui-filter appt-toolbar-control"
        value={filters.staff}
        onChange={(e) => onChange({ staff: e.target.value })}
        aria-label="Staff"
      >
        <option value="All">All staff</option>
        {FACULTY.map((f) => (
          <option key={f.id} value={f.name}>
            {f.name}
          </option>
        ))}
      </select>

      <label className="appt-search-field appt-toolbar-date">
        <CalendarDays size={15} aria-hidden />
        <input
          type="date"
          value={filters.fromDate}
          onChange={(e) => onChange({ fromDate: e.target.value })}
          aria-label="From date"
        />
      </label>

      <motion.button
        type="button"
        className={`ui-btn ui-btn-outline appt-reset-btn${loading ? ' is-loading' : ''}`}
        onClick={handleReset}
        disabled={loading}
        aria-label="Reset filters"
        title="Reset filters"
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
      >
        <RotateCcw
          size={15}
          aria-hidden
          className={loading ? 'appt-reset-spin' : undefined}
        />
        Reset
      </motion.button>

      {showColumns && visibleCols && onColsChange ? (
        <div className="appt-cols-menu" ref={colsRef}>
          <motion.button
            type="button"
            className="ui-btn ui-btn-outline"
            onClick={() => setColsOpen((v) => !v)}
            aria-expanded={colsOpen}
            {...btnMotion}
          >
            <Columns3 size={15} />
            Columns
          </motion.button>
          {colsOpen ? (
            <div className="appt-context appt-cols-pop">
              {APPT_ALL_COLS.filter((c) => !c.always).map((col) => (
                <label key={col.key} className="appt-cmd-item">
                  <input
                    type="checkbox"
                    checked={visibleCols[col.key]}
                    onChange={() =>
                      onColsChange({ ...visibleCols, [col.key]: !visibleCols[col.key] })
                    }
                  />
                  {col.label}
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
