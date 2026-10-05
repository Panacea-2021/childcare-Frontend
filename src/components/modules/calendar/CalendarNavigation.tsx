'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays } from './mockData';

type Props = {
  weekStart: Date;
  onWeekChange: (next: Date) => void;
  label?: string;
};

/** Compact previous / next week controls for calendar views. */
export function CalendarNavigation({ weekStart, onWeekChange, label = 'Week' }: Props) {
  return (
    <div className="cal-corner-nav" role="group" aria-label={`${label} navigation`}>
      <button
        type="button"
        className="cal-icon-btn"
        aria-label={`Previous ${label.toLowerCase()}`}
        onClick={() => onWeekChange(addDays(weekStart, -7))}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        type="button"
        className="cal-icon-btn"
        aria-label={`Next ${label.toLowerCase()}`}
        onClick={() => onWeekChange(addDays(weekStart, 7))}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
