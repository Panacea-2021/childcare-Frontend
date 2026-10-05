'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ShiftCard } from './ShiftCard';
import { StaffSidebar } from './StaffSidebar';
import { CalendarNavigation } from './CalendarNavigation';
import { BoardDecor } from './BoardDecor';
import type { ScheduleShift, ScheduleStaff } from './types';
import { addDays, monthBadge, toISODate, weekdayShort } from './mockData';

type Props = {
  weekStart: Date;
  staff: ScheduleStaff[];
  shifts: ScheduleShift[];
  onWeekChange: (next: Date) => void;
  onShiftClick?: (shift: ScheduleShift) => void;
};

function staffTotals(staffId: string, shifts: ScheduleShift[]) {
  const mine = shifts.filter((s) => s.staffId === staffId);
  let mins = 0;
  for (const s of mine) {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    mins += Math.max(0, eh * 60 + em - (sh * 60 + sm));
  }
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const hours = mins === 0 ? '0 Hours' : m ? `${h}h ${m}m` : `${h} Hours`;
  return { hours, count: mine.length };
}

const DateCircle = memo(function DateCircle({
  day,
  isToday,
  index,
}: {
  day: number;
  isToday: boolean;
  index: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`cal-day-circle ${isToday ? 'is-today-circle' : ''}`}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={
        reduce
          ? { opacity: 1 }
          : isToday
            ? { opacity: 1, y: [0, -2, 0], scale: [1, 1.04, 1] }
            : { opacity: 1, y: [0, -2.5, 0] }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : isToday
            ? {
                y: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 3.6, repeat: Infinity, ease: 'easeInOut' },
                delay: index * 0.04,
              }
            : {
                y: { duration: 4.2 + index * 0.15, repeat: Infinity, ease: 'easeInOut', delay: index * 0.12 },
                opacity: { duration: 0.35 },
              }
      }
      whileHover={reduce ? undefined : { scale: 1.1, boxShadow: '0 10px 24px rgba(93, 95, 239, 0.22)' }}
    >
      {day}
      {!reduce && isToday ? <span className="cal-day-pulse-ring" /> : null}
    </motion.div>
  );
});

const MonthBadge = memo(function MonthBadge({ label }: { label: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className="cal-month-badge"
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={
        reduce
          ? { opacity: 1 }
          : {
              opacity: 1,
              scale: [1, 1.03, 1],
              boxShadow: [
                '0 2px 8px rgba(93, 95, 239, 0.1)',
                '0 4px 16px rgba(93, 95, 239, 0.22)',
                '0 2px 8px rgba(93, 95, 239, 0.1)',
              ],
            }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : {
              scale: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
              boxShadow: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
            }
      }
      whileHover={reduce ? undefined : { scale: 1.08 }}
    >
      <span className="cal-month-badge-ico" aria-hidden>
        <Sparkles size={11} />
      </span>
      {label}
      {!reduce ? <span className="cal-month-spark" aria-hidden /> : null}
    </motion.span>
  );
});

const StaffRow = memo(function StaffRow({
  person,
  days,
  shifts,
  todayIso,
  onShiftClick,
}: {
  person: ScheduleStaff;
  days: Date[];
  shifts: ScheduleShift[];
  todayIso: string;
  onShiftClick?: (shift: ScheduleShift) => void;
}) {
  const totals = staffTotals(person.id, shifts);
  return (
    <>
      <div className="cal-staff-cell">
        <StaffSidebar person={person} hoursLabel={totals.hours} shiftCount={totals.count} />
      </div>
      {days.map((day) => {
        const iso = toISODate(day);
        const dow = day.getDay();
        const weekend = dow === 0 || dow === 6;
        const dayShifts = shifts.filter((s) => s.staffId === person.id && s.date === iso);
        const isToday = iso === todayIso;
        return (
          <div
            key={`${person.id}-${iso}`}
            className={`cal-cell ${weekend ? 'is-weekend' : ''} ${isToday ? 'is-today' : ''}`}
          >
            {isToday ? <span className="cal-today-glow" aria-hidden /> : null}
            <span className="cal-cell-shimmer" aria-hidden />
            <div className="cal-cell-stack">
              {dayShifts.map((shift, i) => (
                <ShiftCard key={shift.id} shift={shift} index={i} onClick={onShiftClick} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
});

export function ScheduleBoard({ weekStart, staff, shifts, onWeekChange, onShiftClick }: Props) {
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const todayIso = toISODate(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollX, setScrollX] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reduce) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollX(el.scrollLeft));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
    };
  }, [reduce]);

  if (!staff.length) return null;

  return (
    <motion.section
      className="cal-board cal-board--alive"
      aria-label="Staff schedule board"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.4 }}
    >
      <BoardDecor scrollX={scrollX} />
      <div className="cal-board-scroll" ref={scrollRef}>
        <div className="cal-board-grid" role="table" aria-label="Weekly staff schedule">
          <div className="cal-corner" role="columnheader">
            <MonthBadge label={monthBadge(weekStart)} />
            <CalendarNavigation weekStart={weekStart} onWeekChange={onWeekChange} />
          </div>

          {days.map((day, i) => {
            const iso = toISODate(day);
            const dow = day.getDay();
            const isToday = iso === todayIso;
            return (
              <div
                key={iso}
                className={`cal-day-head ${isToday ? 'is-today' : ''} ${dow === 0 || dow === 6 ? 'is-weekend' : ''}`}
                role="columnheader"
              >
                {isToday ? <span className="cal-today-col-wash" aria-hidden /> : null}
                <DateCircle day={day.getDate()} isToday={isToday} index={i} />
                <span className="cal-day-dow">{weekdayShort(day)}</span>
              </div>
            );
          })}

          {staff.map((person) => (
            <StaffRow
              key={person.id}
              person={person}
              days={days}
              shifts={shifts}
              todayIso={todayIso}
              onShiftClick={onShiftClick}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
