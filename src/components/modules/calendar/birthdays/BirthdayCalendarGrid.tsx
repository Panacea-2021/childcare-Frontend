'use client';

import { memo, useMemo, useState } from 'react';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import type { BirthdayEntry } from './types';
import {
  ageOnNextBirthday,
  birthdaysOnDate,
  buildMonthCells,
  chipIcon,
  firstName,
  formatBirthdayLabel,
  initials,
  isBirthdayToday,
  monthTitle,
  toISODate,
} from './mockData';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type Props = {
  viewMonth: Date;
  onMonthChange: (d: Date) => void;
  entries: BirthdayEntry[];
  today: Date;
  onAdd: () => void;
};

export const BirthdayCalendarGrid = memo(function BirthdayCalendarGrid({
  viewMonth,
  onMonthChange,
  entries,
  today,
  onAdd,
}: Props) {
  const cells = useMemo(() => buildMonthCells(viewMonth), [viewMonth]);
  const todayKey = toISODate(today);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const years = useMemo(() => {
    const base = today.getFullYear();
    const current = viewMonth.getFullYear();
    const min = Math.min(base - 8, current - 2);
    const max = Math.max(base + 5, current + 2);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [today, viewMonth]);

  const prevMonth = () => onMonthChange(new Date(year, month - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, month + 1, 1));
  const goToday = () => onMonthChange(new Date(today.getFullYear(), today.getMonth(), 1));

  return (
    <LazyMotion features={domAnimation}>
      <MotionConfig reducedMotion="user">
        <section className="bc-cal-panel" aria-label="Birthday month calendar">
          <div className="bc-cal-nav">
            <div className="bc-cal-nav-left">
              <h3 id="bc-month-label" className="sr-only">
                {monthTitle(viewMonth)}
              </h3>
              <label className="bc-cal-select-wrap">
                <span className="sr-only">Month</span>
                <select
                  className="bc-cal-select"
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
              <label className="bc-cal-select-wrap">
                <span className="sr-only">Year</span>
                <select
                  className="bc-cal-select bc-cal-select--year"
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

            <div className="bc-cal-nav-right">
              <button type="button" className="bc-today-btn" onClick={goToday}>
                Today
              </button>
              <div className="bc-nav-btns" role="group" aria-label="Month navigation">
                <button
                  type="button"
                  className="bc-nav-btn"
                  aria-label="Previous month"
                  onClick={prevMonth}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="bc-nav-btn"
                  aria-label="Next month"
                  onClick={nextMonth}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <m.button
                type="button"
                className="cal-btn-add bc-cal-add"
                onClick={onAdd}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                aria-label="Add birthday"
              >
                <span className="cal-btn-save-shine" aria-hidden />
                <Plus size={16} aria-hidden />
                Add Birthday
              </m.button>
            </div>
          </div>

          <div className="bc-weekdays" aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <m.div
              key={`${year}-${month}`}
              className="bc-grid"
              role="grid"
              aria-labelledby="bc-month-label"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              {cells.map(({ date, inMonth }) => {
                const key = toISODate(date);
                const dayBirthdays = birthdaysOnDate(entries, date);
                const isToday = key === todayKey;
                const has = dayBirthdays.length > 0;
                const shown = dayBirthdays.slice(0, 2);
                const extra = dayBirthdays.length - shown.length;

                return (
                  <div
                    key={key}
                    role="gridcell"
                    aria-label={`${date.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}${has ? `, ${dayBirthdays.length} birthday${dayBirthdays.length > 1 ? 's' : ''}` : ''}`}
                    className={[
                      'bc-day',
                      inMonth ? '' : 'bc-day--out',
                      isToday ? 'bc-day--today' : '',
                      has ? 'bc-day--has' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="bc-day-num">{date.getDate()}</span>
                    {has ? (
                      <div className="bc-day-events">
                        {shown.map((b, i) => {
                          const todayBday = isBirthdayToday(b.birthDate, today);
                          return (
                            <div key={b.id} style={{ position: 'relative' }}>
                              <button
                                type="button"
                                className={[
                                  'bc-chip',
                                  b.type === 'student' ? 'bc-chip--student' : 'bc-chip--staff',
                                  todayBday ? 'bc-chip--today' : '',
                                ]
                                  .filter(Boolean)
                                  .join(' ')}
                                onMouseEnter={() => setHoverId(b.id)}
                                onMouseLeave={() => setHoverId(null)}
                                onFocus={() => setHoverId(b.id)}
                                onBlur={() => setHoverId(null)}
                                aria-label={`${b.name}, ${b.type}, birthday ${formatBirthdayLabel(b.birthDate)}`}
                              >
                                <span aria-hidden>{chipIcon(b.type, i)}</span>
                                <span>{firstName(b.name)}</span>
                              </button>
                              <AnimatePresence>
                                {hoverId === b.id ? (
                                  <m.div
                                    className="bc-mini-card"
                                    initial={{ opacity: 0, y: 4, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 2, scale: 0.98 }}
                                    transition={{ duration: 0.16 }}
                                    role="tooltip"
                                  >
                                    <div className="bc-mini-top">
                                      <span
                                        className={`bc-avatar bc-avatar--${b.profileColor}`}
                                        aria-hidden
                                      >
                                        {initials(b.name)}
                                      </span>
                                      <div>
                                        <strong>{b.name}</strong>
                                        <small>
                                          Turning {ageOnNextBirthday(b.birthDate, today)}
                                        </small>
                                      </div>
                                    </div>
                                    <span className={`bc-badge bc-badge--${b.type}`}>
                                      {b.type === 'student' ? 'Student' : 'Staff'}
                                    </span>
                                    <small style={{ display: 'block', marginTop: 6 }}>
                                      {formatBirthdayLabel(b.birthDate)}
                                    </small>
                                  </m.div>
                                ) : null}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                        {extra > 0 ? (
                          <span className="bc-chip-more">+{extra} more</span>
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
});
