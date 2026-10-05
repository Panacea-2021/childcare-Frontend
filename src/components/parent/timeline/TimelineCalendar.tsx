'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { ACTIVITY_ICON_MAP } from '@/components/parent-communication/activities/ActivitySelector';
import {
  formatCalendarDayLabel,
  type DayActivityMeta,
} from '@/lib/parent/parentTimelineStore';

type Props = {
  year: number;
  month: number;
  mode: 'month' | 'year';
  selectedDay: string;
  dayMeta: Record<string, DayActivityMeta>;
  yearCounts: Record<number, number>;
  onYearChange: (y: number) => void;
  onMonthChange: (m: number) => void;
  onModeChange: (m: 'month' | 'year') => void;
  onSelectDay: (dayKey: string) => void;
};

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const MONTHS_LONG = [
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
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ease = [0.22, 1, 0.36, 1] as const;

const monthMotion = {
  enter: (d: number) => ({ opacity: 0, x: d * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (d: number) => ({ opacity: 0, x: d * -22 }),
};

const yearMotion = {
  enter: (d: number) => ({ opacity: 0, x: d * 24, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (d: number) => ({ opacity: 0, x: d * -18, scale: 0.98 }),
};

function dayKey(y: number, m: number, d: number) {
  return `${y}-${`${m + 1}`.padStart(2, '0')}-${`${d}`.padStart(2, '0')}`;
}

type Cell = { key: string; label: number; inMonth: boolean };

export function TimelineCalendar({
  year,
  month,
  mode,
  selectedDay,
  dayMeta,
  yearCounts,
  onYearChange,
  onMonthChange,
  onModeChange,
  onSelectDay,
}: Props) {
  const [navDir, setNavDir] = useState<1 | -1>(1);
  const [pulseToday, setPulseToday] = useState(false);
  const todayPulseTimer = useRef<number | null>(null);

  const todayKey = dayKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate(),
  );

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const startPad = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: Array<Cell | null> = [];
    for (let i = 0; i < startPad; i += 1) list.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) {
      list.push({ key: dayKey(year, month, d), label: d, inMonth: true });
    }
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [year, month]);

  const monthActivityTotal = useMemo(() => {
    let n = 0;
    for (const [key, meta] of Object.entries(dayMeta)) {
      const [y, m] = key.split('-').map(Number);
      if (y === year && m === month + 1) n += meta.count;
    }
    return n;
  }, [dayMeta, year, month]);

  const selectedMeta = dayMeta[selectedDay];
  const selectedLabel = formatCalendarDayLabel(selectedDay);

  useEffect(
    () => () => {
      if (todayPulseTimer.current) window.clearTimeout(todayPulseTimer.current);
    },
    [],
  );

  const shiftMonth = (dir: -1 | 1) => {
    setNavDir(dir);
    const next = new Date(year, month + dir, 1);
    onYearChange(next.getFullYear());
    onMonthChange(next.getMonth());
  };

  const shiftYear = (dir: -1 | 1) => {
    setNavDir(dir);
    onYearChange(year + dir);
  };

  const goToday = () => {
    const n = new Date();
    setNavDir(n.getFullYear() > year || (n.getFullYear() === year && n.getMonth() > month) ? 1 : -1);
    onYearChange(n.getFullYear());
    onMonthChange(n.getMonth());
    onModeChange('month');
    onSelectDay(todayKey);
    setPulseToday(true);
    if (todayPulseTimer.current) window.clearTimeout(todayPulseTimer.current);
    todayPulseTimer.current = window.setTimeout(() => setPulseToday(false), 900);
  };

  return (
    <section className="ptl-cal" aria-label="Timeline calendar">
      <div className="ptl-cal-orbits" aria-hidden>
        <span />
        <span />
      </div>

      <header className="ptl-cal-head">
        <div className="ptl-cal-head-copy">
          <span className="ptl-cal-head-ico" aria-hidden>
            <CalendarDays size={18} strokeWidth={2.2} />
          </span>
          <div>
            <h2>Calendar</h2>
            <p>Browse your child&apos;s activities by date</p>
          </div>
        </div>

        <div className="ptl-cal-toolbar">
          <div className="ptl-cal-nav">
            <button
              type="button"
              className="ptl-cal-nav-btn"
              aria-label="Previous"
              onClick={() => (mode === 'month' ? shiftMonth(-1) : shiftYear(-1))}
            >
              <ChevronLeft size={18} />
            </button>
            <strong className="ptl-cal-title">
              {mode === 'month' ? `${MONTHS_LONG[month]} ${year}` : String(year)}
            </strong>
            <button
              type="button"
              className="ptl-cal-nav-btn"
              aria-label="Next"
              onClick={() => (mode === 'month' ? shiftMonth(1) : shiftYear(1))}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="ptl-cal-seg" role="group" aria-label="Calendar mode">
            <span
              className="ptl-cal-seg-pill"
              data-active={mode}
              aria-hidden
            />
            <button
              type="button"
              className={`ptl-cal-seg-btn${mode === 'month' ? ' is-active' : ''}`}
              aria-pressed={mode === 'month'}
              onClick={() => onModeChange('month')}
            >
              Month
            </button>
            <button
              type="button"
              className={`ptl-cal-seg-btn${mode === 'year' ? ' is-active' : ''}`}
              aria-pressed={mode === 'year'}
              onClick={() => onModeChange('year')}
            >
              Year
            </button>
          </div>

          <button type="button" className="ui-btn ui-btn-outline ptl-today-btn" onClick={goToday}>
            Today
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait" custom={navDir}>
        {mode === 'month' ? (
          <motion.div
            key={`m-${year}-${month}`}
            className="ptl-cal-month"
            custom={navDir}
            variants={monthMotion}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease }}
          >
            <div className="ptl-cal-dow" aria-hidden>
              {DOW.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>

            <div className="ptl-cal-grid">
              {cells.map((cell, i) =>
                cell ? (
                  <DayCell
                    key={cell.key}
                    cell={cell}
                    meta={dayMeta[cell.key]}
                    selected={cell.key === selectedDay}
                    isToday={cell.key === todayKey}
                    pulse={pulseToday && cell.key === todayKey}
                    onSelect={onSelectDay}
                  />
                ) : (
                  <span key={`pad-${i}`} className="ptl-cal-pad" aria-hidden />
                ),
              )}
            </div>

            {monthActivityTotal === 0 ? (
              <p className="ptl-cal-month-empty">
                No updates for this month. Select another date or browse another month.
              </p>
            ) : null}
          </motion.div>
        ) : (
          <motion.div
            key={`y-${year}`}
            className="ptl-cal-year"
            custom={navDir}
            variants={yearMotion}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease }}
          >
            {MONTHS_LONG.map((label, m) => {
              const count = yearCounts[m] || 0;
              return (
                <button
                  key={label}
                  type="button"
                  className={`ptl-cal-month-card${m === month ? ' is-selected' : ''}${count > 0 ? ' has-activity' : ''}`}
                  onClick={() => {
                    setNavDir(m >= month ? 1 : -1);
                    onMonthChange(m);
                    onModeChange('month');
                  }}
                >
                  <div className="ptl-cal-month-card-top">
                    <strong>{label}</strong>
                    <span>{MONTHS_SHORT[m]}</span>
                  </div>
                  <em>
                    {count === 0
                      ? 'No updates'
                      : `${count} activit${count === 1 ? 'y' : 'ies'}`}
                  </em>
                  {count > 0 ? (
                    <span className="ptl-cal-dots" aria-hidden>
                      {[...Array(Math.min(count, 4))].map((_, i) => (
                        <i key={i} />
                      ))}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {mode === 'month' ? (
        <aside className="ptl-cal-summary" aria-live="polite">
          <div className="ptl-cal-summary-main">
            <h3>{selectedLabel}</h3>
            <p>
              {selectedMeta?.count
                ? `${selectedMeta.count} activit${selectedMeta.count === 1 ? 'y' : 'ies'}`
                : 'No activity yet'}
            </p>
          </div>
          {selectedMeta && selectedMeta.types.length > 0 ? (
            <ul className="ptl-cal-summary-types">
              {selectedMeta.types.map((t) => {
                const Icon = ACTIVITY_ICON_MAP[t.icon] ?? LayoutGrid;
                return (
                  <li key={t.id}>
                    <span
                      className="ptl-cal-summary-ico"
                      style={{ background: t.bgColor, color: t.color }}
                      aria-hidden
                    >
                      <Icon size={14} strokeWidth={2.2} />
                    </span>
                    <span>
                      {t.count} {t.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="ptl-cal-summary-quiet">
              There are no updates for this date. Try another day on the calendar.
            </p>
          )}
        </aside>
      ) : null}
    </section>
  );
}

function DayCell({
  cell,
  meta,
  selected,
  isToday,
  pulse,
  onSelect,
}: {
  cell: Cell;
  meta?: DayActivityMeta;
  selected: boolean;
  isToday: boolean;
  pulse: boolean;
  onSelect: (key: string) => void;
}) {
  const count = meta?.count ?? 0;
  const types = meta?.types.slice(0, 3) ?? [];
  const extraTypes = (meta?.types.length ?? 0) - types.length;

  return (
    <motion.button
      type="button"
      className={`ptl-cal-day${selected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}${count > 0 ? ' has-activity' : ''}${pulse ? ' is-pulse' : ''}`}
      onClick={() => onSelect(cell.key)}
      aria-pressed={selected}
      aria-label={`${cell.label}${isToday ? ', today' : ''}${count ? `, ${count} updates` : ', no updates'}`}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.16 }}
    >
      <div className="ptl-cal-day-top">
        <span className="ptl-cal-day-num">{cell.label}</span>
        {isToday ? <em className="ptl-cal-today-badge">Today</em> : null}
      </div>

      {types.length > 0 ? (
        <div className="ptl-cal-day-icons" aria-hidden>
          {types.map((t) => {
            const Icon = ACTIVITY_ICON_MAP[t.icon] ?? LayoutGrid;
            return (
              <span
                key={t.id}
                className="ptl-cal-day-ico"
                style={{ background: t.bgColor, color: t.color }}
                title={t.name}
              >
                <Icon size={12} strokeWidth={2.3} />
              </span>
            );
          })}
          {extraTypes > 0 ? <span className="ptl-cal-day-more">+{extraTypes}</span> : null}
        </div>
      ) : (
        <div className="ptl-cal-day-icons is-empty" aria-hidden />
      )}

      <span className="ptl-cal-day-count">
        {count > 0 ? `${count} update${count === 1 ? '' : 's'}` : ''}
      </span>
    </motion.button>
  );
}
