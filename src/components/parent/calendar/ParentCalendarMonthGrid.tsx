'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ParentCalendarEvent } from './types';
import { CATEGORY_TONE } from './types';
import {
  buildMonthCells,
  eventsOnDate,
  formatTimeRange,
  monthTitle,
  toISODate,
} from './mockData';
import { ParentCategoryIcon } from './ParentCategoryIcon';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

type Props = {
  viewMonth: Date;
  onMonthChange: (d: Date) => void;
  events: ParentCalendarEvent[];
  today: Date;
  onEventClick: (event: ParentCalendarEvent) => void;
  onMoreClick: (date: Date, events: ParentCalendarEvent[], anchor: DOMRect) => void;
};

export function ParentCalendarMonthGrid({
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
  const label = monthTitle(viewMonth);
  const [slideDir, setSlideDir] = useState(1);
  const [flashToday, setFlashToday] = useState(false);

  const isCurrentMonth =
    viewMonth.getFullYear() === today.getFullYear() && viewMonth.getMonth() === today.getMonth();

  const changeMonth = (next: Date) => {
    const nextIdx = next.getMonth() + next.getFullYear() * 12;
    const curIdx = month + year * 12;
    setSlideDir(nextIdx >= curIdx ? 1 : -1);
    onMonthChange(next);
  };

  const goToday = () => {
    changeMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setFlashToday(true);
    window.setTimeout(() => setFlashToday(false), 900);
  };

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <section className="pc-cal-panel" aria-label="School month calendar">
          <div className="pc-cal-nav">
            <div className="pc-cal-nav-left">
              <button
                type="button"
                className="pc-nav-btn"
                aria-label="Previous month"
                title="Previous month"
                onClick={() => changeMonth(new Date(year, month - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <h2 id="pc-month-label" className="pc-month-label">
                {label}
              </h2>
              <button
                type="button"
                className="pc-nav-btn"
                aria-label="Next month"
                title="Next month"
                onClick={() => changeMonth(new Date(year, month + 1, 1))}
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                className={`pc-today-btn${isCurrentMonth ? ' is-current' : ''}`}
                title="Go to today"
                aria-label="Go to today"
                onClick={goToday}
              >
                Today
              </button>
            </div>

            <div className="pc-legend" aria-label="Category legend">
              <span className="pc-legend-item" title="Event category">
                <span className="pc-legend-dot pc-legend-dot--event" />
                Event
              </span>
              <span className="pc-legend-item" title="Holiday category">
                <span className="pc-legend-dot pc-legend-dot--holiday" />
                Holiday
              </span>
              <span className="pc-legend-item" title="Important Date category">
                <span className="pc-legend-dot pc-legend-dot--important" />
                Important Date
              </span>
            </div>
          </div>

          <div className="pc-weekdays" aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={slideDir}>
            <m.div
              key={`${year}-${month}`}
              className="pc-grid"
              role="grid"
              aria-labelledby="pc-month-label"
              custom={slideDir}
              initial={{ opacity: 0, x: slideDir * 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: slideDir * -14 }}
              transition={{ duration: 0.26, ease: 'easeOut' }}
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
                      'pc-day',
                      inMonth ? '' : 'pc-day--out',
                      isToday ? 'pc-day--today' : '',
                      isToday && flashToday ? 'pc-day--flash' : '',
                      dayEvents.length ? 'pc-day--has' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-label={`${date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}${
                      dayEvents.length
                        ? `, ${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}`
                        : ''
                    }`}
                  >
                    <span className="pc-day-num-row">
                      <span className="pc-day-num">{date.getDate()}</span>
                      {isToday ? <span className="pc-today-badge">Today</span> : null}
                    </span>
                    {dayEvents.length > 0 ? (
                      <div className="pc-day-events">
                        {shown.map((ev, i) => {
                          const tone = CATEGORY_TONE[ev.category];
                          return (
                            <m.button
                              key={ev.id}
                              type="button"
                              className={`pc-event-chip pc-event-chip--${tone}`}
                              onClick={() => onEventClick(ev)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  onEventClick(ev);
                                }
                              }}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04 }}
                              whileHover={{ y: -1, scale: 1.015 }}
                              whileTap={{ scale: 0.98 }}
                              aria-label={`${ev.title}, ${ev.category}, ${formatTimeRange(ev.startTime, ev.endTime)}`}
                              title={ev.title}
                            >
                              <ParentCategoryIcon category={ev.category} size={10} />
                              <span className="pc-event-chip-name">{ev.title}</span>
                            </m.button>
                          );
                        })}
                        {extra > 0 ? (
                          <button
                            type="button"
                            className="pc-more-btn"
                            onClick={(e) => {
                              const rect = (
                                e.currentTarget as HTMLButtonElement
                              ).getBoundingClientRect();
                              onMoreClick(date, dayEvents, rect);
                            }}
                            aria-label={`Show ${extra} more events`}
                          >
                            +{extra} more
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </m.div>
          </AnimatePresence>
        </section>
      </MotionConfig>
    </LazyMotion>
  );
}
