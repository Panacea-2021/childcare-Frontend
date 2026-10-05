'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, LayoutDashboard, RefreshCw } from 'lucide-react';
import { softInteractiveBtn } from '../animations';
import { DATE_RANGE_OPTIONS } from './mockData';
import type { DateRangePreset } from './types';
import { EnquiriesPageHeader } from '../EnquiriesPageHeader';

type Props = {
  preset: DateRangePreset;
  customFrom: string;
  customTo: string;
  refreshing: boolean;
  onPresetChange: (p: DateRangePreset) => void;
  onCustomFrom: (v: string) => void;
  onCustomTo: (v: string) => void;
  onRefresh: () => void;
};

export const DashboardHeader = memo(function DashboardHeader({
  preset,
  customFrom,
  customTo,
  refreshing,
  onPresetChange,
  onCustomFrom,
  onCustomTo,
  onRefresh,
}: Props) {
  const rangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === preset)?.label ?? 'Last 30 Days';

  return (
    <EnquiriesPageHeader
      title="Enquiries Dashboard"
      description="Monitor enquiries, communication, campaigns, automation and lead activity from one place."
      icon={<LayoutDashboard size={22} strokeWidth={2.1} />}
      actions={
        <>
          <div className="edash-range-wrap">
            <CalendarDays size={15} strokeWidth={2.1} className="edash-range-icon" aria-hidden />
            <label className="sr-only" htmlFor="edash-range">
              Select date range
            </label>
            <select
              id="edash-range"
              className="ui-select edash-range-select"
              value={preset}
              onChange={(e) => onPresetChange(e.target.value as DateRangePreset)}
              aria-label={`Date range: ${rangeLabel}`}
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {preset === 'custom' ? (
            <div className="edash-custom-range">
              <input
                id="edash-from"
                type="date"
                className="ui-input edash-date-input"
                value={customFrom}
                onChange={(e) => onCustomFrom(e.target.value)}
                aria-label="From date"
              />
              <input
                id="edash-to"
                type="date"
                className="ui-input edash-date-input"
                value={customTo}
                onChange={(e) => onCustomTo(e.target.value)}
                aria-label="To date"
              />
            </div>
          ) : null}

          <motion.button
            type="button"
            className="ui-btn ui-btn-outline edash-refresh"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            {...softInteractiveBtn}
          >
            <RefreshCw size={15} className={refreshing ? 'edash-spin' : undefined} aria-hidden />
            Refresh
          </motion.button>
        </>
      }
    />
  );
});
