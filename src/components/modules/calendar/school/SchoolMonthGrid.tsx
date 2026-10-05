'use client';

import { useMemo } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SchoolEvent } from './types';
import { CATEGORY_COLOR } from './types';
import {
  buildMonthCells,
  eventsOnDate,
  monthTitle,
  toDisplayTime,
  toISODate,
} from './mockData';
import { CategoryBadge, EventCover } from './EventCover';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type Props = {
  viewMonth: Date;
  onMonthChange: (d: Date) => void;
  events: SchoolEvent[];
  today: Date;
  onEventClick: (event: SchoolEvent) => void;
  onMoreClick: (date: Date, events: SchoolEvent[]) => void;
};

export function SchoolMonthGrid({
  viewMonth,
  onMonthChange,
  events,
  today,
  onEventClick,
  onMoreClick,
}: Props) {
  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const todayKey = toISODate(today);
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const years = useMemo(() => {
    const base = today.getFullYear();
    const min = Math.min(base - 2, year - 1);
    const max = Math.max(base + 3, year + 1);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [today, year]);

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <section className="sc-cal-panel" aria-label="School month calendar">
          <div className="sc-cal-nav">
            <div className="sc-cal-nav-left">
              <h3 id="sc-month-label" className="sr-only">
                {monthTitle(viewMonth)}
              </h3>
              <label className="sc-cal-select-wrap">
                <span className="sr-only">Month</span>
                <select
                  className="sc-cal-select"
                  value={month}
                  aria-label="Select month"
                  onChange={(e) => onMonthChange(new Date(year, Number(e.target.value), 1))}
                >
                  {MONTHS.map((label, i) => (
                    <option key={label} value={i}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sc-cal-select-wrap">
                <span className="sr-only">Year</span>
                <select
                  className="sc-cal-select sc-cal-select--year"
                  value={year}
                  aria-label="Select year"
                  onChange={(e) => onMonthChange(new Date(Number(e.target.value), month, 1))}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="sc-cal-nav-right">
              <button
                type="button"
                className="sc-today-btn"
                onClick={() => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1))}
              >
                Today
              </button>
              <div className="sc-nav-btns" role="group" aria-label="Month navigation">
                <button
                  type="button"
                  className="sc-nav-btn"
                  aria-label="Previous month"
                  onClick={() => onMonthChange(new Date(year, month - 1, 1))}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="sc-nav-btn"
                  aria-label="Next month"
                  onClick={() => onMonthChange(new Date(year, month + 1, 1))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="sc-weekdays" aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <m.div
              key={`${year}-${month}`}
              className="sc-grid"
              role="grid"
              aria-labelledby="sc-month-label"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              {cells.map(({ date, inMonth }) => {
                const key = toISODate(date);
                const dayEvents = eventsOnDate(events, date);
                const isToday = key === todayKey;
                const shown = dayEvents.slice(0, 2);
                const extra = dayEvents.length - shown.length;

                return (
                  <div
                    key={key}
                    role="gridcell"
                    className={[
                      'sc-day',
                      inMonth ? '' : 'sc-day--out',
                      isToday ? 'sc-day--today' : '',
                      dayEvents.length ? 'sc-day--has' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-label={`${date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}${dayEvents.length ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}` : ''}`}
                  >
                    <span className="sc-day-num">{date.getDate()}</span>
                    {dayEvents.length > 0 ? (
                      <div className="sc-day-events">
                        {shown.map((ev, i) => {
                          const tone = CATEGORY_COLOR[ev.category];
                          return (
                            <m.button
                              key={ev.id}
                              type="button"
                              className={`sc-event-chip sc-event-chip--${tone}`}
                              onClick={() => onEventClick(ev)}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              whileHover={{ y: -2, scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              aria-label={`${ev.name}, ${ev.category}, ${toDisplayTime(ev.startTime)}`}
                            >
                              <EventCover event={ev} size="sm" className="sc-event-chip-cover" />
                              <span className="sc-event-chip-body">
                                <span className="sc-event-chip-name">{ev.name}</span>
                                <span className="sc-event-chip-meta">
                                  <CategoryBadge category={ev.category} />
                                  <span className="sc-event-chip-time">{toDisplayTime(ev.startTime)}</span>
                                </span>
                              </span>
                            </m.button>
                          );
                        })}
                        {extra > 0 ? (
                          <button
                            type="button"
                            className="sc-more-btn"
                            onClick={() => onMoreClick(date, dayEvents)}
                            aria-label={`Show ${extra} more events`}
                          >
                            +{extra} More
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </m.div>
          </AnimatePresence>

          <div className="sc-legend" aria-label="Category legend">
            {(
              [
                ['holiday', 'Holiday'],
                ['event', 'Event'],
                ['sports', 'Sports'],
                ['important', 'Important'],
                ['exam', 'Exam'],
                ['cultural', 'Cultural'],
              ] as const
            ).map(([tone, label]) => (
              <span key={tone} className="sc-legend-item">
                <span className={`sc-legend-dot sc-legend-dot--${tone}`} />
                {label}
              </span>
            ))}
          </div>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
